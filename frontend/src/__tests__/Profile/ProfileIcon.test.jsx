import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProfileIcon from '../../components/Profile/ProfileIcon';

const mockOnRouteChange = jest.fn();
const mockToggleModal = jest.fn();
const mockToggleDeleteModal = jest.fn();
const mockProfilePicture = 'some profile image url';

describe('<ProfileIcon />', () => {
    test('Profile icon renders and dropdown does not display by default', () => {
        // arrange
        render (
            <ProfileIcon 
                onRouteChange={mockOnRouteChange} 
                toggleModal={mockToggleModal} 
                toggleDeleteModal={mockToggleDeleteModal} 
                profile_picture={mockProfilePicture} 
            />
        );

        const dropdown = screen.getByRole('dropdown');
        const dropdownToggle = screen.getByRole('dropdown-toggle');
        const dropdownMenu = screen.getByRole('menu', { hidden: true });

        // assert
        expect(dropdown).toBeInTheDocument();
        expect(dropdownToggle).toBeInTheDocument();
        expect(dropdownMenu).toBeInTheDocument();
        expect(screen.getByRole('menuitem', { hidden: true, name: /View Profile/i })).toBeInTheDocument();
        expect(screen.getByRole('menuitem', { hidden: true, name: /Delete Account/i })).toBeInTheDocument();
        expect(screen.getByRole('menuitem', { hidden: true, name: /Sign Out/i })).toBeInTheDocument();
        expect(dropdownToggle).toHaveAttribute('aria-expanded', 'false');
        expect(dropdownMenu).toHaveAttribute('aria-hidden', 'true');
    });

    test('Clicking on profile icon toggles the dropdown to show a list of options', async() => {
        // arrange
        render (
            <ProfileIcon 
                onRouteChange={mockOnRouteChange} 
                toggleModal={mockToggleModal} 
                toggleDeleteModal={mockToggleDeleteModal} 
                profile_picture={mockProfilePicture} 
            />
        );

        const dropdown = screen.getByRole('dropdown');
        const dropdownToggle = screen.getByRole('dropdown-toggle');

        // act
        await userEvent.click(dropdownToggle);

        // assert
        expect(dropdown).toBeInTheDocument();
        expect(dropdownToggle).toBeInTheDocument();
        expect(screen.getByRole('menu')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByRole('menuitem', { hidden: false, name: /View Profile/i })).toBeInTheDocument();
            expect(screen.getByRole('menuitem', { hidden: false, name: /Delete Account/i })).toBeInTheDocument();
            expect(screen.getByRole('menuitem', { hidden: false, name: /Sign Out/i })).toBeInTheDocument();
            expect(dropdownToggle).toHaveAttribute('aria-expanded', 'true');
            expect(screen.getByRole('menu')).toHaveAttribute('aria-hidden', 'false');
        });
    });

    test('Clicking on each dropdown profile item calls props', async() => {
        // arrange
        render (
            <ProfileIcon 
                onRouteChange={mockOnRouteChange} 
                toggleModal={mockToggleModal} 
                toggleDeleteModal={mockToggleDeleteModal} 
                profile_picture={mockProfilePicture} 
            />
        );

        const dropdown = screen.getByRole('dropdown');
        const dropdownToggle = screen.getByRole('dropdown-toggle');

        // act
        await userEvent.click(dropdownToggle);
        await userEvent.click(screen.getByRole('menuitem', { name: /View Profile/i }));

        // assert
        expect(dropdown).toBeInTheDocument();
        expect(dropdownToggle).toBeInTheDocument();
        expect(screen.getByRole('menu', { hidden: true })).toBeInTheDocument();
        expect(screen.getByRole('menuitem', { hidden: true, name: /Delete Account/i })).toBeInTheDocument();
        expect(screen.getByRole('menuitem', { hidden: true, name: /Sign Out/i })).toBeInTheDocument();
        expect(mockToggleModal).toHaveBeenCalledTimes(1);
        expect(mockToggleDeleteModal).toHaveBeenCalledTimes(0);
        expect(mockOnRouteChange).toHaveBeenCalledTimes(0);
    });

    test('Clicking on each dropdown delete account item calls props', async() => {
        // arrange
        render (
            <ProfileIcon 
                onRouteChange={mockOnRouteChange} 
                toggleModal={mockToggleModal} 
                toggleDeleteModal={mockToggleDeleteModal} 
                profile_picture={mockProfilePicture} 
            />
        );

        const dropdown = screen.getByRole('dropdown');
        const dropdownToggle = screen.getByRole('dropdown-toggle');

        // act
        await userEvent.click(dropdownToggle);
        await userEvent.click(screen.getByRole('menuitem', { name: /Delete Account/i }));

        // assert
        expect(dropdown).toBeInTheDocument();
        expect(dropdownToggle).toBeInTheDocument();
        expect(screen.getByRole('menu', { hidden: true })).toBeInTheDocument();
        expect(screen.getByRole('menuitem', { hidden: true, name: /View Profile/i })).toBeInTheDocument();
        expect(screen.getByRole('menuitem', { hidden: true, name: /Sign Out/i })).toBeInTheDocument();
        expect(mockToggleModal).toHaveBeenCalledTimes(1);
        expect(mockToggleDeleteModal).toHaveBeenCalledTimes(1);
        expect(mockOnRouteChange).toHaveBeenCalledTimes(0);
    });

    test('Clicking on each dropdown sign out item calls props', async() => {
        // arrange
        render (
            <ProfileIcon 
                onRouteChange={mockOnRouteChange} 
                toggleModal={mockToggleModal} 
                toggleDeleteModal={mockToggleDeleteModal} 
                profile_picture={mockProfilePicture} 
            />
        );

        const dropdown = screen.getByRole('dropdown');
        const dropdownToggle = screen.getByRole('dropdown-toggle');

        // act
        await userEvent.click(dropdownToggle);
        await userEvent.click(screen.getByRole('menuitem', { name: /Sign Out/i }));

        // assert
        expect(dropdown).toBeInTheDocument();
        expect(dropdownToggle).toBeInTheDocument();
        expect(screen.getByRole('menu', { hidden: true })).toBeInTheDocument();
        expect(screen.getByRole('menuitem', { hidden: true, name: /Delete Account/i })).toBeInTheDocument();
        expect(screen.getByRole('menuitem', { hidden: true, name: /Sign Out/i })).toBeInTheDocument();
        expect(mockToggleModal).toHaveBeenCalledTimes(1);
        expect(mockToggleDeleteModal).toHaveBeenCalledTimes(1);
        expect(mockOnRouteChange).toHaveBeenCalledTimes(1);
        expect(mockOnRouteChange).toHaveBeenCalledWith('signout');
    });
});