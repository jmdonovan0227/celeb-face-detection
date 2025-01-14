import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ProfileModal from '../../components/Modal/ProfileModal';
import Profile from '../../components/Profile/Profile';
import { APP_URL } from '../../config';

const server = setupServer(
    http.post(`${APP_URL}/api/upload/picture`, async ({ request }) => {
        await request.formData();
        return HttpResponse.json({success: 'true'});
    }),

    http.put(`${APP_URL}/api/profile`, async({ request }) => {
        const body = await request.json();
        const { name, age } = body;

        if(name && age) {
            return new HttpResponse(null, { status: 200 });
        }

        else if(name || age) {
            return new HttpResponse(null, { status: 200 });
        }

        else {
            return new HttpResponse(null, { status: 400 });
        }
    }),

    http.get(`${APP_URL}/api/upload/signedurl`, (info) => {
        return HttpResponse.json({ imageUrl: 'url' });
    }),

    http.delete(`${APP_URL}/api/upload/deletepic`, async({ request }) => {
        return HttpResponse.json('success');
    })
);


beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const mockIsProfileOpen = true;
const mockToggleModal = jest.fn();
const mockUser = { id: 1, name: 'Jimbo', age: 0, entries: 2, profile_picture: 'some url', joined: '2024-12-25T03:24:00' };
const mockLoadUser = jest.fn();
const mockProfilePicture = 'some url';
const mockSetProfilePicture = jest.fn();

describe('<ProfileModal /> and <Profile />', () => {
    test('ProfileModal renders Profile component', async() => {
        // arrange
        render(
            <MemoryRouter>
                <ProfileModal>
                    <Profile 
                        isProfileOpen={mockIsProfileOpen}
                        toggleModal={mockToggleModal}
                        user={mockUser}
                        loadUser={mockLoadUser}
                        profile_picture={mockProfilePicture}
                        setProfilePicture={mockSetProfilePicture}
                    />
                </ProfileModal>
            </MemoryRouter>
        );

        const profile_picture = screen.getByRole('img');
        const x_button = screen.getByRole('generic', { name: /close-button/i });
        const name_header = screen.getByRole('heading', { name: /name/i });
        const joined_date_paragraph = screen.getByRole('paragraph', { name: /joined-date/i });
        const upload_profile_picture = screen.getByRole('upload-profile-picture');
        const name_box = screen.getByRole('textbox', { name: /Name/i });
        const age_box = screen.getByRole('spinbutton');
        const save_button = screen.getByRole('button', { name: /Save/i });
        const cancel_button = screen.getByRole('button', { name: /Cancel/i });

        // assert
        expect(profile_picture).toHaveAttribute('src', 'some url');
        expect(x_button).toBeInTheDocument();
        expect(name_header).toHaveTextContent('Jimbo');
        expect(joined_date_paragraph).toHaveTextContent('Member Since: 12/25/2024');
        expect(upload_profile_picture).toBeInTheDocument();
        expect(name_box).toHaveAttribute('placeholder', 'Jimbo');
        expect(age_box).toHaveAttribute('placeholder', '0');
        expect(save_button).toBeInTheDocument();
        expect(cancel_button).toBeInTheDocument();
    });

    test('Upload picture button attempts to update local (on profile page) image', async() => {
        // arrange
        render(
            <MemoryRouter>
                <ProfileModal>
                    <Profile 
                        isProfileOpen={mockIsProfileOpen}
                        toggleModal={mockToggleModal}
                        user={mockUser}
                        loadUser={mockLoadUser}
                        profile_picture={mockProfilePicture}
                        setProfilePicture={mockSetProfilePicture}
                    />
                </ProfileModal>
            </MemoryRouter>
        );

        const profile_picture = screen.getByRole('img');
        const upload_profile_picture = screen.getByRole('upload-profile-picture');
        const file = new File(['^_^'], 'happy.png', { type: 'image/png' });

        // act
        await userEvent.upload(upload_profile_picture, file);

        // assert
        await waitFor(() => {
            expect(upload_profile_picture.files[0]).toEqual(file);
            expect(upload_profile_picture.files[0].name).toBe('happy.png');
            expect(profile_picture).not.toHaveAttribute('src', 'some url');
        });
    });

    test('Changing profile picture and name and age call props to update user profile', async() => {
        // arrange
        render(
            <MemoryRouter>
                <ProfileModal>
                    <Profile 
                        isProfileOpen={mockIsProfileOpen}
                        toggleModal={mockToggleModal}
                        user={mockUser}
                        loadUser={mockLoadUser}
                        profile_picture={mockProfilePicture}
                        setProfilePicture={mockSetProfilePicture}
                    />
                </ProfileModal>
            </MemoryRouter>
        );

        const profile_picture = screen.getByRole('img');
        const upload_profile_picture = screen.getByRole('upload-profile-picture');
        const file = new File(['^_^'], 'happy.png', { type: 'image/png' });
        const name_box = screen.getByRole('textbox', { name: /Name/i });
        const age_box = screen.getByRole('spinbutton');
        const save_button = screen.getByRole('button', { name: /Save/i });

        // act
        await userEvent.upload(upload_profile_picture, file);
        await userEvent.type(name_box, 'Jack');
        await userEvent.type(age_box, '99');
        await userEvent.click(save_button);

        // assert
        await waitFor(() => {
            expect(upload_profile_picture.files[0]).toEqual(file);
            expect(upload_profile_picture.files[0].name).toBe('happy.png');
            expect(profile_picture).not.toHaveAttribute('src', 'some url');
        });

        expect(name_box).toHaveValue('Jack');
        expect(age_box).toHaveValue(99);
        expect(mockToggleModal).toHaveBeenCalledTimes(0);
        expect(mockLoadUser).toHaveBeenCalledTimes(1);
    });

    test('Clicking X button or Cancel closes modal', async() => {
        // arrange
        render(
            <MemoryRouter>
                <ProfileModal>
                    <Profile 
                        isProfileOpen={mockIsProfileOpen}
                        toggleModal={mockToggleModal}
                        user={mockUser}
                        loadUser={mockLoadUser}
                        profile_picture={mockProfilePicture}
                        setProfilePicture={mockSetProfilePicture}
                    />
                </ProfileModal>
            </MemoryRouter>
        );

        const x_button = screen.getByRole('generic', { name: /close-button/i });
        const cancel_button = screen.getByRole('button', { name: /Cancel/i });

        // act
        await userEvent.click(x_button);
        await userEvent.click(cancel_button);

        // assert
        expect(mockToggleModal).toHaveBeenCalledTimes(2);
    });
});