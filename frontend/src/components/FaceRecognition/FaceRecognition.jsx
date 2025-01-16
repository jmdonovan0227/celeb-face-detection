import React, { useState, useEffect } from 'react';
import CompLoadingSpinner from '../CompLoadingSpinner/CompLoadingSpinner';
import './FaceRecognition.css';

// setting height to auto will automatically adjust the height based on width to keep picture at a fixed size
// but not make the image look squished
const FaceRecognition = ({ imageUrl, boxes, parentRef, toggleImage, error, text }) => {
    const [isImageLoading, setIsImageLoading] = useState(true);


    useEffect(() => {
        setIsImageLoading(true);
    }, [imageUrl]);

    const handleImageLoad = () => {
        setIsImageLoading(false);
    }

    return (
        <div className='image-link-container'>
            <div className='toggle-recognized-container' onClick={toggleImage} aria-label='reset-image-button'>&times;</div>

            <div className='celebs-names-container'>
                {
                    !error && !text ? <CompLoadingSpinner /> :
                        error ? <p className='names-style' role='error-span'>Sorry, I wasn't able to detect any faces...</p>
                        : <p className='names-style' role='valid-span'>{text}</p>
                }
            </div>

            <div className='celebs-image-container' ref={parentRef}>
                    <img onLoad={handleImageLoad} alt='show-user-inserted-image' aria-label='show-user-inserted-image' id='input-image' src={imageUrl} style={{ opacity: isImageLoading ? 0 : 1 }}/>
                    { !isImageLoading ?
                        boxes.boxesArray.map((box, idx) => {
                            return ( 
                                <div key={idx} className='bounding-box' style={{top: box.topRow, right: box.rightCol, bottom: box.bottomRow, left: box.leftCol }}></div> 
                            );
                        })
                        : null
                    }
            </div>
        </div>
    );
};

export default FaceRecognition;