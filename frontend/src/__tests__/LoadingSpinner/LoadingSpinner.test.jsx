import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';

describe('<LoadingSpinner />', () => {
    test('renders loading spinner', () => {
        // arrange
        render (
            <LoadingSpinner />
        );

        // assert
        expect(screen.getByRole('generic', { name: /loading-container/i } )).toBeInTheDocument();
        expect(screen.getByRole('generic', { name: /loading-spinner/i })).toBeInTheDocument();
    });
});