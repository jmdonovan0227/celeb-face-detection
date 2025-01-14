import redisClient from './signin.js';

export const requireAuth = async(req, res, next) => {
    const { authorization } = req.headers;
    if(!authorization) {
        return res.status(401).json('Unauthorized');
    }

    const response = await redisClient.get(authorization);

    if(response) {
        return next();
    }

    res.status(401).json('Unauthorized');
}