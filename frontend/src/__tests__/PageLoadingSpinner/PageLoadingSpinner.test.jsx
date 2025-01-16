import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import PageLoadingSpinner from '../../components/PageLoadingSpinner/PageLoadingSpinner';

describe('<PageLoadingSpinner />', () => {
    test('renders page loading spinner', () => {
        // arrange
        render (
            <PageLoadingSpinner />
        );

        // assert
        expect(screen.getByRole('generic', { name: /page-loading-container/i } )).toBeInTheDocument();
        expect(screen.getByRole('generic', { name: /page-loading-spinner/i })).toBeInTheDocument();
    });
});