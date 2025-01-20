import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import DeleteModal from '../../components/Modal/DeleteModal';
import Delete from '../../components/Profile/Delete';
import { APP_URL } from '../../config';

const exists = (users, loginInfo) => {
    let exists = false;

    users.forEach((user) => {
        if(user.email === loginInfo.email && user.password === loginInfo.password) {
            exists = true;
        }
    });

    return exists;
};

const server = setupServer(
    http.delete(`${APP_URL}/api/delete`, async ({ request }) => {
        const userInfo = await request.json();
        const { email, password } = userInfo;

        if(email && password && exists([{ id: 1, email: 'test@gmail.com', password: 'password' }], { email, password })) {
            return HttpResponse.json({ success: true });
        }

        else {
            return new HttpResponse(null, { status: 401 })
        }
    })
);

const mockIsDeleteModalOpen = true;
const mockToggleDeleteModal = jest.fn();
const mockOnRouteChange = jest.fn();


beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('<DeleteModal /> and <Delete />', () => {
    test('render <Delete /> through <DeleteModal /> portal', () => {
        // arrange
        render (
            <MemoryRouter>
                <DeleteModal>
                    <Delete 
                        isDeleteModalOpen={mockIsDeleteModalOpen}
                        toggleDeleteModal={mockToggleDeleteModal}
                        onRouteChange={mockOnRouteChange}
                    />
                </DeleteModal>
            </MemoryRouter>
        );

        const close_button = screen.getByRole('generic', { name: /Close/i });
        const deletion_header = screen.getByRole('paragraph', { name: /thank-you-header/i });
        const email_input_box = screen.getByRole('textbox', { name: /delete-email/i });
        const password_input_box = screen.getByRole('del-password-input');
        const show_hide_pw_button = screen.getByRole('button', { name: /show-hide-pw-button/i });
        const cancel_button = screen.getByRole('button', { name: /cancel-account-deletion/i });
        const confirm_button = screen.getByRole('button', { name: /confirm-account-deletion/i });

        // assert
        expect(close_button).toBeInTheDocument();
        expect(deletion_header).toBeInTheDocument();
        expect(email_input_box).toBeInTheDocument();
        expect(password_input_box).toBeInTheDocument();
        expect(show_hide_pw_button).toBeInTheDocument();
        expect(cancel_button).toBeInTheDocument();
        expect(confirm_button).toBeInTheDocument();
    });

    test('valid account deletion', async() => {
        // arrange
        render (
            <MemoryRouter>
                <DeleteModal>
                    <Delete 
                        isDeleteModalOpen={mockIsDeleteModalOpen}
                        toggleDeleteModal={mockToggleDeleteModal}
                        onRouteChange={mockOnRouteChange}
                    />
                </DeleteModal>
            </MemoryRouter>
        );


        const email_input_box = screen.getByRole('textbox', { name: /delete-email/i });
        const password_input_box = screen.getByRole('del-password-input');
        const show_hide_pw_button = screen.getByRole('button', { name: /show-hide-pw-button/i });
        const confirm_button = screen.getByRole('button', { name: /confirm-account-deletion/i });

        // act
        await userEvent.click(show_hide_pw_button);
        await userEvent.type(email_input_box, 'test@gmail.com');
        await userEvent.type(password_input_box, 'password');
        await userEvent.click(confirm_button);

        // assert
        expect(password_input_box).toHaveAttribute('type', 'text');
        expect(password_input_box).toHaveValue('password');
        expect(email_input_box).toHaveValue('test@gmail.com');
        expect(mockToggleDeleteModal).toHaveBeenCalledTimes(1);
        expect(mockOnRouteChange).toHaveBeenCalledTimes(1);
        expect(mockOnRouteChange).toHaveBeenCalledWith('signout');
    });

    test('invalid account deletion', async() => {
        // arrange
        render (
            <MemoryRouter>
                <DeleteModal>
                    <Delete 
                        isDeleteModalOpen={mockIsDeleteModalOpen}
                        toggleDeleteModal={mockToggleDeleteModal}
                        onRouteChange={mockOnRouteChange}
                    />
                </DeleteModal>
            </MemoryRouter>
        );


        const email_input_box = screen.getByRole('textbox', { name: /delete-email/i });
        const password_input_box = screen.getByRole('del-password-input');
        const show_hide_pw_button = screen.getByRole('button', { name: /show-hide-pw-button/i });
        const confirm_button = screen.getByRole('button', { name: /confirm-account-deletion/i });

        // act
        await userEvent.click(show_hide_pw_button);
        await userEvent.type(email_input_box, 'test2@gmail.com');
        await userEvent.type(password_input_box, 'wrongpassword');
        await userEvent.click(confirm_button);

        // assert
        expect(password_input_box).toHaveAttribute('type', 'text');
        expect(password_input_box).toHaveValue('wrongpassword');
        expect(email_input_box).toHaveValue('test2@gmail.com');
        expect(mockToggleDeleteModal).toHaveBeenCalledTimes(1);
        expect(mockOnRouteChange).toHaveBeenCalledTimes(1);
        expect(await screen.findByRole('paragraph', { name: /error-message/i })).toHaveTextContent('Could not process account deletion. Invalid email or password.')
    });

    test('closing modal with x button or cancel button', async() => {
        // arrange
        render (
            <MemoryRouter>
                <DeleteModal>
                    <Delete 
                        isDeleteModalOpen={mockIsDeleteModalOpen}
                        toggleDeleteModal={mockToggleDeleteModal}
                        onRouteChange={mockOnRouteChange}
                    />
                </DeleteModal>
            </MemoryRouter>
        );

        const close_button = screen.getByRole('generic', { name: /Close/i });
        const cancel_button = screen.getByRole('button', { name: /cancel-account-deletion/i });

        // act
        await userEvent.click(close_button);
        await userEvent.click(cancel_button);

        // assert
        expect(mockToggleDeleteModal).toHaveBeenCalledTimes(3);
        expect(mockOnRouteChange).toHaveBeenCalledTimes(1);
    });
});