import React, { Component } from 'react';
import './Register.css';
import { APP_URL } from '../../config.js';

const initialState = { 
    email: '',
    password: '',
    name: '',
    errorState: false,
    errorText: '',
    showPassword: false
}

class Register extends Component {
    constructor(props) {
        super(props);
        this.state = initialState;
    }

    onEmailChange = (event) => {
        this.removeErrorStatus();
        this.setState({email: event.target.value});
    }

    onPasswordChange = (event) => {
        this.removeErrorStatus();
        this.setState({password: event.target.value});
    }

    onNameChange = (event) => {
        this.removeErrorStatus();
        this.setState({name: event.target.value});
    }

    setErrorStatus = () => {
        this.setState({errorState: true});
    }
    
    removeErrorStatus = () => {
        this.setState({errorState: false});
    }

    onPasswordButtonClick = () => {
        if(this.state.showPassword) {
            this.setState({showPassword: false});
        }
        else {
            this.setState({showPassword: true});
        }
    }

    setErrorText = (string) => {
        this.setState({errorText: string});
    }

    saveAuthTokenInSession = (token) => {
        window.sessionStorage.setItem('token', token);
    }

    onSubmitSignIn = () => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,}$/;
        const upperCaseRegex = /[A-Z]/;
        const lowerCaseRegex = /[a-z]/;
        const numbersRegex = /[0-9]/;
        const specialCharsRegex = /[!@#$%^&*(),.?":{}|<>]/;
        const whiteSpaceRegex = /\s/;
        const minLength = 14;
        const pwd = this.state.password;
        const name = this.state.name;
        const email = this.state.email;
        const whiteSpaceCount = name.split(' ').length - 1;

        if(!name || !email || !pwd) {
            this.setErrorText('Please enter a name, email, and password.');
            this.setErrorStatus();
        }
        // check if name is valid
        else if(name.length === 1) {
            // empty string (pass error text and display it)
            this.setErrorText('Please enter a valid name which is at least 2 characters long.');
            this.setErrorStatus();
        }

        else if(numbersRegex.test(name) || specialCharsRegex.test(name)) {
            this.setErrorText('Please enter a name without numbers or special characters.');
            this.setErrorStatus();
        }

        else if(whiteSpaceCount > 1) {
            this.setErrorText('We only allow users to enter their names as a first and last name with one total space between the two.');
            this.setErrorStatus();
        }

        else if (!emailRegex.test(email)) {
            this.setErrorText('Please enter a valid email address.');
            this.setErrorStatus();
        }

        // check password
        else if(pwd.length < minLength || !upperCaseRegex.test(pwd) || !lowerCaseRegex.test(pwd) || !numbersRegex.test(pwd) || !specialCharsRegex.test(pwd) || whiteSpaceRegex.test(pwd)) {
            this.setErrorText('Please enter a valid password which has 14 characters and at least 1 uppercase letter, lowercase letter, number, and special character.');
            this.setErrorStatus();
        }

        else {
            fetch(`${APP_URL}/api/register`, {
                method: 'post',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    email: this.state.email,
                    password: this.state.password,
                    name: this.state.name
                })
            }).then(response => response.json())
            .then(data => {
                if(data && data.session && data.user && data.session.userId && data.session.success === 'true') {
                    this.saveAuthTokenInSession(data.session.token);
                    this.props.loadUser(data.user);
                    this.props.setIsCheckingSession(false);
                    this.props.onRouteChange('home');
                }
                else {
                    this.setErrorText('Invalid registration, please try again.');
                    this.setErrorStatus();
                }
            }).catch(err => {
                this.setErrorText('Invalid registration, please try again.');
                this.setErrorStatus();
            });
        }
    }

    render() {
        return (
            <article className="article register-article">
                <main>
                    <div className="main-content">
                        <fieldset id="sign_up" className='register-fieldset'>
                            <legend className="centerPageElements register-legend">Register</legend>
                            <div className="spaceInputFields">
                                <label htmlFor="name">Name</label>
                                <input onChange={this.onNameChange} className="input-fields" type="text" name="name"  id="name" maxLength="30" autoComplete='off' />
                            </div>
                            <div className="spaceInputFields">
                                <label htmlFor="email-address">Email</label>
                                <input onChange={this.onEmailChange} className="input-fields" type="email" name="email-address"  id="email-address" maxLength="50" autoComplete='off' />
                            </div>
                            <div className="spaceInputFields">
                                <label htmlFor="password">Password</label>
                                <input onChange={this.onPasswordChange} role='password-input' className="input-fields" type={this.state.showPassword ? 'text' : 'password'} name="password"  id="password" maxLength="50" autoComplete='off' />
                            </div>
                        </fieldset>
                        <div className='register-submit-container'>
                            <div className='password-length'>
                                <p><strong>Password Length:</strong> {this.state.password.length}</p>
                            </div>
                            <div className="register-buttons">
                                <button onClick={this.onPasswordButtonClick} aria-label='show_hide_button' className="style-buttons">{this.state.showPassword ? 'Hide Password' : 'Show Password'}</button>
                                <input onClick={this.onSubmitSignIn} className="style-buttons" aria-label='register_submit_button' type="submit" value="Register" />
                            </div>
                        </div>
                    </div>
                    <div className='error-content'>
                        <div className='error-text'>
                            { this.state.errorState ? <div><p aria-label='error-text'>{this.state.errorText}</p></div> : null }
                        </div>
                    </div>
                </main>
            </article>
        );
    }
}

export default Register;