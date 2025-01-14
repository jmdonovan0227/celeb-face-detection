import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { APP_URL } from '../../config.js';
import './ResetPassword.css';

const useQuery = () => {
    return new URLSearchParams(useLocation().search);
};

const ResetPassword = ({ isSignedIn }) => {
    const navigate = useNavigate();
    const [password_first_attempt, setPasswordFirst] = useState('');
    const [password_second_attempt, setPasswordSecond] = useState('');
    const [error_text, setErrorText] = useState('');
    const [errorState, setErrorState] = useState(false);
    const [passwordsValid, setPasswordsValid] = useState(false);
    const [passwordsMatch, setPasswordsMatch] = useState(false);
    const [passwordReset, setPasswordReset] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const query = useQuery();
    const token = query.get('token');

    useEffect(() => {
        if(isSignedIn) {
            navigate('/');
        }
    }, [isSignedIn]);

    const onFirstPasswordChange = (event) => {
        setPasswordFirst(event.target.value);
    };

    const onSecondPasswordChange = (event) => {
        setPasswordSecond(event.target.value);
    };

    const onPasswordButtonClick = () => {
        setShowPassword(!showPassword);
    };

    const onSubmitResetPassword = () => {
        if (passwordReset) {
            return;
        }

        if (password_first_attempt === password_second_attempt) {
            const minLength = 14;
            const hasUpperCase = /[A-Z]/.test(password_first_attempt);
            const hasLowerCase = /[a-z]/.test(password_first_attempt);
            const hasNumbers = /[0-9]/.test(password_first_attempt);
            const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password_first_attempt);
            const whiteSpaceRegex = /\s/;

            if (password_first_attempt.length < minLength || !hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChars || whiteSpaceRegex.test(password_first_attempt)) {
                setErrorText('Passwords must be at least 14 characters long and have at least 1 upper case letter, lower case letter, number, and special character');
                setErrorState(true);
            } else {
                fetch(`${APP_URL}/api/reset_password`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        token: token,
                        password: password_first_attempt
                    })
                }).then(response => {
                    if (response.ok) {
                        return response.json();
                    } else {
                        setErrorText('Error resetting password');
                        setErrorState(true);
                    }
                }).then(data => {
                    if (data) {
                        setPasswordReset(true);
                        setErrorText('');
                        setErrorState(false);
                    } else {
                        setErrorText('Error resetting password');
                        setErrorState(true);
                    }
                }).catch(error => {
                    setErrorText(error.message);
                    setErrorState(true);
                });
            }
        } else {
            setErrorText('Passwords must match');
            setErrorState(true);
        }
    };

    useEffect(() => {
        if (password_first_attempt === password_second_attempt) {
            setPasswordsMatch(true);

            const minLength = 14;
            const hasUpperCase = /[A-Z]/.test(password_first_attempt);
            const hasLowerCase = /[a-z]/.test(password_first_attempt);
            const hasNumbers = /[0-9]/.test(password_first_attempt);
            const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password_first_attempt);
            const whiteSpaceRegex = /\s/;

            if (password_first_attempt.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChars && !whiteSpaceRegex.test(password_first_attempt)) {
                setPasswordsValid(true);
            } else {
                setPasswordsValid(false);
            }
        } else {
            setPasswordsMatch(false);
        }
    }, [password_first_attempt, password_second_attempt]);

    return (
        <article className="article">
            <main>
                <div className="main-content">
                    <fieldset id="sign_up">
                        <legend className="centerPageElements passwords-header-styling">Reset Password</legend>
                        <div className="spaceInputFields">
                            <label htmlFor="password1">New Password</label>
                            <input onChange={onFirstPasswordChange} role='password-input' className="input-fields" type={showPassword ? 'text' : 'password'} name="password1" id="password1" autoComplete='off' />
                        </div>
                        <div className="spaceInputFields">
                            <label htmlFor="password2">Retype Password</label>
                            <input onChange={onSecondPasswordChange} role='password-input' className="input-fields" type={showPassword ? 'text' : 'password'} name="password2" id="password2" autoComplete='off' />
                        </div>
                    </fieldset>
                    <div className='submit-container'>
                        <div className='passwords-valid'>
                            <div>
                                <p aria-label='pw-match'><strong>Passwords Match:</strong> {passwordsMatch ? 'True' : 'False'}</p>
                            </div>
                            <div>
                                <p aria-label='pw-valid'><strong>Valid Passwords:</strong> {passwordsValid ? 'True' : 'False'}</p>
                            </div>
                        </div>
                        <div className='reset-buttons-container'>
                            <button onClick={onPasswordButtonClick} aria-label='show-hide-button' className='style-buttons'>{showPassword ? 'Hide Password' : 'Show Password'}</button>
                            <input onClick={onSubmitResetPassword} disabled={passwordReset} aria-label='reset-button' className="style-buttons" type="submit" value="Submit" />
                        </div>
                    </div>
                </div>

                <div className='error-content'>
                    <div className='response-container'>
                        { passwordReset ?
                            <p className='success-text' aria-label='pw-reset-success-text' style={{color: 'green'}}>Password successfully reset!</p>
                            : ( errorState ? <p className='error-text' aria-label='pw-reset-failure-text'>{error_text}</p> : null )
                        }   
                    </div>
                </div>
            </main>
        </article>
    );
};

export default ResetPassword;
