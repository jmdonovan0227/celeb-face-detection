import { Component } from 'react';
import {
    Dropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem
  } from 'reactstrap';

import './ProfileIcon.css';

class ProfileIcon extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dropdownOpen: false
        }
    }

    toggle = () => {
        this.setState(prevState => ({
            dropdownOpen: !prevState.dropdownOpen
        }));
    }

    render() {
        return (
            <div className='' aria-label='container'>
                <Dropdown isOpen={this.state.dropdownOpen} toggle={this.toggle} role='dropdown'>
                    <DropdownToggle
                        data-toggle="dropdown"
                        tag="span"
                        role='dropdown-toggle'
                    >
                        <img src={!this.props.profile_picture ? '/icons8-user-60.png' : this.props.profile_picture } className='avatar' alt='your profile icon main' />
                    </DropdownToggle>
                    <DropdownMenu style={{marginTop: '1.85rem', backgroundColor: 'rgb(255, 255, 255)'}}>
                        <DropdownItem onClick={this.props.toggleModal}>View Profile</DropdownItem>
                        <DropdownItem onClick={this.props.toggleDeleteModal}>Delete Account</DropdownItem>
                        <DropdownItem onClick={() => this.props.onRouteChange('signout')}>Sign Out</DropdownItem>
                    </DropdownMenu>
                </Dropdown>
            </div>
        );
    }
}

export default ProfileIcon;