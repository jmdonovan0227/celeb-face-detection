import React from 'react';
import './PageLoadingSpinner.css';

const PageLoadingSpinner = () => {
    return (
        <div className='page-container' aria-label='page-loading-container'>
            <div className='page-loader' aria-label='page-loading-spinner'></div>
        </div>
    );
};

export default PageLoadingSpinner;