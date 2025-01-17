import React, { Component, createRef, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation/Navigation';
import SignInForm from './components/SignIn/SignIn';
// import Register from './components/Register/Register';
const Register = lazy(() => import('./components/Register/Register'));
// import ForgotPassword from './components/ForgotPassword/ForgotPassword';
const ForgotPassword = lazy(() => import('./components/ForgotPassword/ForgotPassword'));
// import ResetPassword from './components/ResetPassword/ResetPassword';
const ResetPassword = lazy(() => import('./components/ResetPassword/ResetPassword'));
// import ErrorPage from './components/ErrorPage/ErrorPage';
const ErrorPage = lazy(() => import('./components/ErrorPage/ErrorPage'));
// import Home from './components/Home/Home';
const Home = lazy(() => import('./components/Home/Home'));
import PageLoadingSpinner from './components/PageLoadingSpinner/PageLoadingSpinner';
// const LoadingSpinner = lazy(() => import('./components/LoadingSpinner/LoadingSpinner.jsx'));
import ParticlesBg from 'particles-bg';
import ProfileModal from './components/Modal/ProfileModal';
import DeleteModal from './components/Modal/DeleteModal';
import CompLoadingSpinner from './components/CompLoadingSpinner/CompLoadingSpinner';
// import Profile from './components/Profile/Profile';
const Profile = lazy(() => import('./components/Profile/Profile'));
// import Delete from './components/Profile/Delete';
const Delete = lazy(() => import('./components/Profile/Delete'));
import { APP_URL } from './config.js';
import './App.css';

const initialState = {
  input: '',
  imageUrl: '',
  boxes: {boxesArray: []},
  allCelebrities: {celebrityNamesArray: []},
  route: 'signin',
  isSignedIn: false,
  isProfileOpen: false,
  isDeleteModalOpen: false,
  errorStatus: false,
  localFile: null,
  fileLink: '',
  user: {
    name: '',
    entries: 0,
    joined: '',
    age: 0,
    profile_picture: ''
  },

  readyToDetectImages: false,
  isCheckingSession: true,
  parentRef: createRef()
};

class App extends Component {
  // define state
  constructor() {
    super();
    this.state = initialState;
  }

  componentDidMount() {
    const token = window.sessionStorage.getItem('token');

    if(token) {
      fetch(`${APP_URL}/api/signin`, {
        method: 'post',
        headers: {'Content-Type': 'application/json', 'Authorization':  token },
      }).then(response => response.json())
      .then(data => {
        if(data && data.userId) {
          fetch(`${APP_URL}/api/profile/${data.userId}`, {
            method: 'get',
            headers: {'Content-Type': 'application/json', 'Authorization': token }
          }).then(response => response.json())
          .then(async(user) => {
            if(user && user.name && user.image_key) {
              const getProfilePicResponse = await fetch(`${APP_URL}/api/upload/signedurl`, {
                method: 'get',
                headers: {'Authorization': token}
              });

              if(getProfilePicResponse.ok) {
                const data = await getProfilePicResponse.json();
                const { image_key, ...userObject } = user;
                this.loadUser(Object.assign(userObject, {profile_picture : data.imageUrl }));
                this.setIsCheckingSession(false);
                this.onRouteChange('home');
              }
            }

            else if(user && user.name) {
              const { image_key, ...userObject } = user;
              this.loadUser(userObject);
              this.setIsCheckingSession(false);
              this.onRouteChange('home');
            }
          }).catch(error => { this.setIsCheckingSession(false); })
        }
      })
      .catch(error => {
        this.setIsCheckingSession(false);
      });
    }

    else {
      this.setIsCheckingSession(false);
    }
  }

  setIsCheckingSession = (status) => {
    this.setState({ isCheckingSession: status });
  }

  loadUser = (data) => {
    if(data?.profile_picture) {
      this.setState({user: {
        name: data.name,
        entries: data.entries,
        joined: data.joined,
        profile_picture: data.profile_picture,
        age: data.age
      }});
    }

    else {
      this.setState({user: {
        name: data.name,
        entries: data.entries,
        joined: data.joined,
        age: data.age
      }});
    }
  }

  calculateFaceLocation = (data) => {
    const regions = data.outputs[0].data.regions;
    
    if(regions) {
      const image = document.querySelector('#input-image');
      const width = Number(image.width);
      const height = Number(image.height);
      const parentWidth = this.state.parentRef.current.offsetWidth;
      const parentHeight = this.state.parentRef.current.offsetHeight;
      const widthOffset = (parentWidth - width) / 2;
      const heightOffset = (parentHeight - height) / 2;

      const result = regions.map(face => {
        const boundingBox = face.region_info.bounding_box;
        const leftCol = (boundingBox.left_col * width) + widthOffset;
        const rightCol = parentWidth - ((boundingBox.right_col * width) + widthOffset);
        const topRow = ( boundingBox.top_row * height ) + heightOffset;
        const bottomRow = height - (boundingBox.bottom_row * height) + heightOffset;
        return {
          leftCol,
          topRow,
          rightCol,
          bottomRow
        };
      });

      return result;
    }

    else {
      return null;
    }
  };

  findCelebrities = (data) => {
    const regions = data.outputs[0].data.regions;

    if(regions) {
      let celebrities = {};
      let cNameSet = new Set();
  
      regions.forEach(region => {
        const mostLikelyCelebrityName = region.data.concepts[0].name;
        // sets shouldn't add duplicate values by default, but this is a good extra step to verify that a value doesn't already exist
        if(!cNameSet.has(mostLikelyCelebrityName)) {
          cNameSet.add(mostLikelyCelebrityName);
        }
      });

      celebrities.celebrityNamesArray = Array.from(cNameSet);
  
      return celebrities;
    }

    else {
      return null;
    }
  }

  updateCelebritiesState = (data) => {
    this.setState({allCelebrities: data});
  }

  displayFaceBox = (boxes) => {
    const newBoxes = { boxesArray: boxes };
    this.setState({boxes: newBoxes});
  }

  onInputChange = (event) => {
    if(event.target.files) {
      const file = event.target.files[0];

      if(file?.type === 'image/png' || file?.type === 'image/jpeg' || file?.type === 'image/jpg' || file?.type === 'image/webp') {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
          this.setState({fileLink : event.target.result});
        }
  
        this.setState({readyToDetectImages: true });
  
        this.setState({localFile: file});
      }

      else {
        this.setState({localFile: null});
        // ensure that we do not allow invalid file types and communicate that to the user
        this.setState({readyToDetectImages: false});
      }
    }

    else {
      const value = event.target.value;
      if(value && ( value.endsWith('.jpg') || value.endsWith('.jpeg') || value.endsWith('.png') || value.endsWith('.webp') )) {
        this.setState({readyToDetectImages: true});
      }

      else {
        this.setState({readyToDetectImages: false});
      }

      this.setState({ fileLink: '' });
      this.setState({ input: value });
      this.setState({localFile: null});
    }
  }

  onButtonSubmit = () => {
    this.setState({errorStatus: false});
    
    if(this.state.fileLink) {
      this.setState({imageUrl: this.state.fileLink});
    }

    else {
      this.setState({imageUrl: this.state.input });
    }

    this.setState({allCelebrities: {celebrityNamesArray: []}});
    this.setState({ boxes: {boxesArray: []}});

    let data = new FormData();

    if (this.state.localFile) {
      data.append('image', this.state.localFile);
    }

    else {
      data.append('image', this.state.input);
    }
    
    fetch(`${APP_URL}/api/faceurl`, {
        method: 'post',
        headers: {'Authorization': window.sessionStorage.getItem('token') },
        body: data
      }).then(response => response.json())
      .then(result => {
        // if we found faces
        if(result?.cfdInfo?.outputs[0]?.data?.regions) {
          // draw the face borders around each face
          this.displayFaceBox(this.calculateFaceLocation(result.cfdInfo));
          // pass the celebrity face names if we found any
          this.updateCelebritiesState(this.findCelebrities(result.cfdInfo));
          // we at least have a valid image, so update count for user indicating they have put in a valid image
          // this should update the database and return the update count
          fetch(`${APP_URL}/api/image`, { 
            method: 'put',
            headers: {'Content-Type': 'application/json', 'Authorization': window.sessionStorage.getItem('token') },
          })
          .then(response => response.json())
          .then(count =>  {
            // after updating the database, update the current count on the frontend so we can display on the page
            this.setState(Object.assign(this.state.user, { entries: count }));
          })
          .catch(err => this.setState({ errorStatus: true }));
        }

        else {
          // set an error message if we encounter an issue
          this.setState({errorStatus: true});
        }
      })
      .catch(error => this.setState({ errorStatus: true }));

      if(this.state.localFile) {
        this.setState({localFile: null, fileLink: ''});
      }

      if(this.state.input) {
        this.setState({input: ''});
      }

      this.setState({readyToDetectImages: false});
  }

  onRouteChange = (route) => {
    if(route === 'signout') {
      window.sessionStorage.removeItem('token');
      this.setState(Object.assign(initialState, { isCheckingSession: false }));
    }
    else if(route === 'home') {
      this.setState({isSignedIn: true});
    }

    this.setState({route: route});
  }

  toggleModal = () => {
    this.setState(prevState => ({
      ...this.prevState,
      isProfileOpen: !prevState.isProfileOpen
    }));
  }

  toggleDeleteModal = () => {
    this.setState(prevState => ({
      ...this.prevState,
      isDeleteModalOpen: !prevState.isDeleteModalOpen
    }));
  }

  setProfilePicture = (text) => {
    this.setState({ profile_picture: text });
  }

  onImageFormClose = () => {
    this.setState({allCelebrities: {celebrityNamesArray: []}});
    this.setState({ imageUrl: '' });
  };

  render() {
    const { isSignedIn, imageUrl, route, boxes, isProfileOpen, user, readyToDetectImages, isDeleteModalOpen, isOnline } = this.state;

    return (
      <div className='app'>
        { this.state.isCheckingSession ? <PageLoadingSpinner /> : (
              <BrowserRouter>
                <ParticlesBg type="cobweb" bg={true} />
                <Routes>
                  <Route path="/" element={<Navigation toggleDeleteModal={this.toggleDeleteModal} isSignedIn={isSignedIn} onRouteChange={this.onRouteChange} toggleModal={this.toggleModal} profile_picture={this.state.user?.profile_picture} />}>
                    <Route index element={(route === 'signin' || route === 'signout') ? <SignInForm loadUser={this.loadUser} onRouteChange={this.onRouteChange} /> : (
                      route === 'home' ? (
                        <div className='home-container'>
                          { isProfileOpen &&
                              <ProfileModal>
                                <Suspense fallback={<CompLoadingSpinner />}>
                                  <Profile isProfileOpen={isProfileOpen} toggleModal={this.toggleModal} user={user} loadUser={this.loadUser} profile_picture={this.state.user.profile_picture} setProfilePicture={this.setProfilePicture} />
                                </Suspense>
                              </ProfileModal>
                          }

                          {
                            isDeleteModalOpen &&
                              <DeleteModal>
                                <Suspense fallback={<CompLoadingSpinner />}>
                                  <Delete isDeleteModalOpen={isDeleteModalOpen} toggleDeleteModal={this.toggleDeleteModal} onRouteChange={this.onRouteChange} />
                                </Suspense>
                              </DeleteModal>
                          }

                          <Suspense fallback={ <PageLoadingSpinner /> }>
                            <Home 
                              name={user.name} 
                              entries={user.entries}
                              errorStatus={this.state.errorStatus} 
                              celebrities={this.state.allCelebrities} 
                              onInputChange={this.onInputChange}
                              onButtonSubmit={this.onButtonSubmit}
                              boxes={boxes} 
                              imageUrl={imageUrl}
                              input={this.state.input}
                              fileLink={this.state.fileLink}
                              readyToDetectImages={readyToDetectImages}
                              onImageFormClose={this.onImageFormClose}
                              parentRef={this.state.parentRef}
                            />
                          </Suspense>
                        </div> 
                        ) : (
                        route === 'register' ? (
                            <Suspense fallback={<PageLoadingSpinner />}>
                              <Register setIsCheckingSession={this.setIsCheckingSession} loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
                            </Suspense>
                          ) : null
                        )
                    )}/>

                    <Route path="forgot_password" element={
                        <Suspense fallback={<PageLoadingSpinner />}>
                          <ForgotPassword isSignedIn={isSignedIn} 
                          />
                        </Suspense>
                      }
                    />
                    <Route path="reset_password" element={
                        <Suspense fallback={<PageLoadingSpinner />}>
                          <ResetPassword isSignedIn={isSignedIn} />
                        </Suspense>
                      }
                    />
                    <Route path="*" element={
                        <Suspense fallback={<PageLoadingSpinner />}>
                          <ErrorPage/>
                        </Suspense>
                      } 
                    />
                  </Route>
                </Routes>
              </BrowserRouter>
            )
          }
      </div>
    );
  }
}

export default App;
