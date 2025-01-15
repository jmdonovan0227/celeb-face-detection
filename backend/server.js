import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import bcrypt from 'bcrypt';
import cors from 'cors';
import knex from 'knex';
import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import decrypt from './decryption/decryption.js';
import multer from 'multer';
import helmet from 'helmet';
import morgan from 'morgan';
import { handleImageGet, handleFaceApiCall } from './controllers/image.js';
import { signInAuthentication } from './controllers/signin.js';
import { 
        handleProfileGetById, 
        handleProfileDeletion, 
        handleProfilePicUpdate,
        handleGetSignedProfilePic,
        handleProfilePicDeletion,
        handleProfileUpdate
} from './controllers/profile.js';
import { handleRegister } from './controllers/register.js';
import { forgotPassword, resetPassword } from './controllers/password.js';
import { requireAuth } from './controllers/authorization.js';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
dotenv.config();
const app = express();
app.use(bodyParser.json());
app.use(helmet());
app.use(morgan('combined'));

const whiteList = [process.env.ALLOWED_ORIGIN_1, process.env.ALLOWED_ORIGIN_2];
const corsOptions = {
        origin: function (origin, callback) {
                if(whiteList.indexOf(origin) !== -1) {
                        callback(null, true);
                }

                else {
                        callback(new Error('Not allowed by CORS'));
                }
        }
}

app.use(cors(corsOptions));

let db = null;

if (process.env.NODE_ENV === 'testing' || process.env.NODE_ENV === 'development') {
        db = knex({
                client: 'pg',
                connection: {
                        host: process.env.POSTGRES_HOST,
                        port: process.env.POSTGRES_PORT,
                        user: process.env.APP_USER,
                        password: process.env.APP_PASSWORD,
                        database: process.env.POSTGRES_DB
                }
        });
}

else if(process.env.NODE_ENV === 'production') {
        db = knex({
                client: 'pg',
                connection: process.env.PG_USER_URI
        });
}

const PORT = process.env.PORT;

app.post('/api/signin', (req, res) => { signInAuthentication(req, res, db, bcrypt) });

app.get('/api/upload/signedurl', requireAuth, (req, res) => { handleGetSignedProfilePic(req, res, db) });

app.delete('/api/upload/deletepic', requireAuth, (req, res) => { handleProfilePicDeletion(req, res, db) });

app.put('/api/profile', requireAuth, (req, res) => { handleProfileUpdate(req, res, db) });

// dependency injection we are injecting whatever dependencies handleRegister needs
app.post('/api/upload/picture', requireAuth, upload.single('image'), (req, res) => { handleProfilePicUpdate(req, res, db)});

app.post('/api/register', (req, res) => { handleRegister(req, res, db, bcrypt, decrypt, nodemailer, google) });

app.get('/api/profile/:id', requireAuth, (req, res) => { handleProfileGetById(req, res, db) });

app.put('/api/image', requireAuth, (req, res) => { handleImageGet(req, res, db) });

app.post('/api/faceurl', requireAuth, upload.single('image'), (req, res) => { handleFaceApiCall(req, res, db) });

app.delete('/api/delete', requireAuth, (req, res) => { handleProfileDeletion(req, res, db, bcrypt) });

app.post('/api/forgot_password', (req, res) => { forgotPassword(req, res, db, decrypt, nodemailer, google)});

app.post('/api/reset_password', (req, res) => { resetPassword(req, res, db, bcrypt)});

app.listen(PORT, () => {
    console.log(`App is running on port ${PORT}`);
});