import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import SignIn from '../../components/SignIn/SignIn';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import ForgotPassword from '../../components/ForgotPassword/ForgotPassword';
import { APP_URL } from '../../config';

const server = setupServer(
    http.post(`${APP_URL}/api/signin`, async ({ request }) => {
        const loginInfo = await request.json();

        if(loginInfo.email === 'test@gmail.com' && loginInfo.password === 'password') {
            return HttpResponse.json({ userId: 1, success: 'true', token: 'some token' });
        }

        else {
            return new HttpResponse(null, {
                status: 404
            });
        }
    }),

    http.get(`${APP_URL}/api/profile/:id`, async(info) => {
        const id = info.params.id;
        const token = info.request.headers.get('Authorization');
        // this is with the assumption only one user with an id of 1 exists
        if(id === '1' && token === 'some token') {
            return HttpResponse.json({ id: 1, email: 'test@gmail.com', name: 'Jim', entries: 0, image_key: 'some url'});
        }

        else {
            return HttpResponse.json('Unauthorized');
        }
    }),

    http.get(`${APP_URL}/api/upload/signedurl`, (info) => {
        return HttpResponse.json({ imageUrl: 'url' });
    })
);


beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());


// check that this is called with a user object
const mockLoadUser = jest.fn();
// check that a route change is passed correctly
const mockRouteChange = jest.fn();

