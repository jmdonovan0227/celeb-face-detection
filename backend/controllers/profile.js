import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dotenv from 'dotenv';
dotenv.config();
import crypto from 'crypto';
import redisClient from './signin.js';
const bucketName = process.env.S3_BUCKET_NAME;
const region = process.env.S3_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;


const s3Client = new S3Client({
    region,
    credentials: {
        accessKeyId,
        secretAccessKey
    }
});

const generateFileName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');

const createTransporter = async(nodemailer, google) => {
    const OAuth2 = google.auth.OAuth2;

    const oauth2Client = new OAuth2(
        process.env.G_CLIENT_ID,
        process.env.G_CLIENT_SECRET,
        // redirect uri
        process.env.G_URL
    );

    oauth2Client.setCredentials({
        refresh_token: process.env.REFRESH_TOKEN
    });

    const accessToken = await new Promise((resolve, reject) => {
        oauth2Client.getAccessToken((err, token) => {
            if(err) {
                reject();
            }

            resolve(token);
        });
    });

    const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_PROVIDER,
        auth: {
            type: process.env.TYPE,
            user: process.env.EMAIL,
            accessToken,
            clientId: process.env.G_CLIENT_ID,
            clientSecret: process.env.G_CLIENT_SECRET,
            refreshToken: process.env.REFRESH_TOKEN
        }
    });

    return transporter;
};

export const handleProfilePicUpdate = async(req, res, db) => {
    const { authorization } = req.headers;

    if(!authorization) {
        return res.status(400).json('unauthorized');
    }

    const id = await redisClient.get(authorization);

    if(req && req.file && id) {
        const file = req.file;
        const fileName = generateFileName();

        const uploadParams = {
            Bucket: bucketName,
            Body: file.buffer,
            Key: fileName,
            ContentType: file.mimetype
        };

        // update profile picture image key so we can reference our stored s3 image
        await db('users').where('id', '=', id ).update({ image_key: fileName });

        // upload to s3
        await s3Client.send(new PutObjectCommand(uploadParams));

        // update db user (with token id)
        // res.send if you have an issue!
        res.json('success!');
    }

    else {
        res.status(400).json('Unable to update profile pic');
    }
};

export const handleGetSignedProfilePic = async(req, res, db) => {
    // we don't need to store the signed urls, there are temporary and the key is the only thing that matters
    // in terms of getting a valid image url.
    const { authorization } = req.headers;

    if(!authorization) {
        return res.status(400).json('unauthorized');
    }

    const id = await redisClient.get(authorization);

    if(id) {
        const response = await db.select('image_key').from('users').where('id', '=', id);
        const imageKey = response[0].image_key;

        if(imageKey) {
            const imageUrl = await getSignedUrl(
                s3Client,
                new GetObjectCommand({
                    Bucket: bucketName,
                    Key: imageKey
                }),
                { expiresIn: 60 } // 60 seconds
            );

            res.json({ imageUrl });
        }

        else {
            res.status(400).json('Error getting image url');
        }
    }

    else {
        res.status(400).json('Unauthorized');
    }
};

export const handleProfilePicDeletion = async(req, res, db) => {
    // use the image key to delete the image from the s3 bucket, this ensure when users update their profile pic
    // that we also remove any lingering images in the bucket.
    const { authorization } = req.headers;

    if(!authorization) {
        return res.status(400).json('unauthorized');
    }

    const id = await redisClient.get(authorization);
    const response = await db.select('image_key').from('users').where('id', '=', id);
    const imageKey = response[0].image_key;

    if(id && imageKey) {
        // remove image key from db user
        await db('users').where('id', '=', id).update('image_key', null);

        const deleteParams = {
            Bucket: bucketName,
            Key: imageKey
        };

        await s3Client.send(new DeleteObjectCommand(deleteParams));
        res.json('success!');
    } 
    
    else {
        res.json('Not modified');
    }
};

