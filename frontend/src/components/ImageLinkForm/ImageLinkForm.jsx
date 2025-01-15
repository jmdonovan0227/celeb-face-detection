import React from 'react';
import './ImageLinkForm.css';

const ImageLinkForm = ({ onInputChange, onButtonSubmit, readyToDetectImages, input }) => {
    return (
        <div className='image-link-container'>
            <div className='ready-to-detect-span'>
                <span role='ready-to-detect-text'>
                    Ready To Detect Celebrities: {readyToDetectImages ? '✔️' : '❌'}
                </span>
            </div>

            <div className='find-celebrities-container'>
                    <input className='search-input' type='text' aria-label='insert-url-here' onChange={onInputChange} value={input} placeholder='Enter an image url here...' />
                    <div className='buttons'>
                        <label className={!input ? 'upload-button-label-style' : 'error-button-label-style'} htmlFor='upload_button'>Upload</label>
                        <input
                            role='upload-pictures' 
                            type='file' 
                            className='upload-button-style' 
                            name='upload_button' 
                            id='upload_button' 
                            onChange={onInputChange} 
                            disabled={input}
                            accept='image/*'
                        />
                        <button className='detect-button-style' disabled={!readyToDetectImages} onClick={onButtonSubmit}>Detect</button>
                    </div>
            </div>
        </div>
    )
}

export default ImageLinkForm;