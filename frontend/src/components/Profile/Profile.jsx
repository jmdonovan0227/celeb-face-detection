import React from 'react';
import './Profile.css';
import './ProfileIcon.css';
import './ProfileStyles.css';
import { APP_URL } from '../../config.js';
import CompLoadingSpinner from '../CompLoadingSpinner/CompLoadingSpinner';

class Profile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: this.props.user.name,
            age: this.props.user.age,
            file: null,
            fileUrl: this.props.user.profile_picture,
            updatePending: false,
            updateError: false,
            updateText: ''
        }
    }

    onFormChange = (event) => {
        switch(event.target.name) {
            case 'user-name':
                this.setState({name : event.target.value});
                break;
            case 'user-age':
                this.setState({age: event.target.value});
                break;
            default:
                return;
        }
    }

    onProfileInputChange = (event) => {
        const fileType = event.target.files[0]?.type;

        if(fileType && ( fileType === 'image/png' || fileType === 'image/jpg' || fileType === 'image/jpeg' || fileType === 'image/png' )) {
            this.setState({file : event.target.files[0]});

            const reader = new FileReader();
    
            reader.readAsDataURL(event.target.files[0]);
    
            reader.onload = (event) => {
                this.setState({fileUrl: event.target.result});
            };
        }
    }

    onProfileUpdate = async(data) => {
        this.setState((prevState) => ({ ...prevState, updatePending: true }));
        const authorization = window.sessionStorage.getItem('token');
        const { name, age } = data;

        if(this.state.file && this.state.file.type.startsWith('image/')) {
            const numbersRegex = /[0-9]/;
            const specialCharsRegex = /[!@#$%^&*(),.?":{}|<>]/;
            const whiteSpaceRegex = /\s/;
            const charactersRegex = /[A-Za-z]/;
            const whiteSpaceCount = name.split(' ').length - 1;

            if(!numbersRegex.test(name) && !specialCharsRegex.test(name) && !whiteSpaceRegex.test(age) && !charactersRegex.test(age) && age >= 0 && age <= 99 && whiteSpaceCount <= 1 && name.length > 1 && name.length <= 30) {
                // if user has a profile image in the s3 bucket, delete it.
                await fetch(`${APP_URL}/api/upload/deletepic`, {
                    method: 'delete',
                    headers: {'Authorization': authorization }
                });

                const formData = new FormData();
                formData.append('image', this.state.file);

                const pictureResponse = await fetch(`${APP_URL}/api/upload/picture`, {
                    method: 'post',
                    headers: {'Authorization': authorization },
                    body: formData
                });

                if(pictureResponse.ok) {
                    const signedUrlResponse = await fetch(`${APP_URL}/api/upload/signedurl`, {
                        method: 'get',
                        headers: {'Authorization' : authorization }
                    });

                    if(signedUrlResponse.ok) {
                        const response = await fetch(`${APP_URL}/api/profile`, {
                            method: 'put',
                            headers: {'Content-Type': 'application/json', 'Authorization': authorization },
                            body: JSON.stringify(data)
                        });

                        // if we get a 304 this won't run the conditional block meaning we haven't modified the user's info
                        if(response.ok) {
                            const signedImageData = await signedUrlResponse.json();
                            this.setState({fileUrl : signedImageData.imageUrl});
                            this.props.loadUser(Object.assign(this.props.user, { profile_picture : signedImageData.imageUrl }, { name, age } ));
                            this.setState({ updateError: false });
                            this.setState({ updateText: "Your profile was successfully updated!"});
                            this.setState({ file: null });
                        }

                        else {
                            this.setState({ updateError: true });
                            this.setState({ updateText: "Sorry, I couldn't update your profile."});
                        }
                    }

                    else {
                        // couldn't get signedurl
                        this.setState({ updateError: true });
                        this.setState({ updateText: "Sorry, I couldn't update your profile."});
                    }
                }

                else {
                    // something went wrong when uploading profile picture
                    this.setState({ updateError: true });
                    this.setState({ updateText: "Sorry, I couldn't update your profile."});
                }
            }

            else {
                // name or age is invalid
                this.setState({ updateError: true });
                this.setState({ updateText: "Sorry, I couldn't update your profile."});
            }

        } else {
            if(name && age) {
                const { name, age } = data;
                const numbersRegex = /[0-9]/;
                const specialCharsRegex = /[!@#$%^&*(),.?":{}|<>]/;
                const whiteSpaceRegex = /\s/;
                const charactersRegex = /[A-Za-z]/;
                const whiteSpaceCount = name.split(' ').length - 1;

                
                if(!numbersRegex.test(name) && !specialCharsRegex.test(name) && !whiteSpaceRegex.test(age) && !charactersRegex.test(age) && age >= 0 && age <= 99 && whiteSpaceCount <= 1 && name.length > 1 && name.length <= 30) {
                    const response = await fetch(`${APP_URL}/api/profile`, {
                        method: 'put',
                        headers: {'Content-Type': 'application/json', 'Authorization': authorization },
                        body: JSON.stringify(data)
                    });
    
                    if(response.ok) {
                        this.props.loadUser(Object.assign(this.props.user, { name, age }));
                        this.setState({ updateError: false });
                        this.setState({ updateText: "Your profile was successfully updated!"});
                    }
                }

                else {
                    this.setState({ updateError: true });
                    this.setState({ updateText: "Sorry, I couldn't update your profile."});
                }
            }

            else {
                this.setState({ updateError: true });
                this.setState({ updateText: "Sorry, I couldn't update your profile."});
            }
        }

        this.setState((prevState) => ({ ...prevState, updatePending: false }));
    }

    render() {
        const { toggleModal, user } = this.props;
        const { name, age, updatePending, updateText, updateError } = this.state;
        return (
            <div className='modal-background'>
                {/* // Align Vertically */}
                <div className='profile-modal'>
                    {/* // Profile Modal Header Style */}
                    <div className='modal-close' onClick={toggleModal} aria-label='close-button'>&times;</div>
                    <div className='profile-modal-header'>
                        <img src={this.state.fileUrl ? this.state.fileUrl : '/icons8-user-60.png' } className='profile_avatar' alt='your profile icon secondary' />
                        <h1 className='name-header' aria-label='name'>{this.state.name}</h1>
                        <p className='joined-header' aria-label='joined-date'>{`Member Since: ${new Date(user.joined).toLocaleDateString()}`}</p>
                    </div>


                    {/* // Profile Modal Inputs */}
                    <div className='profile-modal-inputs-container'>
                        <div className='inner-container'>
                            <div className='inner-container-profile-pic'>
                                <label className='profile-pic-label' htmlFor='upload_picture'>Upload Picture</label>
                                <input role='upload-profile-picture' type='file' name='upload_picture' id='upload_picture' accept='image/*' onChange={this.onProfileInputChange} autoComplete='off'/>
                            </div>

                            <div className='profile-modal-inputs'>
                                <label className="profile-modal-inputs-align labels" htmlFor="user-name">Name</label>
                                <input className="profile-modal-inputs-align fields" type="text" maxLength="30" name="user-name" id="user-name" placeholder={user.name} onChange={this.onFormChange} autoComplete='off' />
                                <label className="profile-modal-inputs-align labels" htmlFor="user-age">Age</label>
                                <input className="profile-modal-inputs-align fields" type="number" min="1" max="99" name="user-age" id="user-age" placeholder={user.age} onChange={this.onFormChange} autoComplete='off' />
                            </div>

                            <div className='profile-response-container' aria-label='profile-response-container'>
                                {
                                    updatePending ? <CompLoadingSpinner /> : <span className={updateError ? 'profile-res-text-invalid' : 'profile-res-text-valid'}>{updateText}</span>
                                }
                            </div>
                        </div>
                    </div>

                    {/* // Profile Modal Buttons */}
                    <div className='profile-modal-buttons'>
                        <button className='profile-modal-buttons-style' style={{backgroundColor: '#5783db'}} onClick={() => this.onProfileUpdate({name, age})}>
                            Save
                        </button>
                        <button className='profile-modal-buttons-style' style={{backgroundColor: ' #dd7973'}} onClick={toggleModal}>
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

export default Profile;