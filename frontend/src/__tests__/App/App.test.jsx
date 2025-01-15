import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setupServer } from 'msw/node';
import { handlers } from '../../__mocks__/handlers.js'; 
import App from '../../App';

const server = setupServer(...handlers);

jest.mock('particles-bg', () => {
    return () => <div></div>;
});

beforeAll(() => server.listen());
afterEach(() => {
    sessionStorage.clear();
});

afterAll(() => server.close());


describe('<App />', () => {
    test('Valid Flow 1.1: Create Account => land on sign in page click on register link, land on register page', async() => {
        // arrange
        render (
            <App />
        );

        const r_link_text = screen.getByRole('paragraph', { name: /register_text/i });
        
        // act
        await userEvent.click(r_link_text);

        // assert
        expect(screen.getByRole('group', { name: /Register/i })).toBeInTheDocument();
    });

    test('Valid Flow 1.2: Create Account Part 2 => enter valid registration email and password and be sent to home page', async() => {
        // arrange
        render (
            <App />
        );

        // act
        // Step 1 => navigate to register page
        const r_link_text = screen.getByRole('paragraph', { name: /register_text/i });
        await userEvent.click(r_link_text);
        expect(screen.getByRole('group', { name: /Register/i })).toBeInTheDocument();

        // Step 2 => get input fields and enter valid registration info
        const email_input = screen.getByRole('textbox', { name: /Email/i });
        const password_input = screen.getByRole('password-input');
        const name_input = screen.getByRole('textbox', { name: /Name/i });
        const show_hide_pw_button = screen.getByRole('button', { name: /show_hide_button/i });
        const register_button = screen.getByRole('button', { name: /register_submit_button/i });
        await userEvent.type(name_input, 'Jim');
        await userEvent.type(email_input, 'test@gmail.com');
        await userEvent.type(password_input, 'PasswordLong-101!');
        await userEvent.click(show_hide_pw_button);
        await userEvent.click(register_button);

        // Step 3 => grab fields we expect to appear on screen (verify register name is in the document and we have an entry count of 0)
        const introDiv = screen.getByRole('generic', { name: /intro-entry-count/i });
        const entriesDiv = screen.getByRole('generic', { name: /entries-entry-count/i });

        // assert (verify we landed on home page and our user's info is displayed correctly)
        expect(introDiv).toHaveTextContent('Jim, your current entry count is...');
        expect(entriesDiv).toHaveTextContent('0');
    });

    
    test('Valid Flow 2 => Signing In => Verify That Signing in With A Valid User Takes Us To The Home Page', async() => {
        // arrange
        render (
            <App />
        );

        const email_input = screen.getByRole('textbox', { name: /Email/i });
        const password_input = screen.getByRole('password-input');
        const show_hide_button = screen.getByRole('button', { name: /password_visibility/i });
        const sign_in_button = screen.getByRole('button', { name: /signin_button/i });

        // Step 1 => enter valid login info and attempt to login
        await userEvent.type(email_input, "test@gmail.com");
        await userEvent.type(password_input, "PasswordLong-101!");
        await userEvent.click(show_hide_button);
        await userEvent.click(sign_in_button);

        // Step 2 => verify we landed on home page
        const introDiv = screen.getByRole('generic', { name: /intro-entry-count/i });
        const entriesDiv = screen.getByRole('generic', { name: /entries-entry-count/i });

        // assert
        expect(introDiv).toHaveTextContent('Jim, your current entry count is...');
        expect(entriesDiv).toHaveTextContent('2');
    });


    test('Valid Flow 3.1: => Inserting a valid image url => verify that inserting a valid url increments counts and displays on home', async() => {
        // arrange
        render (
            <App />
        );

        const email_input = screen.getByRole('textbox', { name: /Email/i });
        const password_input = screen.getByRole('password-input');
        const show_hide_button = screen.getByRole('button', { name: /password_visibility/i });
        const sign_in_button = screen.getByRole('button', { name: /signin_button/i });

        // Step 1 => enter valid login info and attempt to login
        await userEvent.type(email_input, "test@gmail.com");
        await userEvent.type(password_input, "PasswordLong-101!");
        await userEvent.click(show_hide_button);
        await userEvent.click(sign_in_button);

        // Step 2 => verify we landed on home page
        const introDiv = screen.getByRole('generic', { name: /intro-entry-count/i });
        const entriesDiv = screen.getByRole('generic', { name: /entries-entry-count/i });
        expect(introDiv).toHaveTextContent('Jim, your current entry count is...');
        expect(entriesDiv).toHaveTextContent('2');

        // Step 3 => insert a valid image url
        const url_input = screen.getByRole('textbox', { name: /insert-url-here/i });
        const detect_button = screen.getByRole('button', { name: /Detect/i });

        await userEvent.type(url_input, 'photo.png');
        await userEvent.click(detect_button);

        await waitFor(() => {
            expect(screen.getByRole('valid-span')).toHaveTextContent('Wow is that Celeb Name 1, Celeb Name 2, and Celeb Name 3');
            expect(entriesDiv).toHaveTextContent('3');
        });
    });

    test('Valid Flow 3.2: => Inserting a valid image file => verify that inserting a valid url increments counts and displays on home', async() => {
        // arrange
        render (
            <App />
        );

        const email_input = screen.getByRole('textbox', { name: /Email/i });
        const password_input = screen.getByRole('password-input');
        const show_hide_button = screen.getByRole('button', { name: /password_visibility/i });
        const sign_in_button = screen.getByRole('button', { name: /signin_button/i });

        // Step 1 => enter valid login info and attempt to login
        await userEvent.type(email_input, "test@gmail.com");
        await userEvent.type(password_input, "PasswordLong-101!");
        await userEvent.click(show_hide_button);
        await userEvent.click(sign_in_button);

        // Step 2 => verify we landed on home page
        const introDiv = screen.getByRole('generic', { name: /intro-entry-count/i });
        const entriesDiv = screen.getByRole('generic', { name: /entries-entry-count/i });
        expect(introDiv).toHaveTextContent('Jim, your current entry count is...');
        expect(entriesDiv).toHaveTextContent('2');

        // Step 3 => insert a valid image file type
        const detect_button = screen.getByRole('button', { name: /Detect/i });
        const upload_input = screen.getByRole('upload-pictures');
        const file = new File(['^_^'], 'happy.png', { type: 'image/png' });

        await userEvent.upload(upload_input, file);
        await userEvent.click(detect_button);

        await waitFor(() => {
            expect(screen.getByRole('valid-span')).toHaveTextContent('Wow is that Celeb Name 1, Celeb Name 2, and Celeb Name 3');
            expect(entriesDiv).toHaveTextContent('3');
        });
    });

    test('Valid Flow 4.1: => Clicking on profile icon displays options for viewing profile, deleting account, and signing out', async() => {
        // arrange
        render (
            <App />
        );

        const email_input = screen.getByRole('textbox', { name: /Email/i });
        const password_input = screen.getByRole('password-input');
        const show_hide_button = screen.getByRole('button', { name: /password_visibility/i });
        const sign_in_button = screen.getByRole('button', { name: /signin_button/i });

        // Step 1 => enter valid login info and attempt to login
        await userEvent.type(email_input, "test@gmail.com");
        await userEvent.type(password_input, "PasswordLong-101!");
        await userEvent.click(show_hide_button);
        await userEvent.click(sign_in_button);

        // Step 2 => verify we landed on home page
        const introDiv = screen.getByRole('generic', { name: /intro-entry-count/i });
        const entriesDiv = screen.getByRole('generic', { name: /entries-entry-count/i });

        // assert
        expect(introDiv).toHaveTextContent('Jim, your current entry count is...');
        expect(entriesDiv).toHaveTextContent('2');

        // Step 3 => get connection to profile icon and simulate click event
        const dropdownToggle = screen.getByRole('dropdown-toggle');
        await userEvent.click(dropdownToggle);
        expect(screen.getByRole('menuitem', { name: /View Profile/i })).toBeInTheDocument();
        expect(screen.getByRole('menuitem', { name: /Delete Account/i })).toBeInTheDocument();
        expect(screen.getByRole('menuitem', { name: /Sign Out/i })).toBeInTheDocument();
        expect(dropdownToggle).toHaveAttribute('aria-expanded', 'true');
        expect(screen.getByRole('menu')).toHaveAttribute('aria-hidden', 'false');
    });

    test('Valid Flow 4.2: => Clicking on profile icon profile page displays all profile information about current user', async() => {
        // arrange
        render (
            <App />
        );

        const email_input = screen.getByRole('textbox', { name: /Email/i });
        const password_input = screen.getByRole('password-input');
        const show_hide_button = screen.getByRole('button', { name: /password_visibility/i });
        const sign_in_button = screen.getByRole('button', { name: /signin_button/i });

        // Step 1 => enter valid login info and attempt to login
        await userEvent.type(email_input, "test@gmail.com");
        await userEvent.type(password_input, "PasswordLong-101!");
        await userEvent.click(show_hide_button);
        await userEvent.click(sign_in_button);

        // Step 2 => verify we landed on home page
        const introDiv = screen.getByRole('generic', { name: /intro-entry-count/i });
        const entriesDiv = screen.getByRole('generic', { name: /entries-entry-count/i });

        // assert
        expect(introDiv).toHaveTextContent('Jim, your current entry count is...');
        expect(entriesDiv).toHaveTextContent('2');

        // Step 3 => get connection to profile icon and simulate click event
        const dropdownToggle = screen.getByRole('dropdown-toggle');
        await userEvent.click(dropdownToggle);
        await userEvent.click(screen.getByRole('menuitem', { name: /View Profile/i }));

        await waitFor(() => {
            expect(screen.getByRole('img', { name: /your profile icon secondary/i })).toBeInTheDocument();
            expect(screen.getByRole('generic', { name: /close-button/i })).toBeInTheDocument();
            expect(screen.getByRole('heading', { name: /name/i })).toBeInTheDocument();
            expect(screen.getByRole('paragraph', { name: /joined-date/i })).toBeInTheDocument();
            expect(screen.getByRole('upload-profile-picture')).toBeInTheDocument();
            expect(screen.getByRole('textbox', { name: /Name/i })).toBeInTheDocument();
            expect(screen.getByRole('textbox', { name: /Name/i })).toBeInTheDocument();
            expect(screen.getByRole('textbox', { name: /Name/i })).toHaveAttribute('placeholder', 'Jim');
            expect(screen.getByRole('button', { name: /Save/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
        });
    });

    test('Valid Flow 4.3: => Clicking on profile icon delete account option shows a modal', async() => {
        // arrange
        render (
            <App />
        );

        const email_input = screen.getByRole('textbox', { name: /Email/i });
        const password_input = screen.getByRole('password-input');
        const show_hide_button = screen.getByRole('button', { name: /password_visibility/i });
        const sign_in_button = screen.getByRole('button', { name: /signin_button/i });

        // Step 1 => enter valid login info and attempt to login
        await userEvent.type(email_input, "test@gmail.com");
        await userEvent.type(password_input, "PasswordLong-101!");
        await userEvent.click(show_hide_button);
        await userEvent.click(sign_in_button);

        // Step 2 => verify we landed on home page
        const introDiv = screen.getByRole('generic', { name: /intro-entry-count/i });
        const entriesDiv = screen.getByRole('generic', { name: /entries-entry-count/i });

        // assert
        expect(introDiv).toHaveTextContent('Jim, your current entry count is...');
        expect(entriesDiv).toHaveTextContent('2');

        // Step 3 => get connection to profile icon and simulate click event
        const dropdownToggle = screen.getByRole('dropdown-toggle');
        await userEvent.click(dropdownToggle);
        await userEvent.click(screen.getByRole('menuitem', { name: /Delete Account/i }));

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /Close/i })).toBeInTheDocument();
            expect(screen.getByRole('paragraph', { name: /deletion-header/i })).toBeInTheDocument();
            expect(screen.getByRole('textbox', { name: /Email Address/i })).toBeInTheDocument();
            expect(screen.getByRole('password-input')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /show-hide-pw-button/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /cancel-account-deletion/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /confirm-account-deletion/i })).toBeInTheDocument();
        });
    });

    test('Valid Flow 5 => Delete Account => verify we can delete an existing user account while logged in', async() => {
        // arrange
        render (
            <App />
        );

        const email_input = screen.getByRole('textbox', { name: /Email/i });
        const password_input = screen.getByRole('password-input');
        const show_hide_button = screen.getByRole('button', { name: /password_visibility/i });
        const sign_in_button = screen.getByRole('button', { name: /signin_button/i });

        // Step 1 => enter valid login info and attempt to login
        await userEvent.type(email_input, "test@gmail.com");
        await userEvent.type(password_input, "PasswordLong-101!");
        await userEvent.click(show_hide_button);
        await userEvent.click(sign_in_button);

        // Step 2 => verify we landed on home page
        const introDiv = screen.getByRole('generic', { name: /intro-entry-count/i });
        const entriesDiv = screen.getByRole('generic', { name: /entries-entry-count/i });

        // assert
        expect(introDiv).toHaveTextContent('Jim, your current entry count is...');
        expect(entriesDiv).toHaveTextContent('2');

        // Step 3 => get connection to profile icon and simulate click event
        const dropdownToggle = screen.getByRole('dropdown-toggle');
        await userEvent.click(dropdownToggle);
        await userEvent.click(screen.getByRole('menuitem', { name: /Delete Account/i }));

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /Close/i })).toBeInTheDocument();
            expect(screen.getByRole('paragraph', { name: /deletion-header/i })).toBeInTheDocument();
            expect(screen.getByRole('textbox', { name: /Email Address/i })).toBeInTheDocument();
            expect(screen.getByRole('password-input')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /show-hide-pw-button/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /cancel-account-deletion/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /confirm-account-deletion/i })).toBeInTheDocument();
        });

        // Step 4 => enter valid email and password and click delete/verify results
        const email_input_box = screen.getByRole('textbox', { name: /Email Address/i });
        const password_input_box = screen.getByRole('password-input');
        const show_hide_pw_button = screen.getByRole('button', { name: /show-hide-pw-button/i });
        const confirm_button = screen.getByRole('button', { name: /confirm-account-deletion/i });

        // act
        await userEvent.click(show_hide_pw_button);
        await userEvent.type(email_input_box, 'test@gmail.com');
        await userEvent.type(password_input_box, 'PasswordLong-101!');
        await userEvent.click(confirm_button);

        await waitFor(() => {
            expect(screen.getByRole('group', { name: /Sign In/i })).toBeInTheDocument();
        });
    });

    test('Valid Flow 6 => Signing Out => verify we can sign out a logged in user and we are returned to sign in page', async() => {
        // arrange
        render (
            <App />
        );

        const email_input = screen.getByRole('textbox', { name: /Email/i });
        const password_input = screen.getByRole('password-input');
        const show_hide_button = screen.getByRole('button', { name: /password_visibility/i });
        const sign_in_button = screen.getByRole('button', { name: /signin_button/i });

        // Step 1 => enter valid login info and attempt to login
        await userEvent.type(email_input, "test@gmail.com");
        await userEvent.type(password_input, "PasswordLong-101!");
        await userEvent.click(show_hide_button);
        await userEvent.click(sign_in_button);

        // Step 2 => verify we landed on home page
        const introDiv = screen.getByRole('generic', { name: /intro-entry-count/i });
        const entriesDiv = screen.getByRole('generic', { name: /entries-entry-count/i });

        // assert
        expect(introDiv).toHaveTextContent('Jim, your current entry count is...');
        expect(entriesDiv).toHaveTextContent('2');

        // Step 3 => get connection to profile icon and simulate click event
        const dropdownToggle = screen.getByRole('dropdown-toggle');
        await userEvent.click(dropdownToggle);
        await userEvent.click(screen.getByRole('menuitem', { name: /Sign Out/i }));

        await waitFor(() => {
            expect(screen.getByRole('group', { name: /Sign In/i })).toBeInTheDocument();
        });
    });

    test('Error Flow 1 => Invalid Register => try to log in with an existing user info and confirm we are still on error page and get error message', async() => {
        // arrange
        render (
            <App />
        );

        // act
        // Step 1 => navigate to register page
        const r_link_text = screen.getByRole('paragraph', { name: /register_text/i });
        await userEvent.click(r_link_text);
        expect(screen.getByRole('group', { name: /Register/i })).toBeInTheDocument();

        // Step 2 => get input fields and enter valid registration info
        const email_input = screen.getByRole('textbox', { name: /Email/i });
        const password_input = screen.getByRole('password-input');
        const name_input = screen.getByRole('textbox', { name: /Name/i });
        const show_hide_pw_button = screen.getByRole('button', { name: /show_hide_button/i });
        const register_button = screen.getByRole('button', { name: /register_submit_button/i });
        await userEvent.type(name_input, 'Jimbo');
        await userEvent.type(email_input, 'jimbo@test.com');
        await userEvent.type(password_input, 'PasswordLong-101!');
        await userEvent.click(show_hide_pw_button);
        await userEvent.click(register_button);
        expect(screen.getByRole('group', { name: /Register/i })).toBeInTheDocument();
        expect(screen.getByRole('paragraph', { name: /error-text/i })).toHaveTextContent('Invalid registration, please try again.');
    });

    test('Error Flow 2 => Invalid login => try logging in with invalid login credentials and verify we stay on sign in page and error text is displayed', async() => {
        // arrange
        render (
            <App />
        );

        const email_input = screen.getByRole('textbox', { name: /Email/i });
        const password_input = screen.getByRole('password-input');
        const show_hide_button = screen.getByRole('button', { name: /password_visibility/i });
        const sign_in_button = screen.getByRole('button', { name: /signin_button/i });

        // Step 1 => enter valid login info and attempt to login
        await userEvent.type(email_input, "wrongtest@gmail.com");
        await userEvent.type(password_input, "WrongPasswordLong-101!");
        await userEvent.click(show_hide_button);
        await userEvent.click(sign_in_button);
        expect(screen.getByRole('group', { name: /Sign In/i })).toBeInTheDocument();
        expect(screen.getByRole('paragraph', { name: 'error_text' } )).toHaveTextContent('Invalid Email or Password');
    });

    test('Error Flow 3.1: => Inserting an invalid url => try detecting celebrities with an invalid url type not .png, .jpeg, .jpg, or .webp', async() => {
        // arrange
        render (
            <App />
        );

        const email_input = screen.getByRole('textbox', { name: /Email/i });
        const password_input = screen.getByRole('password-input');
        const show_hide_button = screen.getByRole('button', { name: /password_visibility/i });
        const sign_in_button = screen.getByRole('button', { name: /signin_button/i });

        // Step 1 => enter valid login info and attempt to login
        await userEvent.type(email_input, "test@gmail.com");
        await userEvent.type(password_input, "PasswordLong-101!");
        await userEvent.click(show_hide_button);
        await userEvent.click(sign_in_button);

        // Step 2 => verify we landed on home page
        const introDiv = screen.getByRole('generic', { name: /intro-entry-count/i });
        const entriesDiv = screen.getByRole('generic', { name: /entries-entry-count/i });
        expect(introDiv).toHaveTextContent('Jim, your current entry count is...');
        expect(entriesDiv).toHaveTextContent('2');

        // Step 3 => insert a valid image url
        const detect_button = screen.getByRole('button', { name: /Detect/i });
        const url_input = screen.getByRole('textbox', { name: /insert-url-here/i });
        await userEvent.type(url_input, 'photo.txt');
        await userEvent.click(detect_button);

        // expect app to block the user from submitting an invalid photo (detect should be disabled);
        await waitFor(() => {
            expect(screen.queryByRole('error-span')).toBeNull();
            expect(entriesDiv).toHaveTextContent('2');
        });
    });

    test('Error Flow 3.2: => Insert invalid file => try detecting celebrities with an invalid file type not .png, .jpeg, .jpg, or .webp', async() => {
        // arrange
        render (
            <App />
        );

        const email_input = screen.getByRole('textbox', { name: /Email/i });
        const password_input = screen.getByRole('password-input');
        const show_hide_button = screen.getByRole('button', { name: /password_visibility/i });
        const sign_in_button = screen.getByRole('button', { name: /signin_button/i });

        // Step 1 => enter valid login info and attempt to login
        await userEvent.type(email_input, "test@gmail.com");
        await userEvent.type(password_input, "PasswordLong-101!");
        await userEvent.click(show_hide_button);
        await userEvent.click(sign_in_button);

        // Step 2 => verify we landed on home page
        const introDiv = screen.getByRole('generic', { name: /intro-entry-count/i });
        const entriesDiv = screen.getByRole('generic', { name: /entries-entry-count/i });
        expect(introDiv).toHaveTextContent('Jim, your current entry count is...');
        expect(entriesDiv).toHaveTextContent('2');

        // Step 3 => insert a valid image file type
        const detect_button = screen.getByRole('button', { name: /Detect/i });
        const upload_input = screen.getByRole('upload-pictures');
        const file = new File(['^_^'], 'happy.txt', { type: 'text/plain' });

        await userEvent.upload(upload_input, file);
        await userEvent.click(detect_button);

        await waitFor(() => {
            expect(screen.queryByRole('error-span')).toBeNull();
            expect(entriesDiv).toHaveTextContent('2');
        });
    });

    test('Error Flow 4 => Invalid delete account => try entering invalid credentials and verify we are still on delete modal and we have an error message', async() => {
        // arrange
        render (
            <App />
        );

        const email_input = screen.getByRole('textbox', { name: /Email/i });
        const password_input = screen.getByRole('password-input');
        const show_hide_button = screen.getByRole('button', { name: /password_visibility/i });
        const sign_in_button = screen.getByRole('button', { name: /signin_button/i });

        // Step 1 => enter valid login info and attempt to login
        await userEvent.type(email_input, "test@gmail.com");
        await userEvent.type(password_input, "PasswordLong-101!");
        await userEvent.click(show_hide_button);
        await userEvent.click(sign_in_button);

        // Step 2 => verify we landed on home page
        const introDiv = screen.getByRole('generic', { name: /intro-entry-count/i });
        const entriesDiv = screen.getByRole('generic', { name: /entries-entry-count/i });

        // assert
        expect(introDiv).toHaveTextContent('Jim, your current entry count is...');
        expect(entriesDiv).toHaveTextContent('2');

        // Step 3 => get connection to profile icon and simulate click event
        const dropdownToggle = screen.getByRole('dropdown-toggle');
        await userEvent.click(dropdownToggle);
        await userEvent.click(screen.getByRole('menuitem', { name: /Delete Account/i }));

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /Close/i })).toBeInTheDocument();
            expect(screen.getByRole('paragraph', { name: /deletion-header/i })).toBeInTheDocument();
            expect(screen.getByRole('textbox', { name: /Email Address/i })).toBeInTheDocument();
            expect(screen.getByRole('password-input')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /show-hide-pw-button/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /cancel-account-deletion/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /confirm-account-deletion/i })).toBeInTheDocument();
        });

        // Step 4 => enter valid email and password and click delete/verify results
        const email_input_box = screen.getByRole('textbox', { name: /Email Address/i });
        const password_input_box = screen.getByRole('password-input');
        const show_hide_pw_button = screen.getByRole('button', { name: /show-hide-pw-button/i });
        const confirm_button = screen.getByRole('button', { name: /confirm-account-deletion/i });

        // act
        await userEvent.click(show_hide_pw_button);
        await userEvent.type(email_input_box, 'wrongtest@gmail.com');
        await userEvent.type(password_input_box, 'WrongPasswordLong-101!');
        await userEvent.click(confirm_button);
        expect(screen.getByRole('paragraph', { name: /error-message/i })).toHaveTextContent('Invalid Email or Password. Please Try Again.');
    });
});