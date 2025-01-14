import fetch from 'node-fetch';
import redisClient from './signin.js';

export const handleFaceApiCall = async (req, res, db) => {
    let IMAGE_BYTES = '';

    if(req.file) {
        const base64String = req.file.buffer.toString('base64');
        IMAGE_BYTES = base64String;
    } else {
        IMAGE_BYTES = req.body.image;
    }

    const returnClarifaiRequestOptions = (imageUrl) => {
        const PAT = process.env.CLARIFAI_APP_PAT;
        const USER_ID = process.env.CLARIFAI_USER_ID;
        const APP_ID = process.env.CLARIFAI_APP_ID;
        const IMAGE_URL = imageUrl;
        const imageOptions = req.file ? {"base64": IMAGE_URL} : {"url": IMAGE_URL};
        
        const raw = JSON.stringify({
          "user_app_id": {
              "user_id": USER_ID,
              "app_id": APP_ID
          },
          "inputs": [
              {
                  "data": {
                    "image": imageOptions
                  }
              }
          ]
        });
      
        return {
          method: 'POST',
          headers: {
              'Accept': 'application/json',
              'Authorization': 'Key ' + PAT
          },
          body: raw
        };
      };

      const requestOptions = returnClarifaiRequestOptions(IMAGE_BYTES);

      try {
        const celebFdApi = process.env.CLARIFAI_CELEBFD_API;
        const cfdPromise = fetch(`${celebFdApi}`, requestOptions);
        const cfdResponse = await Promise.resolve(cfdPromise);

        if(!cfdResponse.ok) {
            res.status(400).json('could not detect any faces');
        }

        const cfdInfo = await cfdResponse.json();
        res.json({ cfdInfo });
    } catch(err) {
        res.status(400).json('we encountered an error when calling apis');
    }
};


export const handleImageGet = async(req, res, db) => {
    const { authorization } = req.headers;
    const id = await redisClient.get(authorization);

    db('users').where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries => {
        res.json(entries[0].entries);
    })
    .catch(err => res.status(400).json('Unable to get entries'));
};