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

  describe('Title Display Variations', () => {
    test('displays English title when available', async () => {
      const mockResults = [
        {
          id: 1,
          type: 'ANIME',
          format: 'TV',
          title: { english: 'Attack on Titan', romaji: 'Shingeki no Kyojin', nativeTitle: '進撃の巨人' },
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
      
      await user.type(input, 'Attack');
      await user.click(screen.getByTestId('search-button'));
      
      await waitFor(() => {
        expect(screen.getByText('Attack on Titan')).toBeInTheDocument();
      });
    });

    test('displays Romaji title when English is not available', async () => {
      const mockResults = [
        {
          id: 1,
          type: 'ANIME',
          format: 'TV',
          title: { english: null, romaji: 'Kimetsu no Yaiba', nativeTitle: '鬼滅の刃' },
          year: 2019,
          averageScore: 850,
          coverImageUrl: 'https://example.com/ds.jpg',
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
      
      await user.type(input, 'Kimetsu');
      await user.click(screen.getByTestId('search-button'));
      
      await waitFor(() => {
        expect(screen.getByText('Kimetsu no Yaiba')).toBeInTheDocument();
      });
    });

    test('displays Native title when both English and Romaji are not available', async () => {
      const mockResults = [
        {
          id: 1,
          type: 'ANIME',
          format: 'TV',
          title: { english: null, romaji: null, nativeTitle: '東京喰種' },
          year: 2014,
          averageScore: 800,
          coverImageUrl: 'https://example.com/tg.jpg',
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
      
      await user.type(input, '東京喰種');
      await user.click(screen.getByTestId('search-button'));
      
      await waitFor(() => {
        expect(screen.getByText('東京喰種')).toBeInTheDocument();
      });
    });

    test('displays fallback when all title fields are null', async () => {
      const mockResults = [
        {
          id: 1,
          type: 'ANIME',
          format: 'TV',
          title: { english: null, romaji: null, nativeTitle: null },
          year: 2020,
          averageScore: 750,
          coverImageUrl: 'https://example.com/unknown.jpg',
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
      
      await user.type(input, 'Error Getting Title');
      await user.click(screen.getByTestId('search-button'));
      
      await waitFor(() => {
        expect(screen.getByTestId('result-item-0')).toBeInTheDocument();
      });
    });

    test('displays multiple results with different title combinations', async () => {
      const mockResults = [
        {
          id: 1,
          type: 'ANIME',
          format: 'TV',
          title: { english: 'Test: One Piece', romaji: 'One Piece', nativeTitle: 'ワンピース' },
          year: 1999,
          averageScore: 870,
          coverImageUrl: 'https://example.com/op.jpg',
          status: 'RELEASING'
        },
        {
          id: 2,
          type: 'MANGA',
          format: 'MANGA',
          title: { english: null, romaji: 'Test: Berserk', nativeTitle: 'ベルセルク' },
          year: 1989,
          averageScore: 920,
          coverImageUrl: 'https://example.com/berserk.jpg',
          status: 'RELEASING'
        },
        {
          id: 3,
          type: 'ANIME',
          format: 'MOVIE',
          title: { english: null, romaji: null, nativeTitle: 'Test: 千と千尋の神隠し' },
          year: 2001,
          averageScore: 880,
          coverImageUrl: 'https://example.com/spirited.jpg',
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
      
      await user.type(input, 'Test');
      await user.click(screen.getByTestId('search-button'));
      
      await waitFor(() => {
        expect(screen.getByText('Test: One Piece')).toBeInTheDocument();
        expect(screen.getByText('Test: Berserk')).toBeInTheDocument();
        expect(screen.getByText('Test: 千と千尋の神隠し')).toBeInTheDocument();
      });
    });
  });

  describe('Type and Format Display', () => {
    test('displays type and format without duplication when different', async () => {
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
      
      await user.type(input, 'Test');
      await user.click(screen.getByTestId('search-button'));
      
      await waitFor(() => {
        expect(screen.getByText(/ANIME.*•.*TV/)).toBeInTheDocument();
      });
    });

    test('displays only format when type matches format (MANGA)', async () => {
      const mockResults = [
        {
          id: 1,
          type: 'MANGA',
          format: 'MANGA',
          title: { english: 'Test Manga', romaji: 'Test' },
          year: 2020,
          averageScore: 800,
          coverImageUrl: 'https://example.com/test.jpg',
          status: 'FINISHED',
          chapters: 100
        }
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResults
      });

      const user = userEvent.setup();
      render(<Search />);
      const input = screen.getByTestId('search-input');
      
      await user.type(input, 'Manga');
      await user.click(screen.getByTestId('search-button'));
      
      await waitFor(() => {
        const resultItem = screen.getByTestId('result-item-0');
        expect(resultItem).toHaveTextContent('MANGA');
        // Should not have "MANGA • MANGA"
        expect(resultItem.textContent.match(/MANGA/g) || []).toHaveLength(1);
      });
    });

    test('displays only type when format is null', async () => {
      const mockResults = [
        {
          id: 1,
          type: 'ANIME',
          format: null,
          title: { english: 'Test', romaji: 'Test' },
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
      
      await user.type(input, 'Test');
      await user.click(screen.getByTestId('search-button'));
      
      await waitFor(() => {
        const resultItem = screen.getByTestId('result-item-0');
        expect(resultItem).toHaveTextContent('ANIME');
        expect(resultItem).not.toHaveTextContent('•');
      });
    });
  });

  describe('Status Color Coding', () => {
    test('applies correct class for RELEASING status', async () => {
      const mockResults = [
        {
          id: 1,
          type: 'ANIME',
          format: 'TV',
          title: { english: 'Releasing Anime', romaji: 'Test' },
          year: 2024,
          averageScore: 800,
          coverImageUrl: 'https://example.com/test.jpg',
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
      
      await user.type(input, 'Test');
      await user.click(screen.getByTestId('search-button'));
      
      await waitFor(() => {
        const statusElement = screen.getByText('RELEASING');
        expect(statusElement).toHaveClass('status-releasing');
      });
    });

    test('applies correct class for FINISHED status', async () => {
      const mockResults = [
        {
          id: 1,
          type: 'ANIME',
          format: 'TV',
          title: { english: 'Finished Anime', romaji: 'Test' },
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
      
      await user.type(input, 'Test');
      await user.click(screen.getByTestId('search-button'));
      
      await waitFor(() => {
        const statusElement = screen.getByText('FINISHED');
        expect(statusElement).toHaveClass('status-finished');
      });
    });

    test('applies correct class for NOT_YET_RELEASED status', async () => {
      const mockResults = [
        {
          id: 1,
          type: 'ANIME',
          format: 'TV',
          title: { english: 'Upcoming Anime', romaji: 'Test' },
          year: 2025,
          averageScore: null,
          coverImageUrl: 'https://example.com/test.jpg',
          status: 'NOT_YET_RELEASED'
        }
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResults
      });

      const user = userEvent.setup();
      render(<Search />);
      const input = screen.getByTestId('search-input');
      
      await user.type(input, 'Test');
      await user.click(screen.getByTestId('search-button'));
      
      await waitFor(() => {
        const statusElement = screen.getByText('NOT YET RELEASED');
        expect(statusElement).toHaveClass('status-not_yet_released');
      });
    });

    test('applies correct class for CANCELLED status', async () => {
      const mockResults = [
        {
          id: 1,
          type: 'ANIME',
          format: 'TV',
          title: { english: 'Cancelled Anime', romaji: 'Test' },
          year: 2020,
          averageScore: 700,
          coverImageUrl: 'https://example.com/test.jpg',
          status: 'CANCELLED'
        }
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResults
      });

      const user = userEvent.setup();
      render(<Search />);
      const input = screen.getByTestId('search-input');
      
      await user.type(input, 'Test');
      await user.click(screen.getByTestId('search-button'));
      
      await waitFor(() => {
        const statusElement = screen.getByText('CANCELLED');
        expect(statusElement).toHaveClass('status-cancelled');
      });
    });

    test('applies correct class for HIATUS status', async () => {
      const mockResults = [
        {
          id: 1,
          type: 'MANGA',
          format: 'MANGA',
          title: { english: 'Hiatus Manga', romaji: 'Test' },
          year: 2015,
          averageScore: 850,
          coverImageUrl: 'https://example.com/test.jpg',
          status: 'HIATUS'
        }
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResults
      });

      const user = userEvent.setup();
      render(<Search />);
      const input = screen.getByTestId('search-input');
      
      await user.type(input, 'Test');
      await user.click(screen.getByTestId('search-button'));
      
      await waitFor(() => {
        const statusElement = screen.getByText('HIATUS');
        expect(statusElement).toHaveClass('status-hiatus');
      });
    });
  });

  describe('Description and Detail Rendering', () => {
    test('renders HTML description correctly', async () => {
      const mockResults = [
        {
          id: 1,
          type: 'ANIME',
          format: 'TV',
          title: { english: 'HTML Test', romaji: 'Test' },
          year: 2020,
          averageScore: 800,
          coverImageUrl: 'https://example.com/test.jpg',
          status: 'FINISHED',
          description: '<p>This is a <strong>bold</strong> description with <em>italic</em> text.</p>'
        }
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResults
      });

      const user = userEvent.setup();
      render(<Search />);
      const input = screen.getByTestId('search-input');
      
      await user.type(input, 'HTML');
      await user.click(screen.getByTestId('search-button'));
      
      await waitFor(() => {
        expect(screen.getByTestId('result-item-0')).toBeInTheDocument();
      });
      
      const resultItem = screen.getByTestId('result-item-0');
      await user.click(resultItem);
      
      await waitFor(() => {
        const detailView = screen.getByTestId('detail-view');
        expect(detailView).toBeInTheDocument();
        // Check that HTML is rendered (not as plain text)
        const strongElement = detailView.querySelector('strong');
        const emElement = detailView.querySelector('em');
        expect(strongElement).toBeInTheDocument();
        expect(emElement).toBeInTheDocument();
      });
    });

    test('displays next airing episode information when available', async () => {
      const futureTimestamp = Math.floor(Date.now() / 1000) + 86400; // 24 hours from now
      const mockResults = [
        {
          id: 1,
          type: 'ANIME',
          format: 'TV',
          title: { english: 'Airing Anime', romaji: 'Test' },
          year: 2024,
          averageScore: 850,
          coverImageUrl: 'https://example.com/test.jpg',
          status: 'RELEASING',
          nextAiringEpisode: {
            episode: 12,
            timeUntilAiring: 86400
          }
        }
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResults
      });

      const user = userEvent.setup();
      render(<Search />);
      const input = screen.getByTestId('search-input');
      
      await user.type(input, 'Airing');
      await user.click(screen.getByTestId('search-button'));
      
      await waitFor(() => {
        expect(screen.getByTestId('result-item-0')).toBeInTheDocument();
      });
      
      const resultItem = screen.getByTestId('result-item-0');
      await user.click(resultItem);
      
      await waitFor(() => {
        expect(screen.getByTestId('detail-view')).toBeInTheDocument();
        expect(screen.getByText(/Episode 12/)).toBeInTheDocument();
      });
    });

    test('displays episodes count for anime', async () => {
      const mockResults = [
        {
          id: 1,
          type: 'ANIME',
          format: 'TV',
          title: { english: 'Episode Count Test', romaji: 'Test' },
          year: 2020,
          averageScore: 800,
          coverImageUrl: 'https://example.com/test.jpg',
          status: 'FINISHED',
          episodes: 24
        }
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResults
      });

      const user = userEvent.setup();
      render(<Search />);
      const input = screen.getByTestId('search-input');
      
      await user.type(input, 'Episode');
      await user.click(screen.getByTestId('search-button'));
      
      await waitFor(() => {
        expect(screen.getByTestId('result-item-0')).toBeInTheDocument();
      });
      
      const resultItem = screen.getByTestId('result-item-0');
      await user.click(resultItem);
      
      await waitFor(() => {
        expect(screen.getByTestId('detail-view')).toBeInTheDocument();
        expect(screen.getByTestId('episodes')).toBeInTheDocument();
        expect(screen.getByTestId('episodes')).toHaveTextContent('24');
      });
    });

    test('displays chapters and volumes for manga', async () => {
      const mockResults = [
        {
          id: 1,
          type: 'MANGA',
          format: 'MANGA',
          title: { english: 'Manga Test', romaji: 'Test' },
          year: 2015,
          averageScore: 850,
          coverImageUrl: 'https://example.com/test.jpg',
          status: 'FINISHED',
          chapters: 200,
          volumes: 20
        }
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResults
      });

      const user = userEvent.setup();
      render(<Search />);
      const input = screen.getByTestId('search-input');
      
      await user.type(input, 'Manga');
      await user.click(screen.getByTestId('search-button'));
      
      await waitFor(() => {
        expect(screen.getByTestId('result-item-0')).toBeInTheDocument();
      });
      
      const resultItem = screen.getByTestId('result-item-0');
      await user.click(resultItem);
      
      await waitFor(() => {
        expect(screen.getByTestId('detail-view')).toBeInTheDocument();
        expect(screen.getByTestId('chapters')).toBeInTheDocument();
        expect(screen.getByTestId('chapters')).toHaveTextContent('200');
        expect(screen.getByTestId('volumes')).toBeInTheDocument();
        expect(screen.getByTestId('volumes')).toHaveTextContent('20');
      });
    });

    test('displays genres list', async () => {
      const mockResults = [
        {
          id: 1,
          type: 'ANIME',
          format: 'TV',
          title: { english: 'Genre Test', romaji: 'Test' },
          year: 2020,
          averageScore: 800,
          coverImageUrl: 'https://example.com/test.jpg',
          status: 'FINISHED',
          genres: ['Action', 'Adventure', 'Fantasy']
        }
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResults
      });

      const user = userEvent.setup();
      render(<Search />);
      const input = screen.getByTestId('search-input');
      
      await user.type(input, 'Genre');
      await user.click(screen.getByTestId('search-button'));
      
      await waitFor(() => {
        expect(screen.getByTestId('result-item-0')).toBeInTheDocument();
      });
      
      const resultItem = screen.getByTestId('result-item-0');
      await user.click(resultItem);
      
      await waitFor(() => {
        expect(screen.getByTestId('detail-view')).toBeInTheDocument();
        expect(screen.getByText(/Action, Adventure, Fantasy/)).toBeInTheDocument();
      });
    });

    test('displays studios list', async () => {
      const mockResults = [
        {
          id: 1,
          type: 'ANIME',
          format: 'TV',
          title: { english: 'Studio Test', romaji: 'Test' },
          year: 2020,
          averageScore: 800,
          coverImageUrl: 'https://example.com/test.jpg',
          status: 'FINISHED',
          studios: ['Studio Ghibli', 'Madhouse']
        }
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResults
      });

      const user = userEvent.setup();
      render(<Search />);
      const input = screen.getByTestId('search-input');
      
      await user.type(input, 'Studio');
      await user.click(screen.getByTestId('search-button'));
      
      await waitFor(() => {
        expect(screen.getByTestId('result-item-0')).toBeInTheDocument();
      });
      
      const resultItem = screen.getByTestId('result-item-0');
      await user.click(resultItem);
      
      await waitFor(() => {
        expect(screen.getByTestId('detail-view')).toBeInTheDocument();
        expect(screen.getByText(/Studio Ghibli, Madhouse/)).toBeInTheDocument();
      });
    });

    test('displays synonyms/alternative titles', async () => {
      const mockResults = [
        {
          id: 1,
          type: 'ANIME',
          format: 'TV',
          title: { english: 'Synonym Test', romaji: 'Test' },
          year: 2020,
          averageScore: 800,
          coverImageUrl: 'https://example.com/test.jpg',
          status: 'FINISHED',
          synonyms: ['Alternative Title 1', 'Alternative Title 2']
        }
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResults
      });

      const user = userEvent.setup();
      render(<Search />);
      const input = screen.getByTestId('search-input');
      
      await user.type(input, 'Synonym');
      await user.click(screen.getByTestId('search-button'));
      
      await waitFor(() => {
        expect(screen.getByTestId('result-item-0')).toBeInTheDocument();
      });
      
      const resultItem = screen.getByTestId('result-item-0');
      await user.click(resultItem);
      
      await waitFor(() => {
        expect(screen.getByTestId('detail-view')).toBeInTheDocument();
        expect(screen.getByText(/Alternative Title 1, Alternative Title 2/)).toBeInTheDocument();
      });
    });
  });

  describe('Search with Multiple Filters', () => {
    test('searches with type and format filters combined', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

      const user = userEvent.setup();
      render(<Search />);
      const input = screen.getByTestId('search-input');
      
      // Set query
      await user.type(input, 'Test');
      
      // Select type
      const typeButton = screen.getByTestId('type-filter-button');
      await user.click(typeButton);
      await user.click(screen.getByText('Anime'));
      
      // Select format
      const formatButton = screen.getByTestId('format-filter-button');
      await user.click(formatButton);
      await user.click(screen.getByText('TV'));
      await user.click(document.body); // Close dropdown
      
      await user.click(screen.getByTestId('search-button'));
      
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          '/api/search',
          expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining('"type":"ANIME"')
          })
        );
      });
    });

    test('searches with all filters applied', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

      const user = userEvent.setup();
      render(<Search />);
      const input = screen.getByTestId('search-input');
      
      await user.type(input, 'Complete Test');
      
      // Select all filters
      const typeButton = screen.getByTestId('type-filter-button');
      await user.click(typeButton);
      await user.click(screen.getByText('Anime'));
      
      const formatButton = screen.getByTestId('format-filter-button');
      await user.click(formatButton);
      await user.click(screen.getByText('TV'));
      await user.click(document.body);
      
      const genreButton = screen.getByTestId('genre-filter-button');
      await user.click(genreButton);
      await user.click(screen.getByText('Action'));
      await user.click(document.body);
      
      const statusButton = screen.getByTestId('status-filter-button');
      await user.click(statusButton);
      await user.click(screen.getByText('RELEASING'));
      await user.click(document.body);
      
      const sortButton = screen.getByTestId('sort-filter-button');
      await user.click(sortButton);
      await user.click(screen.getByText('Rating Descending'));
      
      await user.click(screen.getByTestId('search-button'));
      
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          '/api/search',
          expect.objectContaining({
            method: 'POST'
          })
        );
      });
    });
  });

  describe('Adult Content Warning', () => {
    test('displays adult content warning in detail view when isAdult is true', async () => {
      const mockResults = [
        {
          id: 1,
          type: 'ANIME',
          format: 'TV',
          title: { english: 'Adult Anime', romaji: 'Test' },
          year: 2020,
          averageScore: 750,
          coverImageUrl: 'https://example.com/test.jpg',
          status: 'FINISHED',
          isAdult: true,
          description: 'This is an adult anime'
        }
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResults
      });

      const user = userEvent.setup();
      render(<Search />);
      const input = screen.getByTestId('search-input');
      
      await user.type(input, 'Adult');
      await user.click(screen.getByTestId('search-button'));
      
      await waitFor(() => {
        expect(screen.getByTestId('result-item-0')).toBeInTheDocument();
      });
      
      const resultItem = screen.getByTestId('result-item-0');
      await user.click(resultItem);
      
      await waitFor(() => {
        expect(screen.getByTestId('detail-view')).toBeInTheDocument();
        const adultWarning = screen.getByTestId('adult-warning');
        expect(adultWarning).toBeInTheDocument();
        expect(adultWarning).toHaveClass('is-adult');
      });
    });

    test('does not display adult content warning when isAdult is false', async () => {
      const mockResults = [
        {
          id: 1,
          type: 'ANIME',
          format: 'TV',
          title: { english: 'Safe Anime', romaji: 'Test' },
          year: 2020,
          averageScore: 800,
          coverImageUrl: 'https://example.com/test.jpg',
          status: 'FINISHED',
          isAdult: false,
          description: 'This is a safe anime'
        }
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResults
      });

      const user = userEvent.setup();
      render(<Search />);
      const input = screen.getByTestId('search-input');
      
      await user.type(input, 'Safe');
      await user.click(screen.getByTestId('search-button'));
      
      await waitFor(() => {
        expect(screen.getByTestId('result-item-0')).toBeInTheDocument();
      });
      
      const resultItem = screen.getByTestId('result-item-0');
      await user.click(resultItem);
      
      await waitFor(() => {
        expect(screen.getByTestId('detail-view')).toBeInTheDocument();
        expect(screen.queryByTestId('adult-warning')).not.toBeInTheDocument();
      });
    });

    test('does not display adult content warning when isAdult is undefined', async () => {
      const mockResults = [
        {
          id: 1,
          type: 'ANIME',
          format: 'TV',
          title: { english: 'Unknown Rating Anime', romaji: 'Test' },
          year: 2020,
          averageScore: 800,
          coverImageUrl: 'https://example.com/test.jpg',
          status: 'FINISHED',
          description: 'This anime has no isAdult field'
        }
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResults
      });

      const user = userEvent.setup();
      render(<Search />);
      const input = screen.getByTestId('search-input');
      
      await user.type(input, 'Unknown');
      await user.click(screen.getByTestId('search-button'));
      
      await waitFor(() => {
        expect(screen.getByTestId('result-item-0')).toBeInTheDocument();
      });
      
      const resultItem = screen.getByTestId('result-item-0');
      await user.click(resultItem);
      
      await waitFor(() => {
        expect(screen.getByTestId('detail-view')).toBeInTheDocument();
        expect(screen.queryByTestId('adult-warning')).not.toBeInTheDocument();
      });
    });

    test('displays adult content warning for manga', async () => {
      const mockResults = [
        {
          id: 1,
          type: 'MANGA',
          format: 'MANGA',
          title: { english: 'Adult Manga', romaji: 'Test' },
          year: 2015,
          averageScore: 800,
          coverImageUrl: 'https://example.com/test.jpg',
          status: 'FINISHED',
          isAdult: true,
          description: 'This is an adult manga',
          chapters: 150,
          volumes: 15
        }
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResults
      });

      const user = userEvent.setup();
      render(<Search />);
      const input = screen.getByTestId('search-input');
      
      await user.type(input, 'Manga');
      await user.click(screen.getByTestId('search-button'));
      
      await waitFor(() => {
        expect(screen.getByTestId('result-item-0')).toBeInTheDocument();
      });
      
      const resultItem = screen.getByTestId('result-item-0');
      await user.click(resultItem);
      
      await waitFor(() => {
        expect(screen.getByTestId('detail-view')).toBeInTheDocument();
        expect(screen.getByTestId('adult-warning')).toBeInTheDocument();
      });
    });
  });
});
