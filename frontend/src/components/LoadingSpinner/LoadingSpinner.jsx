import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = () => {
    return (
        <div className='loader-container' aria-label='loading-container'>
            <div className='loader' aria-label='loading-spinner'></div>
        </div>
    );
};

export default LoadingSpinner;