import React from 'react';
import { Button, Modal, Form } from 'react-bootstrap';
import { APP_URL } from '../../config.js';
import './Delete.css';

class Delete extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            password: '',
            error: false,
            showPassword: false
        }
    }

    toggleShowPassword = () => this.state.showPassword ? this.setState({ showPassword : false }) : this.setState({ showPassword: true });
    
    handleShowModal = () => this.props.toggleDeleteModal();

    handleCloseModal = () =>  {
        this.removeErrorStatus();
        this.props.toggleDeleteModal();
    };

    addErrorStatus = () => {
        this.setState({error: true});
    }

    removeErrorStatus = () => {
        this.setState({error: false});
    }

    handleEmailChange = (event) => {
        this.setState({email : event.target.value });
    };

    handlePasswordChange = (event) => {
        this.setState({password: event.target.value});
    };

    handleAccountDeletion = () => {
        fetch(`${APP_URL}/api/delete`, {
            method: 'delete',
            headers: {'Content-Type': 'application/json', 'Authorization': window.sessionStorage.getItem('token')},
            body: JSON.stringify({
              email: this.state.email,
              password: this.state.password
            })
          })
          .then(response => response.json())
          .then(deletedUser =>  {
            this.handleCloseModal();
            this.props.onRouteChange('signout');
           })
          .catch(err => {
            this.addErrorStatus();
          });
    };

    render() {
        const { isDeleteModalOpen } = this.props;

        return (
            <div>
                <div>
                    <Modal show={isDeleteModalOpen} onHide={this.handleCloseModal} backdrop='static' centered className='modal-background'>
                        <Modal.Header className='bg-dark text-white'>
                            <Modal.Title className='w-100 fs-3 d-flex align-items-center justify-content-center adjust-modal-title modal-text-styling modal-header-text-size'>Delete Account</Modal.Title>
                            <button onClick={this.handleCloseModal} type="button" className="btn-close btn-close-white" aria-label="Close"></button>
                        </Modal.Header>
                        <Modal.Body className='bg-dark'>
                            <p className='text-white fs-5 modal-box-background modal-text-styling text-center' aria-label='deletion-header'>Thank you trying Celebrity Face Detection. Enter your email address and password to confirm account deletion.</p>
                            <Form>
                                <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                                    <Form.Label className='text-white'>Email Address</Form.Label>
                                    <Form.Control
                                        type="email"
                                        onChange={this.handleEmailChange}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="exampleForm.ControlInput2">
                                    <Form.Label className='text-white'>Password</Form.Label>
                                    <Form.Control
                                        type={this.state.showPassword ? 'text' : 'password'}
                                        role='password-input'
                                        onChange={this.handlePasswordChange}
                                    />
                                </Form.Group>
                                <Button variant='secondary' onClick={this.toggleShowPassword} aria-label='show-hide-pw-button'>{this.state.showPassword ? 'Hide Password' : 'Show Password'}</Button>
                            </Form>
                        </Modal.Body>

                        <Modal.Footer className='modal-box-background bg-dark text-white'>
                            <Button variant='secondary' onClick={this.handleCloseModal} aria-label='cancel-account-deletion'>Cancel</Button>
                            <Button variant='primary' onClick={this.handleAccountDeletion} aria-label='confirm-account-deletion'>Confirm</Button>
                            {
                            this.state.error ? (<div className='error-text'><p aria-label='error-message' >Invalid Email or Password. Please Try Again.</p></div>) : (<div className='error-text' aria-label='error-message'></div>)
                            }
                        </Modal.Footer>
                    </Modal>
                </div>
            </div>
        );
    }
}

export default Delete;