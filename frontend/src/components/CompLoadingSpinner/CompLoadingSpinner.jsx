import React from 'react';
import './CompLoadingSpinner.css';

const CompLoadingSpinner = ({ componentName = "standard" }) => {
    return (
        <div className={ componentName === "standard" ? 'comp-loading-container-std' : componentName === "profile" ? 'comp-loading-container-alt' : 'comp-loading-container-std'} aria-label='comp-loading-container'>
            <div className='comp-loader' aria-label='comp-loading-spinner'></div>
        </div>
    );
};

export default CompLoadingSpinner;