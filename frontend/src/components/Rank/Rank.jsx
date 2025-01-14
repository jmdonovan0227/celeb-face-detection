import React from 'react';
import './Rank.css';
import { LAMBDA_API_URL } from '../../config.js';

class Rank extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            emoji: ''
        }
    }

    componentDidMount() {
        this.generateEmoji(this.props.entries);
    }

    componentDidUpdate(prevProps, prevState) {
        if(prevProps.entries === this.props.entries && prevProps.name === this.props.name) {
            return false;
        }

        else {
            this.generateEmoji(this.props.entries);
        }
    }

    generateEmoji = (entries) => {
        fetch(`${LAMBDA_API_URL}?rank=${entries}`)
        .then(response => response.json())
        .then(data => {
            this.setState({ emoji: data.input })
        })
        .catch(error => this.setState({ emoji: 'error getting rank'}));
    }

    render() {
        const { entries, name } = this.props;
        return (
            <div className='rank-container'>
                <div className='text-styling' aria-label='intro-entry-count'>
                    <span style={{fontWeight: 600}}>{name},</span> your current entry count is...
                </div>
                <div className='text-styling' aria-label='entries-entry-count'>
                    <span style= {
                        entries >= 0 && entries <= 9 ? 
                        {border: '1px solid rgba(0, 0, 0, 0.5)', borderRadius: '50%', padding: '0 1rem 0.25rem 1rem', boxShadow: '2px 2px 2px rgba(0, 0, 0, 0.5'} : (
                            entries >= 10 && entries <= 99 ? {border: '1px solid rgba(0, 0, 0, 0.5)', borderRadius: '50%', padding: '0 0.6rem 0.25rem 0.6rem', boxShadow: '2px 2px 2px rgba(0, 0, 0, 0.5'} : 
                            {border: '1px solid rgba(0, 0, 0, 0.5)', borderRadius: '50%', padding: '0.25rem 0.55rem 0.5rem 0.55rem', boxShadow: '2px 2px 2px rgba(0, 0, 0, 0.5'}
                        )
                    }
                    >{entries}</span>
                </div>
                <div className='text-styling' aria-label='rank-entry-count'>
                    <span style={{}}>Rank Badge:</span> {this.state.emoji}
                </div>
            </div>
        );
    }
};

export default Rank;