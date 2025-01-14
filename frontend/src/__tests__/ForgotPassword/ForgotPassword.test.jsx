import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ForgotPassword from '../../components/ForgotPassword/ForgotPassword';
import { APP_URL } from '../../config';

const validUserEmail = (users, email) => {
    let exists = false;

    users.forEach((user) => {
        if(user.email === email) {
            exists = true;
        }
    });

    return exists;
};

const server = setupServer (
    http.post(`${APP_URL}/api/forgot_password`, async({ request }) => {
        const forgotPasswordJson = await request.json();

        if(forgotPasswordJson.email && validUserEmail([{ email: 'test@gmail.com' }], forgotPasswordJson.email)) {
            return HttpResponse.json('success');
        }

        else {
            return new HttpResponse(null, { status: 404 });
        }
    })
);

const mockIsSignedIn = false;

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('<ForgotPassword />', () => {
    test('sending a valid password reset', async() => {
        // arrange
        render (
            <MemoryRouter>
                <ForgotPassword isSignedIn={mockIsSignedIn} />
            </MemoryRouter>
        );

        const fp_header = screen.getByRole('group', { name: /Forgot Password/i });
        const email_input = screen.getByRole('textbox', { name: /Email/i });
        const submit_button = screen.getByRole('button');

        // act
        await userEvent.type(email_input, 'test@gmail.com');
        await userEvent.click(submit_button);

        // assert
        expect(fp_header).toBeInTheDocument();
        expect(email_input).toHaveValue('test@gmail.com');

        await waitFor(() => {
            expect(screen.getByRole('paragraph', { name: /success-text/i })).toHaveTextContent('Password Reset Request Sent!');
        });
    });

    test('sending an invalid password reset', async() => {
        // arrange
        render (
            <MemoryRouter>
                <ForgotPassword isSignedIn={mockIsSignedIn} />
            </MemoryRouter>
        );

        const fp_header = screen.getByRole('group', { name: /Forgot Password/i });
        const email_input = screen.getByRole('textbox', { name: /Email/i });
        const submit_button = screen.getByRole('button');

        // act
        await userEvent.type(email_input, 'test2@gmail.com');
        await userEvent.click(submit_button);

        // assert
        expect(fp_header).toBeInTheDocument();
        expect(email_input).toHaveValue('test2@gmail.com');

        await waitFor(() => {
            expect(screen.getByRole('paragraph', { name: /error-text/i })).toHaveTextContent('Invalid Email or Password');
        });
    });
});
