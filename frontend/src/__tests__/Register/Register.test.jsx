import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// This is for testing register (changes page route), check docs.
import { MemoryRouter } from 'react-router-dom';
import Register from '../../components/Register/Register';
import { APP_URL } from '../../config';
 
const exists = (users, email) => {
    const found = false;

    users.forEach(user => {
        if(user.email === email) {
            found = true;
        }
    });

    return found;
};

const server = setupServer(
    http.post(`${APP_URL}/api/register`, async ({ request }) => {
        const users = [{id: 1, name: 'Jimbo', email: 'jimbo@test.com'}];
        const registerInfo = await request.json();

        if(registerInfo.email && registerInfo.name && registerInfo.password && !exists(users, registerInfo.email)) {
            return HttpResponse.json({ user: { id: 2, name: 'Jim', email: 'jim@test.com', entries: 0, profile_picture: '' }, session: { userId: 2, success: 'true', token: 'some token' }});
        }

        else {
            return new HttpResponse(null, {
                status: 404
            });
        }
    })
);


beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const mockLoadUser = jest.fn();
const mockOnRouteChange = jest.fn();
const mockSetIsCheckingSession = jest.fn();

describe('<Register />', () => {
    test('A valid register', async() => {
        // arrange
        render (
            <MemoryRouter>
                <Register loadUser={mockLoadUser} onRouteChange={mockOnRouteChange} setIsCheckingSession={mockSetIsCheckingSession} />
            </MemoryRouter>
        );

        const register_header = screen.getByRole('group', { name: /Register/i });
        const email_input = screen.getByRole('textbox', { name: /Email/i });
        const password_input = screen.getByRole('password-input');
        const name_input = screen.getByRole('textbox', { name: /Name/i });
        const show_hide_pw_button = screen.getByRole('button', { name: /show_hide_button/i });
        const register_button = screen.getByRole('button', { name: /register_submit_button/i });

        // act
        await userEvent.type(name_input, 'Jim');
        await userEvent.type(email_input, 'jim@test.com');
        await userEvent.type(password_input, 'PasswordLong-101!');
        await userEvent.click(show_hide_pw_button);
        await userEvent.click(register_button);

        // assert
        expect(register_header).toBeInTheDocument();
        expect(name_input).toHaveValue('Jim');
        expect(password_input).toHaveValue('PasswordLong-101!');
        expect(email_input).toHaveValue('jim@test.com');
        expect(password_input).toHaveAttribute('type', 'text');
        expect(mockLoadUser).toHaveBeenCalledTimes(1);
        expect(mockOnRouteChange).toHaveBeenCalledTimes(1);
        expect(mockOnRouteChange).toHaveBeenCalledWith('home');
    });

    test('An invalid register with empty password, name, and email', async() => {
        // arrange
        render (
            <MemoryRouter>
                                <Register loadUser={mockLoadUser} onRouteChange={mockOnRouteChange} setIsCheckingSession={mockSetIsCheckingSession} />
            </MemoryRouter>
        );

        const register_header = screen.getByRole('group', { name: /Register/i });
        const email_input = screen.getByRole('textbox', { name: /Email/i });
        const password_input = screen.getByRole('password-input');
        const name_input = screen.getByRole('textbox', { name: /Name/i });
        const show_hide_pw_button = screen.getByRole('button', { name: /show_hide_button/i });
        const register_button = screen.getByRole('button', { name: /register_submit_button/i });

        // act
        await userEvent.click(show_hide_pw_button);
        await userEvent.click(register_button);

        // assert
        expect(register_header).toBeInTheDocument();
        expect(name_input).toHaveValue('');
        expect(password_input).toHaveValue('');
        expect(email_input).toHaveValue('');
        expect(password_input).toHaveAttribute('type', 'text');
        expect(mockLoadUser).toHaveBeenCalledTimes(1);
        expect(mockOnRouteChange).toHaveBeenCalledTimes(1);
        const error_text = await screen.findByRole('paragraph', { name: /error-text/i });
        expect(error_text).toBeInTheDocument();
        expect(error_text).toHaveTextContent('Please enter a name, email, and password.');
    });

    test('An invalid register with invalid name', async() => {
        // arrange
        render (
            <MemoryRouter>
                                <Register loadUser={mockLoadUser} onRouteChange={mockOnRouteChange} setIsCheckingSession={mockSetIsCheckingSession} />
            </MemoryRouter>
        );

        const register_header = screen.getByRole('group', { name: /Register/i });
        const email_input = screen.getByRole('textbox', { name: /Email/i });
        const password_input = screen.getByRole('password-input');
        const name_input = screen.getByRole('textbox', { name: /Name/i });
        const show_hide_pw_button = screen.getByRole('button', { name: /show_hide_button/i });
        const register_button = screen.getByRole('button', { name: /register_submit_button/i });

        // act
        await userEvent.type(name_input, 'J');
        await userEvent.type(email_input, 'jim@test.com');
        await userEvent.type(password_input, 'PasswordLong-101!');
        await userEvent.click(show_hide_pw_button);
        await userEvent.click(register_button);

        // assert
        expect(register_header).toBeInTheDocument();
        expect(name_input).toHaveValue('J');
        expect(password_input).toHaveValue('PasswordLong-101!');
        expect(email_input).toHaveValue('jim@test.com');
        expect(password_input).toHaveAttribute('type', 'text');
        expect(mockLoadUser).toHaveBeenCalledTimes(1);
        expect(mockOnRouteChange).toHaveBeenCalledTimes(1);
        const error_text = await screen.findByRole('paragraph', { name: /error-text/i });
        expect(error_text).toBeInTheDocument();
        expect(error_text).toHaveTextContent('Please enter a valid name which is at least 2 characters long.');
    });

    test('An invalid register with invalid email', async() => {
        // arrange
        render (
            <MemoryRouter>
                <Register loadUser={mockLoadUser} onRouteChange={mockOnRouteChange} setIsCheckingSession={mockSetIsCheckingSession} />
            </MemoryRouter>
        );

        const register_header = screen.getByRole('group', { name: /Register/i });
        const email_input = screen.getByRole('textbox', { name: /Email/i });
        const password_input = screen.getByRole('password-input');
        const name_input = screen.getByRole('textbox', { name: /Name/i });
        const show_hide_pw_button = screen.getByRole('button', { name: /show_hide_button/i });
        const register_button = screen.getByRole('button', { name: /register_submit_button/i });

        // act
        await userEvent.type(name_input, 'Jim');
        await userEvent.type(email_input, 'jiminvalidemail');
        await userEvent.type(password_input, 'PasswordLong-101!');
        await userEvent.click(show_hide_pw_button);
        await userEvent.click(register_button);

        // assert
        expect(register_header).toBeInTheDocument();
        expect(name_input).toHaveValue('Jim');
        expect(password_input).toHaveValue('PasswordLong-101!');
        expect(email_input).toHaveValue('jiminvalidemail');
        expect(password_input).toHaveAttribute('type', 'text');
        expect(mockLoadUser).toHaveBeenCalledTimes(1);
        expect(mockOnRouteChange).toHaveBeenCalledTimes(1);
        const error_text = await screen.findByRole('paragraph', { name: /error-text/i });
        expect(error_text).toBeInTheDocument();
        expect(error_text).toHaveTextContent('Please enter a valid email address.');
    });

    test('An invalid register with a bad password', async() => {
        // arrange
        render (
            <MemoryRouter>
                <Register loadUser={mockLoadUser} onRouteChange={mockOnRouteChange} setIsCheckingSession={mockSetIsCheckingSession} />
            </MemoryRouter>
        );

        const register_header = screen.getByRole('group', { name: /Register/i });
        const email_input = screen.getByRole('textbox', { name: /Email/i });
        const password_input = screen.getByRole('password-input');
        const name_input = screen.getByRole('textbox', { name: /Name/i });
        const show_hide_pw_button = screen.getByRole('button', { name: /show_hide_button/i });
        const register_button = screen.getByRole('button', { name: /register_submit_button/i });

        // act
        await userEvent.type(name_input, 'Jim');
        await userEvent.type(email_input, 'jim@test.com');
        await userEvent.type(password_input, 'invalidpassword');
        await userEvent.click(show_hide_pw_button);
        await userEvent.click(register_button);

        // assert
        expect(register_header).toBeInTheDocument();
        expect(name_input).toHaveValue('Jim');
        expect(password_input).toHaveValue('invalidpassword');
        expect(email_input).toHaveValue('jim@test.com');
        expect(password_input).toHaveAttribute('type', 'text');
        expect(mockLoadUser).toHaveBeenCalledTimes(1);
        expect(mockOnRouteChange).toHaveBeenCalledTimes(1);
        const error_text = await screen.findByRole('paragraph', { name: /error-text/i });
        expect(error_text).toBeInTheDocument();
        expect(error_text).toHaveTextContent('Please enter a valid password which has 14 characters and at least 1 uppercase letter, lowercase letter, number, and special character.');
    });

    test('An invalid register because user already exists', async() => {
        // arrange
        render (
            <MemoryRouter>
                <Register loadUser={mockLoadUser} onRouteChange={mockOnRouteChange} setIsCheckingSession={mockSetIsCheckingSession} />
            </MemoryRouter>
        );

        const register_header = screen.getByRole('group', { name: /Register/i });
        const email_input = screen.getByRole('textbox', { name: /Email/i });
        const password_input = screen.getByRole('password-input');
        const name_input = screen.getByRole('textbox', { name: /Name/i });
        const show_hide_pw_button = screen.getByRole('button', { name: /show_hide_button/i });
        const register_button = screen.getByRole('button', { name: /register_submit_button/i });

        // act
        await userEvent.type(name_input, 'Jimbo');
        await userEvent.type(email_input, 'jimbo@test.com');
        await userEvent.type(password_input, 'PasswordLong-101!');
        await userEvent.click(show_hide_pw_button);
        await userEvent.click(register_button);

        // assert
        expect(register_header).toBeInTheDocument();
        expect(name_input).toHaveValue('Jimbo');
        expect(password_input).toHaveValue('PasswordLong-101!');
        expect(email_input).toHaveValue('jimbo@test.com');
        expect(password_input).toHaveAttribute('type', 'text');
        expect(mockLoadUser).toHaveBeenCalledTimes(1);
        expect(mockOnRouteChange).toHaveBeenCalledTimes(1);
        const error_text = await screen.findByRole('paragraph', { name: /error-text/i });
        expect(error_text).toBeInTheDocument();
        expect(error_text).toHaveTextContent('Invalid registration, please try again.');
    });
});