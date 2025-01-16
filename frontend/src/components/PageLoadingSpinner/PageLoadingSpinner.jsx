import React from 'react';
import './PageLoadingSpinner.css';

const PageLoadingSpinner = ({ pageName = "standard" }) => {
    return (
        <div className={pageName === "standard" ? 'article' : pageName === "home" ? 'test-x' : 'article'} aria-label='page-loading-container'>
            <div className='page-loader' aria-label='page-loading-spinner'></div>
        </div>
    );
};

export default PageLoadingSpinner;