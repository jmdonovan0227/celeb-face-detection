import React, { Component } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { APP_URL } from '../../config';
import './SignIn.css';

const initialState = {
    signInEmail: '',
    signInPassword: '',
    errorState: false,
    showPassword: false
};

class SignIn extends Component {
    // if you want a smart component (has state) to use props, we have to pass to constructor
    constructor(props) {
        super(props);
        this.state = initialState;
    }

    onEmailChange = (event) => {
        this.setState({signInEmail: event.target.value});
    }

    onPasswordChange = (event) => {
        this.setState({signInPassword: event.target.value});
    }

    setErrorStatus = () => this.setState({errorState: true});

    onPasswordButtonClick = () => {
        if(this.state.showPassword) {
            this.setState({showPassword: false});
        }
        else {
            this.setState({showPassword: true});
        }
    }

    // We should update this to React.lazy() load our Home component when ready to be viewed
    saveAuthTokenInSession = (token) => {
        window.sessionStorage.setItem('token', token);
    }

    onSubmitSignIn = async() => {
        fetch(`${APP_URL}/api/signin`, {
            method: 'post',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                email: this.state.signInEmail,
                password: this.state.signInPassword
            })
        }).then(response => response.json())
        .then(data => {
            if(data.userId && data.success === 'true') { // does user exist?
                this.saveAuthTokenInSession(data.token);
                fetch(`${APP_URL}/api/profile/${data.userId}`, {
                    method: 'get',
                    headers: {'Content-Type': 'application/json', 'Authorization': data.token }
                  }).then(response => response.json())
                  .then(async(user) => {
                    if(user && user.name && user.image_key) {
                        const getProfilePicResponse = await fetch(`${APP_URL}/api/upload/signedurl`, {
                            method: 'get',
                            headers: {'Authorization': data.token }
                        });
          
                        if(getProfilePicResponse.ok) {
                            const data = await getProfilePicResponse.json();
                            this.props.loadUser(Object.assign(user, {profile_picture : data.imageUrl }));
                            this.props.onRouteChange('home');
                        }
                    }

                    else if(user && user.name) {
                        this.props.loadUser(user);
                        this.props.onRouteChange('home');
                    }
                  })
                  .catch(error => this.setErrorStatus())
            }

            else {
                this.setErrorStatus();
            }
        })
        .catch(error => this.setErrorStatus());
    }

    render() {
        return (
            <article className="article">
                <main>
                    <div className="main-content">
                        <fieldset id="sign_up">
                            <legend className="centerPageElements signin-legend">Sign In</legend>
                            <div className="spaceInputFields">
                                <label htmlFor="email-address">Email</label>
                                <input onChange={this.onEmailChange} className="input-fields" type="email" name="email-address"  id="email-address" maxLength="50" autoComplete='off' />
                            </div>
                            <div className="spaceInputFields">
                                <label htmlFor="password">Password</label>
                                <input onChange={this.onPasswordChange} className="input-fields" type={this.state.showPassword ? 'text' : 'password'} name="password" maxLength="50"  id="password" role='password-input' autoComplete='off' />
                            </div>
                        </fieldset>

                        <div className='submit-container'>
                            <div className="buttons-container">
                                <button aria-label='password_visibility' onClick={this.onPasswordButtonClick} className="style-buttons">{this.state.showPassword ? 'Hide Password' : 'Show Password'}</button>
                                <input aria-label='signin_button' onClick={this.onSubmitSignIn} className="style-buttons" type="submit" value="Sign in" />
                            </div>

                            <div className='links'>
                                <div>
                                    <Link aria-label='fp_page_link' to='forgot_password' style={{textDecoration: 'none'}}><p className="links-styling" aria-label='fp-text-link'>Forgot Password</p></Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='error-content'>
                        <div className='error-text'>
                                { this.state.errorState ? <div><p aria-label='error_text'>Invalid Email or Password</p></div> : null }
                        </div>
                    </div>
                </main>
                <Outlet />
            </article>
        );
    }
}

export default SignIn;