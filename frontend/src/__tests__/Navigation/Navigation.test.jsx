import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Navigation from '../../components/Navigation/Navigation';

const mockOnRouteChange = jest.fn();
const mockIsSignedIn = true;
const mockToggleModal = jest.fn();
const mockToggleDeleteModal = jest.fn();
const mockProfilePicture = 'some url';

describe('<Navigation />', () => {
    test('check for rendering of profile icon and absense of sign in and register links when signed in', async() => {
        // arrange
        render (
            <MemoryRouter>
                <Navigation 
                    onRouteChange={mockOnRouteChange}
                    isSignedIn={mockIsSignedIn}
                    toggleModal={mockToggleModal}
                    toggleDeleteModal={mockToggleDeleteModal}
                    profile_picture={mockProfilePicture}
                />
            </MemoryRouter>
        );


        // assert (expect profile image to be shown when logged in)
        waitFor(() => {
            expect(screen.getByRole('img')).toBeInTheDocument();
            expect(screen.getByRole('img')).toHaveAttribute('src', 'some url');
            expect(screen.queryByRole('link', { name: /signin_link/i })).toBeNull();
        });
    });

    test('check for rendering sign in and register links when not signed in and check that signin route is called correctly on click', async() => {
        // arrange
        render (
            <MemoryRouter>
                <Navigation 
                    onRouteChange={mockOnRouteChange}
                    isSignedIn={!mockIsSignedIn}
                    toggleModal={mockToggleModal}
                    toggleDeleteModal={mockToggleDeleteModal}
                    profile_picture={mockProfilePicture}
                />
            </MemoryRouter>
        );

        const signin_link = screen.getByRole('link', { name: /signin_link/i });
        const register_link = screen.getByRole('link', { name: /register_link/i });
        // we may want to update this implementation soon
        const signin_text_link = screen.getByRole('paragraph', { name: /signin_text/i });

        // act
        await userEvent.click(signin_text_link);

        // assert
        expect(signin_link).toBeInTheDocument();
        expect(mockOnRouteChange).toHaveBeenCalledTimes(1);
        expect(mockOnRouteChange).toHaveBeenCalledWith('signin');
        expect(register_link).toBeInTheDocument();
        expect(screen.queryByRole('img')).toBeNull();
    });

    
    test('check for rendering sign in and register links when not signed in and check that register route is called correctly on click', async() => {
        // arrange
        render (
            <MemoryRouter>
                <Navigation 
                    onRouteChange={mockOnRouteChange}
                    isSignedIn={!mockIsSignedIn}
                    toggleModal={mockToggleModal}
                    toggleDeleteModal={mockToggleDeleteModal}
                    profile_picture={mockProfilePicture}
                />
            </MemoryRouter>
        );

        const signin_link = screen.getByRole('link', { name: /signin_link/i });
        const register_link = screen.getByRole('link', { name: /register_link/i });
        // we may want to update this implementation soon
        const register_text_link = screen.getByRole('paragraph', { name: /register_text/i });

        // act
        await userEvent.click(register_text_link);

        // assert
        expect(signin_link).toBeInTheDocument();
        expect(mockOnRouteChange).toHaveBeenCalledTimes(2);
        expect(mockOnRouteChange).toHaveBeenCalledWith('register');
        expect(register_link).toBeInTheDocument();
        expect(screen.queryByRole('img')).toBeNull();
    });
});