import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import Rank from '../../components/Rank/Rank';
import { LAMBDA_API_URL } from '../../config';


const server = setupServer(
    http.get(`${LAMBDA_API_URL}`, async ({ request }) => {
        const url = new URL(request.url);
        const rank = url.searchParams.get('rank');

        if(!rank || Number(rank) < 0) {
            return new HttpResponse(null, { status: 404 });
        }

        else {
            return HttpResponse.json({ input: 'your rank emoji' });
        }
    })
);

const mockName = 'Jimbo';
const mockEntries = 2;

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());


describe('<Rank />', () => {
    test('Rendering a valid user name with valid entries', async() => {
        // arrange and act
        render(
            <Rank name={mockName} entries={mockEntries} />
        );

        const introDiv = screen.getByRole('generic', { name: /intro-entry-count/i });
        const entriesDiv = screen.getByRole('generic', { name: /entries-entry-count/i });

        // assert
        expect(introDiv).toHaveTextContent('Jimbo, your current entry count is...');
        expect(entriesDiv).toHaveTextContent('2');

        await waitFor(() => {
            // wait for rank badge div to update with its new rank!
            expect(screen.getByRole('generic', { name: /rank-entry-count/i })).toHaveTextContent('Rank Badge: your rank emoji');
        });
    });

    test('Rendering an invalid user with invalid entries', async() => {
        // arrange and act
        render(
            <Rank name={mockName} entries={-1} />
        );

        const introDiv = screen.getByRole('generic', { name: /intro-entry-count/i });
        const entriesDiv = screen.getByRole('generic', { name: /entries-entry-count/i });

        // assert
        expect(introDiv).toHaveTextContent('Jimbo, your current entry count is...');
        expect(entriesDiv).toHaveTextContent('-1');

        await waitFor(() => {
            // wait for rank badge div to update with its new rank!
            expect(screen.getByRole('generic', { name: /rank-entry-count/i })).toHaveTextContent('Rank Badge: error getting rank');
        });
    });

    test('Rendering an invalid user with invalid name', async() => {
        // arrange
        render(
            <Rank name={null} entries={mockEntries} />
        );

        const introDiv = screen.getByRole('generic', { name: /intro-entry-count/i });
        const entriesDiv = screen.getByRole('generic', { name: /entries-entry-count/i });

        // assert
        expect(introDiv).toHaveTextContent(', your current entry count is...');
        expect(entriesDiv).toHaveTextContent('2');

        await waitFor(() => {
            // wait for rank badge div to update with its new rank!
            expect(screen.getByRole('generic', { name: /rank-entry-count/i })).toHaveTextContent('Rank Badge: your rank emoji');
        });
    });
});