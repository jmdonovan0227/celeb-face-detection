import { useEffect, useState, useCallback } from 'react';
import FaceRecognition from '../FaceRecognition/FaceRecognition';
import ImageLinkForm from '../ImageLinkForm/ImageLinkForm';
import Rank from '../Rank/Rank';
import './Home.css';

const Home = props =>  {
    const [isImageVisible, setIsImageVisible] = useState(false);
    const [text, setText] = useState('');
    const [error, setError] = useState(false);

    const handleOnButtonSubmit = () => {
        toggleImage();
        props.onButtonSubmit();
    }

    const toggleImage = () => {
        setIsImageVisible(!isImageVisible);
        props.onImageFormClose();
    }

    useEffect(() => {
        if(props.errorStatus) {
            setError(true);
        }
        else {
            setError(false);
        }
    }, [props.errorStatus]);

    const capitalizeWords = (string) => {
        return string.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    const createCelebrityString = useCallback((celebrities) => {
        if(!celebrities) {
            return '';
        }

        else if (!celebrities.celebrityNamesArray.length) {
            return '';
        }

        const str = celebrities.celebrityNamesArray.map((item, index) => {
          const capitalizedItem = capitalizeWords(item);
          if (index === celebrities.celebrityNamesArray.length - 1) {
            if (celebrities.celebrityNamesArray.length === 1) {
              return `Wow is that ${capitalizedItem}?`;
            } else {
              return `and ${capitalizedItem}?`;
            }
          } else if (index === 0) {
            return `Wow is that ${capitalizedItem}, `;
          } else {
            return `${capitalizedItem}, `;
          }
        }).join('');

        return str;
    }, []);

    useEffect(() => {
        setText(createCelebrityString(props.celebrities));
    }, [props.celebrities, createCelebrityString]);

    return (
        <div className='test-x'>
            <div className='stats-container'>
                <Rank name={props.name} entries={props.entries}/>
            </div>

            { /** Conditionally Render These Components to maximize page space  */ }
            <div className='functionality-container'>
                { !isImageVisible ? ( 
                        <ImageLinkForm  
                            onInputChange={props.onInputChange}
                            onButtonSubmit={handleOnButtonSubmit} 
                            readyToDetectImages={props.readyToDetectImages}
                            input={props.input}
                        />
                    ) : (
                        <FaceRecognition 
                            boxes={props.boxes}
                            text={text} 
                            toggleImage={toggleImage} 
                            imageUrl={props.imageUrl} 
                            parentRef={props.parentRef}
                            error={error} 
                        />
                    )
                }
            </div>
        </div>
    );
};

export default Home;