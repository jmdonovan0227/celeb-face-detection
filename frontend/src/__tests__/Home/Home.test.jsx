import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Home from '../../components/Home/Home';

const mockName = 'Jim';
const mockEntries = 2;
const mockErrorStatus = false;
const mockCelebrities = { celebrityNamesArray: ['celeb1', 'celeb2']};
const mockOnInputChange = jest.fn();
const mockOnButtonSubmit = jest.fn();
const mockBoxes = { boxesArray: [] };
const mockImageUrl = 'happy.png';
const mockInput = '';
const mockFileLink = 'some file link';
const mockReadyToDetectImages = true;
const mockParentRef = null;
const mockOnImageFormClose = jest.fn();

describe('<Home />', () => {
    test('renders home component and confirms all components are rendered that are wrapped in home component', () => {
        // arrange
        render (
            <MemoryRouter>
                <Home
                    name={mockName} 
                    entries={mockEntries}
                    errorStatus={mockErrorStatus} 
                    celebrities={mockCelebrities} 
                    onInputChange={mockOnInputChange}
                    onButtonSubmit={mockOnButtonSubmit}
                    boxes={mockBoxes} 
                    imageUrl={mockImageUrl}
                    input={mockInput}
                    fileLink={mockFileLink}
                    readyToDetectImages={mockReadyToDetectImages}
                    parentRef={mockParentRef}
                    onImageFormClose={mockOnImageFormClose}
                />
            </MemoryRouter>
        );

        // check that all components are being rendered (child components)
        const intro_rank_header = screen.getByRole('generic', { name: /intro-entry-count/i });
        const entry_count_rank = screen.getByRole('generic', { name: /entries-entry-count/i });
        const rtd_header = screen.getByRole('ready-to-detect-text');
        const url_input = screen.getByRole('textbox', { name: /insert-url-here/i });
        const upload_input = screen.getByRole('upload-pictures');
        const detect_button = screen.getByRole('button', { name: /Detect/i });
        
        // assert
        expect(rtd_header).toBeInTheDocument();
        expect(rtd_header).toHaveTextContent('Ready To Detect Celebrities: ✔️');
        expect(url_input).toBeInTheDocument();
        expect(url_input).toHaveValue('');
        expect(upload_input).toBeInTheDocument();
        expect(detect_button).toBeInTheDocument();
        expect(intro_rank_header).toHaveTextContent('Jim, your current entry count is...');
        expect(entry_count_rank).toHaveTextContent('2');
    });

    test('When a valid file (uploaded) is submitted we can now see the FaceRecognition Component', async() => {
        // arrange
        render (
            <MemoryRouter>
                <Home
                    name={mockName} 
                    entries={mockEntries}
                    errorStatus={mockErrorStatus} 
                    celebrities={mockCelebrities} 
                    onInputChange={mockOnInputChange}
                    onButtonSubmit={mockOnButtonSubmit}
                    boxes={mockBoxes} 
                    imageUrl={mockImageUrl}
                    input={mockInput}
                    fileLink={mockFileLink}
                    readyToDetectImages={mockReadyToDetectImages}
                    parentRef={mockParentRef}
                    onImageFormClose={mockOnImageFormClose}
                />
            </MemoryRouter>
        );

        const upload_input = screen.getByRole('upload-pictures');
        const detect_button = screen.getByRole('button', { name: /Detect/i });

        await userEvent.click(detect_button);
        
        expect(upload_input).not.toBeDisabled();
        expect(screen.getByRole('valid-span')).toHaveTextContent('Wow is that Celeb1, and Celeb2?');
        expect(screen.queryByRole('error-span')).toBeNull();
        expect(screen.getByRole('img', { name: /show-user-inserted-image/i })).toHaveAttribute('src', 'happy.png');
        expect(mockOnButtonSubmit).toHaveBeenCalledTimes(1);
    });

    test('When a valid file url is submitted we can now see the FaceRecognition Component', async() => {
        // arrange
        render (
            <MemoryRouter>
                <Home
                    name={mockName} 
                    entries={mockEntries}
                    errorStatus={mockErrorStatus} 
                    celebrities={mockCelebrities} 
                    onInputChange={mockOnInputChange}
                    onButtonSubmit={mockOnButtonSubmit}
                    boxes={mockBoxes} 
                    imageUrl={''}
                    input={'some-url.png'}
                    fileLink={mockFileLink}
                    readyToDetectImages={mockReadyToDetectImages}
                    parentRef={mockParentRef}
                    onImageFormClose={mockOnImageFormClose}
                />
            </MemoryRouter>
        );

        const upload_input = screen.getByRole('upload-pictures');
        const detect_button = screen.getByRole('button', { name: /Detect/i });

        await userEvent.click(detect_button);

        expect(upload_input).toBeDisabled();
        expect(screen.getByRole('valid-span')).toHaveTextContent('Wow is that Celeb1, and Celeb2?');
        expect(screen.queryByRole('error-span')).toBeNull();
        expect(mockOnButtonSubmit).toHaveBeenCalledTimes(2);
    });

    test('When we click close button on FaceRecognition we can now see ImageLinkForm component, which is shown by default', async() => {
        // arrange
        render (
            <MemoryRouter>
                <Home
                    name={mockName} 
                    entries={mockEntries}
                    errorStatus={mockErrorStatus} 
                    celebrities={mockCelebrities} 
                    onInputChange={mockOnInputChange}
                    onButtonSubmit={mockOnButtonSubmit}
                    boxes={mockBoxes} 
                    imageUrl={''}
                    input={'some-url.png'}
                    fileLink={mockFileLink}
                    readyToDetectImages={mockReadyToDetectImages}
                    parentRef={mockParentRef}
                    onImageFormClose={mockOnImageFormClose}
                />
            </MemoryRouter>
        );

        const detect_button = screen.getByRole('button', { name: /Detect/i });

        await userEvent.click(detect_button);
        
        const close_button = screen.getByRole('generic', { name: /reset-image-button/i });

        await userEvent.click(close_button);

        expect(screen.getByRole('ready-to-detect-text')).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: /insert-url-here/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Detect/i })).toBeInTheDocument();
        expect(screen.getByRole('upload-pictures')).toBeInTheDocument();
    });

    test('Test that an invalid url displays the error message on FaceRecognition component', async() => {
        // arrange (Note we are setting the error status here manually but in integration tests in App.test.jsx we will confirm that invalid url types are creating an error)
        render (
            <MemoryRouter>
                <Home
                    name={mockName} 
                    entries={mockEntries}
                    errorStatus={true} 
                    celebrities={mockCelebrities} 
                    onInputChange={mockOnInputChange}
                    onButtonSubmit={mockOnButtonSubmit}
                    boxes={mockBoxes} 
                    imageUrl={'some-invalid-image.png'}
                    input={'some-url.png'}
                    fileLink={mockFileLink}
                    readyToDetectImages={mockReadyToDetectImages}
                    parentRef={mockParentRef}
                    onImageFormClose={mockOnImageFormClose}
                />
            </MemoryRouter>
        );

        const detect_button = screen.getByRole('button', { name: /Detect/i });

        await userEvent.click(detect_button);

        expect(screen.getByRole('error-span')).toHaveTextContent("Sorry, I wasn't able to detect any faces...");
    });
});