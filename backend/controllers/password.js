import crypto from 'crypto';

function generateResetToken() {
    return crypto.randomBytes(32).toString('hex');
}

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

export const forgotPassword = async (req, res, db, decrypt, nodemailer, google) => {
    const { email } = req.body;
    
    if(process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'testing') {
        try {
            const user = await db('login').where('email', '=', email).first();
            if(!user) {
                return res.status(404).json('Email not found');
            }
    
            const token = generateResetToken();
            const expiration = new Date(Date.now() + 3600000); // 1 hour
    
            await db('login').where('id', '=', user.id).update({reset_token: token, reset_expiration: expiration});
            const resetUrl = `${process.env.APP_URL}/reset_password?token=${token}`;
    
            try {
                const emailTransporter = await createTransporter(nodemailer, google);
    
                const mailOptions = {
                    from: process.env.EMAIL,
                    to: email,
                    subject: 'CFD Password Reset Request',
                    text: `Click the following link to reset your password: ${resetUrl}`
                };
        
                await emailTransporter.sendMail(mailOptions);
            } catch(error) {
                return res.json('Password reset request has not been submitted');
            }
    
            // don't break the application if this fails!
            res.json('Password reset request has been submitted');
        } catch(error) {
            res.status(500).json('Internal Server Error');
        }
    }

    else {
        res.json('Password reset request has not been submitted');
    }
};


export const resetPassword = async(req, res, db, bcrypt) => {
    const { token, password } = req.body;

    try {
        const user = await db('login').where("reset_token", "=", token).first();
        if(!user || new Date() > user.reset_expiration) {
            return res.status(400).json('Invalid or expired token');
        }

        const minLength = 14;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /[0-9]/.test(password);
        const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        if(password.length < minLength || !hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChars) {
            return res.status(400).json('Invalid password');
        }

        const hashedPassword = bcrypt.hashSync(password, 10);
        
        await db('login').where("id", "=", user.id).update({
             hash: hashedPassword, 
             reset_token: null, 
             reset_expiration: null
        });

        res.json('Your password has been updated!');
    } catch(error) {
        res.status(500).json('Internal Server error');     
    }
};