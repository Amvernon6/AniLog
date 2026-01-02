import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Search from '../Search';

// Mock fetch
global.fetch = jest.fn();

describe('Search Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  describe('Initial Render', () => {
    test('renders search input with placeholder', () => {
      render(<Search />);
      const input = screen.getByTestId('search-input');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('placeholder', 'Search for anime or manga...');
    });

    test('renders all filter buttons', () => {
      render(<Search />);
      expect(screen.getByTestId('type-filter-button')).toBeInTheDocument();
      expect(screen.getByTestId('format-filter-button')).toBeInTheDocument();
      expect(screen.getByTestId('genre-filter-button')).toBeInTheDocument();
      expect(screen.getByTestId('status-filter-button')).toBeInTheDocument();
      expect(screen.getByTestId('sort-filter-button')).toBeInTheDocument();
    });

    test('renders search button', () => {
      render(<Search />);
      const searchButton = screen.getByTestId('search-button');
      expect(searchButton).toBeInTheDocument();
      expect(searchButton).not.toBeDisabled();
    });
  });

  describe('Input Handling', () => {
    test('updates query state when typing in search input', async () => {
      const user = userEvent.setup();
      render(<Search />);
      const input = screen.getByTestId('search-input');
      
      await user.type(input, 'Attack on Titan');
      expect(input).toHaveValue('Attack on Titan');
    });

    test('triggers search on Enter key', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });
      
      const user = userEvent.setup();
      render(<Search />);
      const input = screen.getByTestId('search-input');
      
      await user.type(input, 'Demon Slayer{Enter}');
      await waitFor(() => {
        expect(fetch).toHaveBeenCalled();
      });
    });

    test('prevents search with empty filters', async () => {
      const user = userEvent.setup();
      render(<Search />);
      const searchButton = screen.getByTestId('search-button');
      
      await user.click(searchButton);
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe('Type Filter', () => {
    test('opens and closes type dropdown', async () => {
      const user = userEvent.setup();
      render(<Search />);
      const typeButton = screen.getByTestId('type-filter-button');
      
      await user.click(typeButton);
      expect(screen.getByText('Anime')).toBeInTheDocument();
      expect(screen.getByText('Manga')).toBeInTheDocument();
      
      await user.click(typeButton);
      await waitFor(() => {
        expect(screen.queryByText('Anime')).not.toBeInTheDocument();
      });
    });

    test('selects type option', async () => {
      const user = userEvent.setup();
      render(<Search />);
      const typeButton = screen.getByTestId('type-filter-button');
      
      await user.click(typeButton);
      const animeOption = screen.getByText('Anime');
      await user.click(animeOption);
      
      await waitFor(() => {
        expect(typeButton).toHaveTextContent('Anime');
      });
    });
  });

  describe('Format Filter', () => {
    test('opens and closes format dropdown', async () => {
      const user = userEvent.setup();
      render(<Search />);
      const formatButton = screen.getByTestId('format-filter-button');
      
      await user.click(formatButton);
      expect(screen.getByText('TV')).toBeInTheDocument();
      expect(screen.getByText('MOVIE')).toBeInTheDocument();
      
      await user.click(formatButton);
      await waitFor(() => {
        expect(screen.queryByText('TV')).not.toBeInTheDocument();
      });
    });

    test('toggles format selection', async () => {
      const user = userEvent.setup();
      render(<Search />);
      const formatButton = screen.getByTestId('format-filter-button');
      
      await user.click(formatButton);
      const tvOption = screen.getByText('TV');
      
      await user.click(tvOption);
      await waitFor(() => {
        expect(formatButton).toHaveTextContent('1 selected');
      });

      // click outside to close
      await user.click(document.body);
      
      // Re-open dropdown and deselect TV
      await user.click(formatButton);
      const tvOptionAgain = screen.getByText('TV');
      await user.click(tvOptionAgain);
      await waitFor(() => {
        expect(formatButton).toHaveTextContent('Select formats');
      });
    });

    test('displays correct count of selected formats', async () => {
      const user = userEvent.setup();
      render(<Search />);
      const formatButton = screen.getByTestId('format-filter-button');
      
      await user.click(formatButton);
      const tvOption = screen.getByText('TV');
      const movieOption = screen.getByText('MOVIE');
      
      await user.click(tvOption);
      await user.click(movieOption);
      
      await waitFor(() => {
        expect(formatButton).toHaveTextContent('2 selected');
      });
    });
  });

  describe('Genre Filter', () => {
    test('opens and closes genre dropdown', async () => {
      const user = userEvent.setup();
      render(<Search />);
      const genreButton = screen.getByTestId('genre-filter-button');
      
      await user.click(genreButton);
      expect(screen.getByText('Action')).toBeInTheDocument();
      
      await user.click(genreButton);
      await waitFor(() => {
        expect(screen.queryByText('Action')).not.toBeInTheDocument();
      });
    });

    test('toggles genre selection', async () => {
      const user = userEvent.setup();
      render(<Search />);
      const genreButton = screen.getByTestId('genre-filter-button');
      
      await user.click(genreButton);
      const actionOption = screen.getByText('Action');
      
      await user.click(actionOption);
      await waitFor(() => {
        expect(genreButton).toHaveTextContent('1 selected');
      });
    });
  });

  describe('Status Filter', () => {
    test('opens and closes status dropdown', async () => {
      const user = userEvent.setup();
      render(<Search />);
      const statusButton = screen.getByTestId('status-filter-button');
      
      await user.click(statusButton);
      expect(screen.getByText('RELEASING')).toBeInTheDocument();
      
      await user.click(statusButton);
      await waitFor(() => {
        expect(screen.queryByText('RELEASING')).not.toBeInTheDocument();
      });
    });

    test('toggles status selection', async () => {
      const user = userEvent.setup();
      render(<Search />);
      const statusButton = screen.getByTestId('status-filter-button');
      
      await user.click(statusButton);
      const releasingOption = screen.getByText('RELEASING');
      
      await user.click(releasingOption);
      await waitFor(() => {
        expect(statusButton).toHaveTextContent('1 selected');
      });
    });
  });

  describe('Sort Filter', () => {
    test('opens and closes sort dropdown', async () => {
      const user = userEvent.setup();
      render(<Search />);
      const sortButton = screen.getByTestId('sort-filter-button');
      
      await user.click(sortButton);
      expect(screen.getByText('Rating Descending')).toBeInTheDocument();
      
      await user.click(sortButton);
      await waitFor(() => {
        expect(screen.queryByText('Rating Descending')).not.toBeInTheDocument();
      });
    });

    test('changes sort option', async () => {
      const user = userEvent.setup();
      render(<Search />);
      const sortButton = screen.getByTestId('sort-filter-button');
      
      await user.click(sortButton);
      const ratingOption = screen.getByText('Rating Descending');
      await user.click(ratingOption);
      
      await waitFor(() => {
        expect(sortButton).toHaveTextContent('Rating Descending');
      });
    });
  });

  describe('Search Functionality', () => {
    test('calls fetch when search button is clicked with query', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

      const user = userEvent.setup();
      render(<Search />);
      const input = screen.getByTestId('search-input');
      const searchButton = screen.getByTestId('search-button');
      
      await user.type(input, 'Demon Slayer');
      await user.click(searchButton);
      
      await waitFor(() => {
        expect(fetch).toHaveBeenCalled();
      });
    });

    test('shows loading state during search', async () => {
      fetch.mockImplementationOnce(() => new Promise(() => {})); // Never resolves
      
      const user = userEvent.setup();
      render(<Search />);
      const input = screen.getByTestId('search-input');
      const searchButton = screen.getByTestId('search-button');
      
      await user.type(input, 'Test');
      await user.click(searchButton);
      
      await waitFor(() => {
        expect(searchButton).toHaveTextContent('Searching...');
        expect(searchButton).toBeDisabled();
      });
    });

    test('displays search results', async () => {
      const mockResults = [
        {
          id: 1,
          type: 'ANIME',
          format: 'TV',
          title: { english: 'Attack on Titan', romaji: 'Shingeki no Kyojin' },
          year: 2013,
          averageScore: 860,
          coverImageUrl: 'https://example.com/aot.jpg',
          status: 'FINISHED'
        }
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResults
      });

      const user = userEvent.setup();
      render(<Search />);
      const input = screen.getByTestId('search-input');
      const searchButton = screen.getByTestId('search-button');
      
      await user.type(input, 'Attack');
      await user.click(searchButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('search-results-list')).toBeInTheDocument();
        expect(screen.getByText('Attack on Titan')).toBeInTheDocument();
      });
    });

    test('displays no results message when search returns empty', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

      const user = userEvent.setup();
      render(<Search />);
      const input = screen.getByTestId('search-input');
      const searchButton = screen.getByTestId('search-button');
      
      await user.type(input, 'NonexistentAnime123');
      await user.click(searchButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('no-results-message')).toBeInTheDocument();
      });
    });

    test('handles fetch errors gracefully', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));
      
      const user = userEvent.setup();
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      render(<Search />);
      const input = screen.getByTestId('search-input');
      const searchButton = screen.getByTestId('search-button');
      
      await user.type(input, 'Test');
      await user.click(searchButton);
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled();
      });
      
      consoleSpy.mockRestore();
    });
  });

  describe('Detail View', () => {
    test('displays detail view when result is clicked', async () => {
      const mockResults = [
        {
          id: 1,
          type: 'ANIME',
          format: 'TV',
          title: { english: 'Demon Slayer', romaji: 'Kimetsu no Yaiba' },
          year: 2019,
          averageScore: 850,
          coverImageUrl: 'https://example.com/ds.jpg',
          status: 'FINISHED',
          episodes: 26,
          description: 'An anime about demons and slayers'
        }
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResults
      });

      const user = userEvent.setup();
      render(<Search />);
      const input = screen.getByTestId('search-input');
      const searchButton = screen.getByTestId('search-button');
      
      await user.type(input, 'Demon');
      await user.click(searchButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('result-item-0')).toBeInTheDocument();
      });
      
      const resultItem = screen.getByTestId('result-item-0');
      await user.click(resultItem);
      
      await waitFor(() => {
        expect(screen.getByTestId('detail-view')).toBeInTheDocument();
        expect(screen.getByText('An anime about demons and slayers')).toBeInTheDocument();
      });
    });

    test('back button returns to results list', async () => {
      const mockResults = [
        {
          id: 1,
          type: 'ANIME',
          format: 'TV',
          title: { english: 'Test Anime', romaji: 'Test' },
          year: 2020,
          averageScore: 800,
          coverImageUrl: 'https://example.com/test.jpg',
          status: 'FINISHED'
        }
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResults
      });

      const user = userEvent.setup();
      render(<Search />);
      const input = screen.getByTestId('search-input');
      const searchButton = screen.getByTestId('search-button');
      
      await user.type(input, 'Test');
      await user.click(searchButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('result-item-0')).toBeInTheDocument();
      });
      
      const resultItem = screen.getByTestId('result-item-0');
      await user.click(resultItem);
      
      await waitFor(() => {
        expect(screen.getByTestId('back-button')).toBeInTheDocument();
      });
      
      const backButton = screen.getByTestId('back-button');
      await user.click(backButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('search-results-list')).toBeInTheDocument();
      });
    });

    test('displays all detail fields when available', async () => {
      const mockResults = [
        {
          id: 1,
          type: 'ANIME',
          format: 'TV',
          title: { english: 'Full Detail Anime', romaji: 'Full' },
          year: 2021,
          averageScore: 875,
          coverImageUrl: 'https://example.com/full.jpg',
          status: 'FINISHED',
          episodes: 12,
          description: 'A detailed description',
          genres: ['Action', 'Adventure'],
          studios: ['Studio A', 'Studio B'],
          synonyms: ['Alternate Name'],
          isAdult: false,
          nextAiringEpisode: null,
          streamingEpisodes: [],
          trailer: { site: 'youtube' }
        }
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResults
      });

      const user = userEvent.setup();
      render(<Search />);
      const input = screen.getByTestId('search-input');
      
      await user.type(input, 'Full');
      await user.click(screen.getByTestId('search-button'));
      
      await waitFor(() => {
        expect(screen.getByTestId('result-item-0')).toBeInTheDocument();
      });
      
      const resultItem = screen.getByTestId('result-item-0');
      await user.click(resultItem);
      
      await waitFor(() => {
        expect(screen.getByTestId('detail-view')).toBeInTheDocument();
        expect(screen.getByText('A detailed description')).toBeInTheDocument();
        expect(screen.getByText(/Action, Adventure/)).toBeInTheDocument();
        expect(screen.getByText(/Studio A, Studio B/)).toBeInTheDocument();
      });
    });
  });

  describe('Click Outside Behavior', () => {
    test('closes dropdown when clicking outside', async () => {
      const user = userEvent.setup();
      render(<Search />);
      const formatButton = screen.getByTestId('format-filter-button');
      
      await user.click(formatButton);
      expect(screen.getByText('TV')).toBeInTheDocument();
      
      // Click outside
      await user.click(document.body);
      
      await waitFor(() => {
        expect(screen.queryByText('TV')).not.toBeInTheDocument();
      });
    });
  });

  describe('Result Item Display', () => {
    test('displays result with all available information', async () => {
      const mockResults = [
        {
          id: 1,
          type: 'ANIME',
          format: 'TV',
          title: { english: 'Display Test', romaji: 'Display' },
          year: 2022,
          averageScore: 800,
          coverImageUrl: 'https://example.com/display.jpg',
          status: 'RELEASING'
        }
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResults
      });

      const user = userEvent.setup();
      render(<Search />);
      const input = screen.getByTestId('search-input');
      
      await user.type(input, 'Display');
      await user.click(screen.getByTestId('search-button'));
      
      await waitFor(() => {
        expect(screen.getByTestId('result-item-0')).toBeInTheDocument();
        expect(screen.getByText(/ANIME.*•.*TV/)).toBeInTheDocument();
        expect(screen.getByText('Display Test')).toBeInTheDocument();
        expect(screen.getByText('Year: 2022')).toBeInTheDocument();
        expect(screen.getByText(/Score:.*80\.0.*\/10/)).toBeInTheDocument();
        expect(screen.getByText('RELEASING')).toBeInTheDocument();
      });
    });
  });
});
