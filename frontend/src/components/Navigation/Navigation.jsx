import React, { useState, useEffect } from 'react';
import { Link, Outlet } from 'react-router-dom';
import ProfileIcon from '../Profile/ProfileIcon';
import './Navigation.css';

const Navigation = ({ onRouteChange, isSignedIn, toggleModal, toggleDeleteModal, profile_picture }) => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    const updateOnlineStatus = (value) => {
        setIsOnline(value);
    };

    useEffect(() => {
        window.addEventListener('online', () => {
            updateOnlineStatus(true);
        });
        window.addEventListener('offline', () => {
            updateOnlineStatus(false);
        });
    }, []);

    if(isSignedIn) {
        return (
            <div className='navigation-container'>
                <nav className={isOnline ? 'icon-container' : 'offline-container'}>
                    <ProfileIcon onRouteChange={onRouteChange} toggleModal={toggleModal} toggleDeleteModal={toggleDeleteModal} profile_picture={profile_picture} />
                </nav>

                <div className='child-routes-container'>
                    <Outlet />
                </div>
            </div>
        );
    }
    else {
        return (
            <div className='navigation-container'>
                <nav className={isOnline ? 'navigation-links-container' : 'offline-container'}>
                    <Link to='/' aria-label='signin_link' style={{textDecoration: 'none'}}><p className='navigation-links-styling' aria-label='signin_text' onClick={() => onRouteChange('signin')}>Sign In</p></Link>
                    <Link to="/" aria-label='register_link' style={{textDecoration: 'none'}}><p className='navigation-links-styling' aria-label='register_text' onClick={() => onRouteChange('register')}>Register</p></Link>
                </nav>
                <div className='child-routes-container'>
                    <Outlet />
                </div>
            </div>
        );
    }
}

export default Navigation;