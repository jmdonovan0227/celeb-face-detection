import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ResetPassword from '../../components/ResetPassword/ResetPassword';
import { APP_URL } from '../../config';

const server = setupServer(
    http.post(`${APP_URL}/api/reset_password`, async ({ request }) => {
        const resetPasswordInfo = await request.json();
        const token = 'a valid non-expired token';

        if(token === 'a valid non-expired token') {
            return HttpResponse.json('Password reset!');
        }

        else {
            return new HttpResponse(null, {
                status: 401
            });
        }
    })
);

const mockIsSignedIn = false;

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('<ResetPassword />', () => {
    test('valid reset password', async() => {
        // arrange
        render(
            <MemoryRouter>
                <ResetPassword isSignedIn={mockIsSignedIn} />
            </MemoryRouter>
        );

        const reset_header = screen.getByRole('group', { name: /Reset Password/i });
        const new_password_input = screen.getByRole('password-input', { name: /New Password/i });
        const retype_password_input = screen.getByRole('password-input', { name: /Retype Password/i });
        const show_hide_pw_button = screen.getByRole('button', { name: /show-hide-button/i });
        const reset_pw_button = screen.getByRole('button', { name: /reset-button/i });
        const pw_match = screen.getByRole('paragraph', { name: /pw-match/i });
        const pw_valid = screen.getByRole('paragraph', { name: /pw-valid/i });

        // act
        await userEvent.type(new_password_input, 'PasswordLong-101!');
        await userEvent.type(retype_password_input, 'PasswordLong-101!');
        await userEvent.click(show_hide_pw_button);
        await userEvent.click(reset_pw_button);

        // assert
        expect(reset_header).toBeInTheDocument();
        expect(new_password_input).toHaveValue('PasswordLong-101!');
        expect(retype_password_input).toHaveValue('PasswordLong-101!');
        expect(new_password_input).toHaveAttribute('type', 'text');
        expect(retype_password_input).toHaveAttribute('type', 'text');
        expect(pw_match).toHaveTextContent('True');
        expect(pw_valid).toHaveTextContent('True');
        const success_text = await screen.findByRole('paragraph', { name: /pw-reset-success-text/i });
        expect(success_text).toBeInTheDocument();
        expect(success_text).toHaveTextContent('Password successfully reset!');
    });

    test('invalid reset password invalid token', async() => {
        // arrange
        server.use(
            http.post(`${APP_URL}/api/reset_password`, async ({ request }) => {
                const resetPasswordInfo = await request.json();
                const token = 'an invalid token';
        
                if(token === 'a valid non-expired token') {
                    return HttpResponse.json('Password reset!');
                }
        
                else {
                    return new HttpResponse(null, {
                        status: 401
                    });
                }
            })
        );

        render(
            <MemoryRouter>
                <ResetPassword isSignedIn={mockIsSignedIn} />
            </MemoryRouter>
        );

        const reset_header = screen.getByRole('group', { name: /Reset Password/i });
        const new_password_input = screen.getByRole('password-input', { name: /New Password/i });
        const retype_password_input = screen.getByRole('password-input', { name: /Retype Password/i });
        const show_hide_pw_button = screen.getByRole('button', { name: /show-hide-button/i });
        const reset_pw_button = screen.getByRole('button', { name: /reset-button/i });
        const pw_match = screen.getByRole('paragraph', { name: /pw-match/i });
        const pw_valid = screen.getByRole('paragraph', { name: /pw-valid/i });

        // act
        await userEvent.type(new_password_input, 'PasswordLong-101!');
        await userEvent.type(retype_password_input, 'PasswordLong-101!');
        await userEvent.click(show_hide_pw_button);
        await userEvent.click(reset_pw_button);

        // assert
        expect(reset_header).toBeInTheDocument();
        expect(new_password_input).toHaveValue('PasswordLong-101!');
        expect(retype_password_input).toHaveValue('PasswordLong-101!');
        expect(new_password_input).toHaveAttribute('type', 'text');
        expect(retype_password_input).toHaveAttribute('type', 'text');
        expect(pw_match).toHaveTextContent('True');
        expect(pw_valid).toHaveTextContent('True');
        const error_text = await screen.findByRole('paragraph', { name: /pw-reset-failure-text/i });
        expect(error_text).toBeInTheDocument();
        expect(error_text).toHaveTextContent('Error resetting password');
    });

    test('invalid reset password where password does not meet password requirements', async() => {
        // arrange
        render(
            <MemoryRouter>
                <ResetPassword isSignedIn={mockIsSignedIn} />
            </MemoryRouter>
        );

        const reset_header = screen.getByRole('group', { name: /Reset Password/i });
        const new_password_input = screen.getByRole('password-input', { name: /New Password/i });
        const retype_password_input = screen.getByRole('password-input', { name: /Retype Password/i });
        const show_hide_pw_button = screen.getByRole('button', { name: /show-hide-button/i });
        const reset_pw_button = screen.getByRole('button', { name: /reset-button/i });
        const pw_match = screen.getByRole('paragraph', { name: /pw-match/i });
        const pw_valid = screen.getByRole('paragraph', { name: /pw-valid/i });

        // act
        await userEvent.type(new_password_input, 'invalidpassword');
        await userEvent.type(retype_password_input, 'invalidpassword');
        await userEvent.click(show_hide_pw_button);
        await userEvent.click(reset_pw_button);

        // assert
        expect(reset_header).toBeInTheDocument();
        expect(new_password_input).toHaveValue('invalidpassword');
        expect(retype_password_input).toHaveValue('invalidpassword');
        expect(new_password_input).toHaveAttribute('type', 'text');
        expect(retype_password_input).toHaveAttribute('type', 'text');
        expect(pw_match).toHaveTextContent('True');
        expect(pw_valid).toHaveTextContent('False');
        const error_text = await screen.findByRole('paragraph', { name: /pw-reset-failure-text/i });
        expect(error_text).toBeInTheDocument();
        expect(error_text).toHaveTextContent('Passwords must be at least 14 characters long and have at least 1 upper case letter, lower case letter, number, and special character');
    });

    test('invalid reset password where passwords do not match', async() => {
        // arrange
        render(
            <MemoryRouter>
                <ResetPassword isSignedIn={mockIsSignedIn} />
            </MemoryRouter>
        );

        const reset_header = screen.getByRole('group', { name: /Reset Password/i });
        const new_password_input = screen.getByRole('password-input', { name: /New Password/i });
        const retype_password_input = screen.getByRole('password-input', { name: /Retype Password/i });
        const show_hide_pw_button = screen.getByRole('button', { name: /show-hide-button/i });
        const reset_pw_button = screen.getByRole('button', { name: /reset-button/i });
        const pw_match = screen.getByRole('paragraph', { name: /pw-match/i });
        const pw_valid = screen.getByRole('paragraph', { name: /pw-valid/i });

        // act
        await userEvent.type(new_password_input, 'PasswordLong-101!');
        await userEvent.type(retype_password_input, 'PasswordLong-102!');
        await userEvent.click(show_hide_pw_button);
        await userEvent.click(reset_pw_button);

        // assert
        expect(reset_header).toBeInTheDocument();
        expect(new_password_input).toHaveValue('PasswordLong-101!');
        expect(retype_password_input).toHaveValue('PasswordLong-102!');
        expect(new_password_input).toHaveAttribute('type', 'text');
        expect(retype_password_input).toHaveAttribute('type', 'text');
        expect(pw_match).toHaveTextContent('False');
        expect(pw_valid).toHaveTextContent('False');
        const error_text = await screen.findByRole('paragraph', { name: /pw-reset-failure-text/i });
        expect(error_text).toBeInTheDocument();
        expect(error_text).toHaveTextContent('Passwords must match');
    });
});