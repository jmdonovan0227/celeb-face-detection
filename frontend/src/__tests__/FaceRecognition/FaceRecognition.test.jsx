import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import FaceRecognition from '../../components/FaceRecognition/FaceRecognition';

const mockError = false;
const mockImageUrl = 'happy.png';
const mockParentRef = null;
const mockToggleImage = jest.fn();
const mockText = 'Wow is that celeb1 name, celeb2 name?';
const mockBoxes = [{topRow: 1, rightCol: 1, bottomRow: 1, leftCol: 1}];

describe('<FaceRecognition />', () => {
    test('render facerecognition component with no error', () => {
        // arrange
        render (
            <FaceRecognition imageUrl={mockImageUrl} boxes={mockBoxes} text={mockText} toggleImage={mockToggleImage} parentRef={mockParentRef} error={mockError} />
        );

        expect(screen.getByRole('img', { name: /show-user-inserted-image/i})).toHaveAttribute('src', 'happy.png');
        expect(screen.getByRole('valid-span')).toHaveTextContent('Wow is that celeb1 name, celeb2 name?');
    });

    test('render facerecognition component with an error', () => {
        // arrange
        render (
            <FaceRecognition imageUrl={mockImageUrl} boxes={mockBoxes} text={mockText} toggleImage={mockToggleImage} parentRef={mockParentRef} error={true} />
        );

        expect(screen.getByRole('img', { name: /show-user-inserted-image/i})).toHaveAttribute('src', 'happy.png');
        expect(screen.getByRole('error-span')).toHaveTextContent("Sorry, I wasn't able to detect any faces...");
    });
});