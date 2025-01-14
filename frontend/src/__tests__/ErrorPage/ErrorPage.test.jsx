import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ErrorPage from '../../components/ErrorPage/ErrorPage';

describe('<ErrorPage />', () => {
    test('renders error page', () => {
        // arrange
        render (
            <MemoryRouter>
                <ErrorPage />
            </MemoryRouter>
        );

        // assert
        expect(screen.getByRole('heading')).toHaveTextContent('Sorry, Something Unexpected Happened...');
    });
});