import { promises as dnsPromises }  from 'dns';
import redisClient from './signin.js';
import jwt from 'jsonwebtoken';
import fs from 'fs';

async function checkEmailDomain(email) {
    // get domain name from email
    const domain = email.split('@')[1];

    // check to see if domain name from email such as gmail.com is able to receive emails by checking mx records
    try {
        // see if this domain can receive emails by checking mx records
        const records = await dnsPromises.resolveMx(domain);
        if(!records || records.length === 0) {
            return false;
        }
        else {
            return true;
        }
    } catch(error){
        return false;
    }
}

const signToken = (email) => {
    const jwtPayload = { email };
    // can be hard to revoke jwt token when user signs out when we set a date here
    // we are going to use redis to make this easier.
    return jwt.sign(jwtPayload, process.env.JWT_SECRET, { expiresIn: '2 days'});
};

const setToken = (key, value) => {
    return Promise.resolve(redisClient.set(key, value));
};

const createSessions = async(user) => {
    // JWT token
    const { email, id } = user;
    const token = signToken(email);
    return setToken(token, id)
        .then(() => { 
            return { userId: id, success: 'true', token };
        })
        .catch(error => Promise.reject('Invalid credentials'));
};


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


export const handleRegister = async(req, res, db, bcrypt, decrypt, nodemailer, google) => {
    const { email, name, password } = req.body;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,}$/;
    const upperCaseRegex = /[A-Z]/;
    const lowerCaseRegex = /[a-z]/;
    const numbersRegex = /[0-9]/;
    const specialCharsRegex = /[!@#$%^&*(),.?":{}|<>]/;
    const whiteSpaceRegex = /\s/;
    const minLength = 14;
    const whiteSpaceCount = name.split(' ').length - 1;

    if(!email || !name || !password) {
        return res.status(400).json('Invalid Registration');
    }

    // check if name is valid
    else if(name.length === 1) {
        return res.status(400).json('Invalid Registration');
    }

    else if(numbersRegex.test(name) || specialCharsRegex.test(name)) {
        return res.status(400).json('Invalid Registration');
    }

    else if(whiteSpaceCount > 1) {
        return res.status(400).json('Invalid Registration');
    }

    else if (!emailRegex.test(email)) {
        return res.status(400).json('Invalid Registration');
    }

    // check password
    else if(password.length < minLength || !upperCaseRegex.test(password) || !lowerCaseRegex.test(password) || !numbersRegex.test(password) || !specialCharsRegex.test(password) || whiteSpaceRegex.test(password)) {
        return res.status(400).json('Invalid Registration');
    }

    else {
        const isValidEmail = await checkEmailDomain(email);

        if(isValidEmail) {
            const saltRounds = 10;
            const hash = bcrypt.hashSync(password, saltRounds);

            db.transaction(trx => {
                trx.insert({
                    hash: hash,
                    email: email
                })
                .into('login')
                .returning('email')
                .then(loginEmail => {
                    return trx('users')
                    // .returning('*') means after we insert our user below return all columns
                    .returning('*')
                    .insert({
                        email: loginEmail[0].email,
                        name: name,
                        joined: new Date()
                    })
                    .then(async(user) => {
                        const session = await createSessions(user[0]);
                        const { name, entries, joined, age } = user[0];

                        if(process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'testing') {
                            // next try sending a welcome message with the welcome.html
                            fs.readFile('./welcome/welcome.html', 'utf8', async(err, data) => {
                                if(err) {
                                    return res.status(400).json('Invalid Registration');
                                }

                                else {
                                    try {
                                        const emailTransporter = await createTransporter(nodemailer, google);
                                        await emailTransporter.sendMail({
                                            subject: `Welcome to Celebrity Face Detection, ${name}!`,
                                            text: 'Hello! I just wanted to thank you for trying Celebrity Face Detection. I hope you have a great experience with the application. I plan on adding more features, so be on the lookout for updates in the future :). Please Note: This is portfolio project. I will not be sending any further updates at this time. All current users will be notified if I do decide to email updates with the option to subscribe. Thank you :).',
                                            to: email,
                                            html: data,
                                            from: process.env.EMAIL
                                        });
                                    } catch(error) {
                                        console.log('error sending email');
                                    }

                                    // We don't want to break the application if this functionality fails
                                    res.json({ user: { name: name, entries: entries, joined: joined, age: age }, session });
                                }
                            });
                        } 
                        
                        else {
                            res.json({ user: { name: name, entries: entries, joined: joined, age: age }, session });
                        }
                    })
                }).then(trx.commit)
                .catch(trx.rollback);
            }).catch(error => {
                return res.status(400).json('Invalid Registration')
            });
        }

        else {
            res.status(400).json('Invalid Registration');
        }
    }
};