// create a function to handle POST /api/profile/:id => updates profile fields when called via profile page (name, and age).
export const handleProfileUpdate = async(req, res, db) => {
    if(req.body) {
        const { name, age } = req.body;
        const { authorization } = req.headers;

        if(!authorization) {
            return res.status(401).json('unauthorized');
        }

        const numbersRegex = /[0-9]/;
        const specialCharsRegex = /[!@#$%^&*(),.?":{}|<>]/;
        const whiteSpaceRegex = /\s/;
        const whiteSpaceCount = name.split(' ').length - 1;
        const charactersRegex = /[A-Za-z]/;

        if(numbersRegex.test(name) || specialCharsRegex.test(name) || whiteSpaceCount > 1 || whiteSpaceRegex.test(age) || specialCharsRegex.test(age) || charactersRegex.test(age)) {
            return res.status(400).json('unable to update profile');
        }

        const id = await redisClient.get(authorization);

        if(!id) {
            return res.status(401).json('unauthorized');
        }

        const response = await db.select('name', 'age').from('users').where({ id });
        const userInfo = response[0];

        if(!name && !age) {
            res.status(400).json('unable to update profile');
        }

        else if(name && age === userInfo.age && userInfo.name !== name) {
            // update only name
            await db('users').where('id', '=', id).update({ name });
            res.json('success!');
        }

        else if(name && age && userInfo.name === name && userInfo.age !== age) {
            // update only age
            await db('users').where('id', '=', id).update({ age });
            res.json('success!');
        }

        else if(name && age && userInfo.name !== name && userInfo.age !== age) {
            // update both
            await db('users').where('id', '=', id).update({ name, age });
            res.json('success!');
        }

        else {
            res.json('Not modified');
        }
    }

    else {
        res.status(400).json('Unable to update profile');
    }
};

export const handleProfileGetById = async(req, res, db) => {
    const { id } = req.params;
    const hasImageKey = await db.select('image_key').where({ id }).from('users');

    // don't need res.json because we are not sending through HTTP
    db.select('name', 'entries', 'joined', 'age').from('users').where({
        id: id
    }).then(user => {
        if(user.length && hasImageKey[0].image_key) {
            res.json(Object.assign(user[0], { image_key: true }));
        }

        else if(user.length && !hasImageKey[0].image_key) {
            res.json(Object.assign(user[0], { image_key: false }));
        }

        else {
            res.status(400).json('Error getting user');
        }
    })
    .catch(err => res.status(400).json('Error getting user'));
};

export const handleProfileDeletion = async(req, res, db, bcrypt, nodemailer, google) => {
    const { authorization } = req.headers;
    const { email, password } = req.body;

    if(!authorization) {
        return res.status(401).json({ error: true });
    }

    const id = await redisClient.get(authorization);

    if(id) {
        // process account deletion
        db.transaction(trx =>  {
            return trx
            .select('*')
            .from('login')
            .where('email', '=', email)
            .then(data => {
                const isValid = bcrypt.compareSync(password, data[0].hash);

                if(isValid) {
                    // now we need to delete first from login
                    return trx('login')
                    .where('email', '=', data[0].email)
                    .del()
                    .returning('email')
                    .then(userEmail => {
                        return trx('users')
                        .where('email', '=', userEmail[0].email)
                        .del()
                        .returning('*')
                        .then(async(data) => {
                            if(process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'testing') {
                                try {
                                    const name = data[0].name;
                                    const emailTransporter = await createTransporter(nodemailer, google);
                        
                                    const mailOptions = {
                                        from: process.env.EMAIL,
                                        to: email,
                                        subject: 'CFD Account Deletion Confirmation',
                                        text: `Thank you for trying Celebrity Face Detection, ${name}! This message confirms your account has been successfully deleted.`
                                    };
                            
                                    await emailTransporter.sendMail(mailOptions);
                                } catch(error) {
                                    return res.json('Account deletion confirmation email could not be sent.');
                                }
                            }
                                                          
                            res.json({ success: true });
                        })
                        .catch(err => res.status(400).json({ error: true }))
                    }).catch(err => res.status(400).json({ error: true }))
                }
                else {
                    res.status(400).json({ error: true });
                }
            })
            .then(trx.commit)
            .catch(trx.rollback);
        }).catch(err => res.status(400).json({ error: true }));
    }
};