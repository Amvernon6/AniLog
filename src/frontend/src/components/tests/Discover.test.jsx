import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Discover from '../Discover';

// Mock fetch globally
global.fetch = jest.fn();

const mockItems = [
  {
    id: 1,
    type: 'ANIME',
    title: { english: 'Anime One', romaji: 'Anime One' },
    coverImageUrl: 'https://example.com/a1.jpg',
    averageScore: 82,
    status: 'RELEASING'
  },
  {
    id: 2,
    type: 'MANGA',
    title: { english: 'Manga Two', romaji: 'Manga Two' },
    coverImageUrl: 'https://example.com/m2.jpg',
    averageScore: 77,
    status: 'FINISHED'
  }
];

const primeFetch = () => {
  fetch.mockImplementation(() => Promise.resolve({ ok: true, json: async () => mockItems }));
};

describe('Discover Component', () => {
  beforeEach(() => {
    fetch.mockClear();
    localStorage.clear();
    primeFetch();
  });

  test('renders tabs and loads sections', async () => {
    render(<Discover />);

    // Tabs visible
    expect(screen.getByText('Anime')).toBeInTheDocument();
    expect(screen.getByText('Manga')).toBeInTheDocument();

    // Sections appear after fetch completes
    await waitFor(() => {
      expect(screen.getByText('Trending Anime')).toBeInTheDocument();
      expect(screen.getByText('Popular Anime')).toBeInTheDocument();
      expect(screen.getByText('New Anime')).toBeInTheDocument();
      expect(screen.getByText('Coming Soon Anime')).toBeInTheDocument();
    });
  });

  test('clicking a card opens detail view and back returns to list', async () => {
    const user = userEvent.setup();
    render(<Discover />);

    await waitFor(() => {
      expect(screen.getByText('Trending Anime')).toBeInTheDocument();
    });

    // Open detail
    const firstCard = screen.getAllByTestId('discover-card')[0];
    await user.click(firstCard);

    await waitFor(() => {
      expect(screen.getByTestId('detail-view')).toBeInTheDocument();
    });

    // Verify detail view is open
    expect(screen.getByTestId('back-button')).toBeInTheDocument();

    // Back to list
    const backButton = screen.getByTestId('back-button');
    await user.click(backButton);

    await waitFor(() => {
      expect(screen.queryByTestId('detail-view')).not.toBeInTheDocument();
      expect(screen.getByText('Trending Anime')).toBeInTheDocument();
    });
  });
});