describe('<SignIn /> Component', () => {
    test('Ensure all elements render for SignIn component', () => {
        // arrange
        render(
            <MemoryRouter initialEntries={['/']}>
                <SignIn loadUser={mockLoadUser} onRouteChange={mockRouteChange} />
            </MemoryRouter>
        );

        const header = screen.getByRole('group', { name: /Sign In/i });
        const email_input = screen.getByRole('textbox', { name: /Email/i });
        const password_input = screen.getByRole('password-input');
        const show_hide_button = screen.getByRole('button', { name: /password_visibility/i });
        const sign_in_button = screen.getByRole('button', { name: /signin_button/i });
        const forgot_password_link = screen.getByRole('link', { name: /fp_page_link/i });

        // assert
        expect(header).toBeInTheDocument();
        expect(email_input).toBeInTheDocument();
        expect(password_input).toBeInTheDocument();
        expect(show_hide_button).toBeInTheDocument();
        expect(sign_in_button).toBeInTheDocument();
        expect(forgot_password_link).toBeInTheDocument();
    });

    test('tests a valid signin', async() => {
        // arrange
        render(
            <MemoryRouter>
                <SignIn loadUser={mockLoadUser} onRouteChange={mockRouteChange} />
            </MemoryRouter>
        );

        const email_input = screen.getByRole('textbox', { name: /Email/i });
        const password_input = screen.getByRole('password-input');
        const show_hide_button = screen.getByRole('button', { name: /password_visibility/i });
        const sign_in_button = screen.getByRole('button', { name: /signin_button/i });

        // act
        await userEvent.type(email_input, "test@gmail.com");
        await userEvent.type(password_input, "password");
        await userEvent.click(show_hide_button);
        await userEvent.click(sign_in_button);

        // test
        expect(password_input).toHaveAttribute('type', 'text');
        expect(email_input).toHaveValue("test@gmail.com");
        expect(password_input).toHaveValue("password");
        expect(mockLoadUser).toHaveBeenCalledTimes(1);
        expect(mockRouteChange).toHaveBeenCalledTimes(1);
        expect(mockRouteChange).toHaveBeenCalledWith('home');
    });

    test('tests an invalid signin with a bad email/password', async() => {
        server.use(
            http.post(`${APP_URL}/api/signin`, async ({ request }) => {
                const loginInfo = await request.json();
        
                if(loginInfo.email === 'test1@gmail.com' && loginInfo.password === 'password1') {
                    return HttpResponse.json({ userId: 1, success: 'true', token: 'some token' });
                }
        
                else {
                    return new HttpResponse(null, {
                        status: 404
                    });
                }
            }),
        
            http.get(`${APP_URL}/api/profile/:id`, async(info) => {
                const id = info.params.id;
                const token = info.request.headers.get('Authorization');
        
                // this is with the assumption only one user with an id of 1 exists
                if(id === '1' && token === 'some token') {
                    return HttpResponse.json({ id: 1, email: 'test@gmail.com', name: 'Jim', entries: 0, profile_picture: 'some url'});
                }
        
                else {
                    return new HttpResponse(null, {
                        status: 401
                    });
                }
            }),
        
            http.get(`${APP_URL}/api/upload/signedurl`, (info) => {
                return HttpResponse.json({ imageUrl: 'url' });
            })
        );

        // arrange
        render(
            <MemoryRouter>
                <SignIn loadUser={mockLoadUser} onRouteChange={mockRouteChange} />
            </MemoryRouter>
        );

        const email_input = screen.getByRole('textbox', { name: /Email/i });
        const password_input = screen.getByRole('password-input');
        const show_hide_button = screen.getByRole('button', { name: /password_visibility/i });
        const sign_in_button = screen.getByRole('button', { name: /signin_button/i });

        // act
        await userEvent.type(email_input, "test@gmail.com");
        await userEvent.type(password_input, "password");
        await userEvent.click(show_hide_button);
        await userEvent.click(sign_in_button);

        // test
        expect(password_input).toHaveAttribute('type', 'text');
        expect(email_input).toHaveValue("test@gmail.com");
        expect(password_input).toHaveValue("password");
        // ensure props have not been called again
        expect(mockLoadUser).toHaveBeenCalledTimes(1);
        expect(mockRouteChange).toHaveBeenCalledTimes(1);
        expect(await screen.findByRole('paragraph', { name: /error_text/i })).toBeInTheDocument();
        expect(await screen.findByRole('paragraph', { name: /error_text/i })).toHaveTextContent('Invalid Email or Password');
    });

    test('tests an invalid signin with a non-matching id for a user', async() => {
        server.use(
            http.post(`${APP_URL}/api/signin`, async ({ request }) => {
                const loginInfo = await request.json();
        
                if(loginInfo.email === 'test@gmail.com' && loginInfo.password === 'password') {
                    return HttpResponse.json({ userId: 2, success: 'true', token: 'some token' });
                }
        
                else {
                    return new HttpResponse(null, {
                        status: 404
                    });
                }
            }),
        
            http.get(`${APP_URL}/api/profile/:id`, async(info) => {
                const id = info.params.id;
                const token = info.request.headers.get('Authorization');
        
                // this is with the assumption only one user with an id of 1 exists
                if(id === '1' && token === 'some token') {
                    return HttpResponse.json({ id: 1, email: 'test@gmail.com', name: 'Jim', entries: 0, profile_picture: 'some url'});
                }
        
                else {
                    return new HttpResponse(null, {
                        status: 404
                    });
                }
            }),
        
            http.get(`${APP_URL}/api/upload/signedurl`, (info) => {
                return HttpResponse.json({ imageUrl: 'url' });
            })
        );

        // arrange
        render(
            <MemoryRouter>
                <SignIn loadUser={mockLoadUser} onRouteChange={mockRouteChange} />
            </MemoryRouter>
        );

        const email_input = screen.getByRole('textbox', { name: /Email/i });
        const password_input = screen.getByRole('password-input');
        const show_hide_button = screen.getByRole('button', { name: /password_visibility/i });
        const sign_in_button = screen.getByRole('button', { name: /signin_button/i });

        // act
        await userEvent.type(email_input, "test@gmail.com");
        await userEvent.type(password_input, "password");
        await userEvent.click(show_hide_button);
        await userEvent.click(sign_in_button);

        // test
        expect(password_input).toHaveAttribute('type', 'text');
        expect(email_input).toHaveValue("test@gmail.com");
        expect(password_input).toHaveValue("password");
        // ensure props have not been called again
        expect(mockLoadUser).toHaveBeenCalledTimes(1);
        expect(mockRouteChange).toHaveBeenCalledTimes(1);
        expect(await screen.findByRole('paragraph', { name: /error_text/i })).toBeInTheDocument();
        expect(await screen.findByRole('paragraph', { name: /error_text/i })).toHaveTextContent('Invalid Email or Password');
    });

    test('tests that forgot password link changes route to "/forgot_password and renders <ForgotPassword />', async() => {
        render (
            <MemoryRouter initialEntries={['/']}>
                <Routes>
                    <Route path='/' element={<SignIn loadUser={mockLoadUser} onRouteChange={mockRouteChange} /> } />
                    <Route path='/forgot_password' element={<ForgotPassword />} />
                </Routes>
            </MemoryRouter>
        );

        const forgot_password_link = screen.getByRole('link', { name: /fp_page_link/i });

        await userEvent.click(forgot_password_link);

        expect(await screen.findByRole('group', { name: /Forgot Password/i })).toBeInTheDocument();
        expect(screen.queryByRole('group', { name: /SignIn/i })).toBeNull();
    });
});