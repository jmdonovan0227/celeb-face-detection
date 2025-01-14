import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ImageLinkForm from '../../components/ImageLinkForm/ImageLinkForm';

const mockErrorStatus = false;
const mockCelebrities = { celebrityNamesArray: ['celeb 1 name', 'celeb 2 name', 'celeb 3 name'] };
const mockInput = '';
const mockOnInputChange = jest.fn();
const mockOnButtonSumbit = jest.fn();
const mockReadyToDetectImages = false;
const mockFileLink = '';

describe('<ImageLinkForm />', () => {
    test('render ImageLinkForm without any errors', () => {
        // arrange
        render (
            <ImageLinkForm
                onInputChange={mockOnInputChange}
                onButtonSubmit={mockOnButtonSumbit}
                readyToDetectImages={mockReadyToDetectImages}
                input={mockInput}
            />
        );

        const rtd_header = screen.getByRole('ready-to-detect-text');
        const url_input = screen.getByRole('textbox', { name: /insert-url-here/i });
        const upload_input = screen.getByRole('upload-pictures');
        const detect_button = screen.getByRole('button', { name: /Detect/i });
        
        // assert
        expect(rtd_header).toBeInTheDocument();
        expect(rtd_header).toHaveTextContent('Ready To Detect Celebrities: ❌');
        expect(url_input).toBeInTheDocument();
        expect(url_input).toHaveValue('');
        expect(upload_input).toBeInTheDocument();
        expect(detect_button).toBeInTheDocument();
    });

    test('simulate a valid image entry with a url', async() => {
        // arrange
        render (
            <ImageLinkForm
                errorStatus={mockErrorStatus}
                celebrities={mockCelebrities}
                onInputChange={mockOnInputChange}
                onButtonSubmit={mockOnButtonSumbit}
                readyToDetectImages={true}
                input={'photo.png'}
                fileLink={mockFileLink}
            />
        );

        const rtd_header = screen.getByRole('ready-to-detect-text');
        const url_input = screen.getByRole('textbox', { name: /insert-url-here/i });
        const detect_button = screen.getByRole('button', { name: /Detect/i });
        const upload_input = screen.getByRole('upload-pictures');

        // act (easy way to isolate behavior when our input value and onChange handler are tied to parent components)
        // ensure we have typed 9 characters below meaning we called onChange 9 times
        // NOTE: this will not affect the actual stored value for url_input because they are tied to a parent component
        // which we mocked. We are only making sure that onChange is calling the mock function.
        await userEvent.type(url_input, 'photo.png');
        await userEvent.click(detect_button);

        // assert
        expect(rtd_header).toBeInTheDocument();
        expect(mockOnInputChange).toHaveBeenCalledTimes(9);
        expect(rtd_header).toHaveTextContent('Ready To Detect Celebrities: ✔️');
        expect(detect_button).toBeInTheDocument();
        // input should be disabled when we have a valid url for an image in the input box for url
        expect(upload_input).toHaveProperty('disabled', true);
        expect(mockOnButtonSumbit).toHaveBeenCalledTimes(1);
    });

    test('simulate a valid image entry by uploading an image', async() => {
        // arrange
        render (
            <ImageLinkForm
                errorStatus={mockErrorStatus}
                celebrities={mockCelebrities}
                onInputChange={mockOnInputChange}
                onButtonSubmit={mockOnButtonSumbit}
                readyToDetectImages={true}
                input={mockInput}
                fileLink={mockFileLink}
            />
        );

        const rtd_header = screen.getByRole('ready-to-detect-text');
        const url_input = screen.getByRole('textbox', { name: /insert-url-here/i });
        const detect_button = screen.getByRole('button', { name: /Detect/i });
        const upload_input = screen.getByRole('upload-pictures');
        const file = new File(['^_^'], 'happy.png', { type: 'image/png' });

        // act
        await userEvent.upload(upload_input, file);
        await userEvent.click(detect_button);

        // assert
        expect(rtd_header).toBeInTheDocument();
        expect(mockOnInputChange).toHaveBeenCalledTimes(10);
        expect(rtd_header).toHaveTextContent('Ready To Detect Celebrities: ✔️');
        expect(upload_input).toHaveProperty('disabled', false);
        expect(url_input).toBeInTheDocument();
        expect(detect_button).toBeInTheDocument();
        // input should be disabled when we have a valid url for an image in the input box for url
        expect(mockOnButtonSumbit).toHaveBeenCalledTimes(2);
    });
});
