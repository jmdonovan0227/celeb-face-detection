import React from 'react';
import { APP_URL } from '../../config.js';
import CompLoadingSpinner from '../CompLoadingSpinner/CompLoadingSpinner';
import './Delete.css';
import './ProfileStyles.css';

class Delete extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            password: '',
            showPassword: false,
            processingDeletion: false,
            updateError: false,
            accountDeleted: false
        }
    }

    toggleShowPassword = () => this.state.showPassword ? this.setState({ showPassword : false }) : this.setState({ showPassword: true });

    handleCloseModal = () =>  {
        this.setState({ updateError: false });
        this.props.toggleDeleteModal();
    };

    handleEmailChange = (event) => {
        this.setState({email : event.target.value });
    };

    handlePasswordChange = (event) => {
        this.setState({password: event.target.value});
    };

    handleAccountDeletion = async () => {
        const { email, password } = this.state;

        // If email or password is empty set error status
        if (!email || !password) {
            this.setState({ updateError: true });
            return;
        }

        // start processing delete request
        this.setState({ processingDeletion: true, updateError: false });

        try {
            // attempt account deletion
            const response = await fetch(`${APP_URL}/api/delete`, {
                method: 'delete',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': window.sessionStorage.getItem('token'),
                },
                body: JSON.stringify({ email, password }),
            });

            // was deletion successful?
            if (response.ok) {
                try {
                    // what kind of data did we get?
                    const data = await response.json();
                    // request was successful
                    if(data?.success === true) {
                        this.setState({ accountDeleted: true, updateError: false });
                        this.handleCloseModal();
                        this.props.onRouteChange('signout');
                    }

                    // request was invalid
                    else if(data?.error === true) {
                        this.setState({ accountDeleted: false, updateError: true });
                    }
                } catch (err) {
                    this.setState({ updateError: true });
                }
            } else {
                this.setState({ updateError: true });
            }
        } catch (error) {
            this.setState({ updateError: true });
        }

        this.setState({ processingDeletion: false });
    };
    

    render() {
        return (
            <div className='modal-background'>
                <div className='profile-modal'>
                    <div className='modal-close' onClick={!this.state.processingDeletion ? this.handleCloseModal : null} disabled={this.state.processingDeletion} aria-label='Close'>&times;</div>
                    <div className='delete-modal-header'><span>Delete Account</span></div>

                    <div className='delete-modal-main-content'>
                        <div className='thank-you-container'>
                            <p aria-label='thank-you-header'>Thank you for trying Celebrity Face Detection! I hope you have a great day :).</p>
                        </div>
                        <div className='delete-modal-inputs-container'>
                            <div className='delete-inputs-main-container'>
                                <label className='delete-labels-style'>Email</label>
                                <input type='email' className='delete-inputs-style' onChange={this.handleEmailChange} aria-label='delete-email' />
                                <label htmlFor='delete-password' className='delete-labels-style'>Password</label>
                                <input id='delete-password' type={this.state.showPassword ? 'text' : 'password'} role='del-password-input' className='delete-inputs-style' onChange={this.handlePasswordChange} />
                            </div>

                            <div className='delete-inputs-secondary-container'>
                                <button className='password-button-style' onClick={this.toggleShowPassword} aria-label='show-hide-pw-button'>{this.state.showPassword ? 'Hide Password' : 'Show Password'}</button>
                            </div>
                        </div>

                        { /** Steps => 1st: Are we processing account delection? Yes => show comp loading spinner, No => Okay, do we have error? Yes => show error paragraph, No => Okay, remove any errors and redirect user to sign in page. */}
                        <div className='delete-modal-response-container'>
                            {
                                this.state.processingDeletion ? (
                                    <CompLoadingSpinner />
                                ) : (
                                    this.state.updateError 
                                ) ? 
                                    ( <p style={{ color: 'red' }}aria-label='error-message'>Could not process account deletion. Invalid email or password.</p> ) :
                                ( null )
                            } 
                        </div>
                    </div>

                    <div className='delete-modal-buttons-container'>
                        <button className='delete-buttons-style' style={{backgroundColor: '#5783db'}} disabled={this.state.processingDeletion } onClick={this.handleAccountDeletion} aria-label='confirm-account-deletion'>Confirm</button>
                        <button className='delete-buttons-style' style={{backgroundColor: ' #dd7973'}} onClick={ !this.state.processingDeletion ? this.handleCloseModal : null } disabled={this.state.processingDeletion} aria-label='cancel-account-deletion'>Cancel</button>
                    </div>
                </div>
            </div>
        );
    }
}

export default Delete;