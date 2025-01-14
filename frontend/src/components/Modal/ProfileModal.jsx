import React from 'react';
import ReactDOM from 'react-dom';
import './Modal.css';

let modalRoot = document.querySelector('#modal-root');

if(!modalRoot) {
    modalRoot = document.createElement('div');
    modalRoot.setAttribute('id', 'modal-root');
    document.body.appendChild(modalRoot);
}

class ProfileModal extends React.Component {
    constructor(props) {
        super(props);
        this.element = document.createElement('div');
    }

    componentDidMount() {
        modalRoot.appendChild(this.element);
    }

    componentWillUnmount() {
        modalRoot.removeChild(this.element);
    }

    render() {
        return ReactDOM.createPortal(this.props.children, this.element);
    }
}

export default ProfileModal;