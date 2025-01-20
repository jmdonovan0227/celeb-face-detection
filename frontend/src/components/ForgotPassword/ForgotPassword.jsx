import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { APP_URL } from '../../config.js';
import './ForgotPassword.css';

const ForgotPassword = ({ isSignedIn }) => {
    const navigate = useNavigate();
    const [signInEmail, setSignInEmail] = useState('');
    const [errorState, setErrorState] = useState(false);
    const [successfulRequest, setSuccessfulRequest] = useState(false);

    useEffect(() => {
        if(isSignedIn) {
            navigate('/');
        }
    }, [isSignedIn]);

    // we need state somewhere to manage when to show a message for a failed sign in attempt

    const onEmailChange = (event) => {
        setSignInEmail(event.target.value);
    }

    const setErrorStatus = () => setErrorState(true);

    const setSuccessStatus = () => setSuccessfulRequest(true);

    const onSubmitSendPasswordResetRequest = async() => {
        const response = await fetch(`${APP_URL}/api/forgot_password`, {
            method: 'post',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: signInEmail
            })
        }).catch(error => setErrorStatus());

        if(response && response.ok) {
            setSuccessStatus();
        }

        else {
            setErrorStatus();
        }
    }

    return (
        <article className="article">
            <main>
                <div className='main-content'>
                    <fieldset id="sign_up">
                        <legend className="centerPageElements passwords-header-styling">Forgot Password</legend>
                        <div className='spaceInputFields'>
                            <label htmlFor="email-address">Email</label>
                            <input onChange={onEmailChange} className="input-fields" type="email" name="email-address"  id="email-address" autoComplete='off' />
                        </div>
                    </fieldset>
                    <div className="submit-container">
                        <input onClick={onSubmitSendPasswordResetRequest} disabled={successfulRequest} className="style-buttons" type="submit" value="Send Request" />
                    </div>
                </div>
                <div className='error-content'>
                    <div className='response-container' aria-label='response-container'>
                        { successfulRequest ? <p className='success-text' aria-label='fp-success-text'>Password Reset Request Sent!</p> : 
                            errorState ? <p className='error-text' aria-label='fp-error-text'>Invalid Email or Password</p> : null
                        }
                    </div>
                </div>
            </main>
        </article>
    );
};

export default ForgotPassword;