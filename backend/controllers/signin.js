import jwt from 'jsonwebtoken';
import { createClient } from 'redis';
const redisClient = createClient({ url: process.env.REDIS_URI });
redisClient.on('error', (error) => console.log(error));
await redisClient.connect();

const handleSignIn = (req, res, db, bcrypt) => {
    const { email, password } = req.body;

    if(!email || !password) {
        return Promise.reject('Invalid credentials');
    }

    return db.select('email', 'hash').from('login')
    .where('email', '=', email)
    .then(data => {
        if(data.length === 0) {
            return Promise.reject('Invalid credentials');
        }
        
        const isValid = bcrypt.compareSync(password, data[0].hash);
        if(isValid) {
            return db.select('*').from('users').where('email', '=', email)
            .then(user => user[0])
            .catch(error => Promise.reject('Invalid credentials'))
        } else {
             return Promise.reject('Invalid credentials')
        }
    })
    .catch(error => Promise.reject('Invalid credentials'));
};

const getAuthTokenId = async(req, res) => {
    const { authorization } = req.headers;
    const value = await redisClient.get(authorization);
    res.json({ userId: Number(value) });
};

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

export const signInAuthentication = (req, res, db, bcrypt) => {
    const { authorization } = req.headers;
    return authorization ? 
        getAuthTokenId(req, res) :
        handleSignIn(req, res, db, bcrypt)
        .then(data => {
            return data.id && data.email ? createSessions(data) : Promise.reject('Invalid credentials');
        })
        .then(session => res.json(session))
        .catch(error => res.status(400).json(error));
};

export default redisClient;