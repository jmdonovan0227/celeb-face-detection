import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import CompLoadingSpinner from '../../components/CompLoadingSpinner/CompLoadingSpinner';

describe('<CompLoadingSpinner />', () => {
    test('renders component loading spinner', () => {
        // arrange
        render (
            <CompLoadingSpinner />
        );

        // assert
        expect(screen.getByRole('generic', { name: /comp-loading-container/i } )).toBeInTheDocument();
        expect(screen.getByRole('generic', { name: /comp-loading-spinner/i })).toBeInTheDocument();
    });
});