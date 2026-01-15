import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import TitleDetail from '../TitleDetail';

describe('TitleDetail Component', () => {
  const mockItem = {
    id: 1,
    type: 'ANIME',
    format: 'TV',
    title: { english: 'Demon Slayer', romaji: 'Kimetsu no Yaiba', nativeTitle: '鬼滅の刃' },
    year: 2019,
    averageScore: 850,
    coverImageUrl: 'https://example.com/ds.jpg',
    status: 'FINISHED',
    episodes: 26,
    description: 'An anime about demons and slayers',
    genres: ['Action', 'Supernatural'],
    studios: ['ufotable'],
    synonyms: ['Demon Slayer'],
    isAdult: false,
    nextAiringEpisode: null
  };

  const mockProps = {
    selectedItem: mockItem,
    onBack: jest.fn(),
    inProgressItems: new Set(),
    addedItems: new Set(),
    onAddToList: jest.fn(),
    onRemoveFromList: jest.fn(),
    onAddToInProgress: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders detail view with all information', () => {
    render(<TitleDetail {...mockProps} />);

    expect(screen.getByTestId('detail-view')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /Demon Slayer/ })).toBeInTheDocument();
    expect(screen.getByText('An anime about demons and slayers')).toBeInTheDocument();
    expect(screen.getByTestId('episodes')).toBeInTheDocument();
    expect(screen.getByText(/Action, Supernatural/)).toBeInTheDocument(); // genres
    expect(screen.getByText(/ufotable/)).toBeInTheDocument(); // studios
  });

  test('back button calls onBack callback', async () => {
    const user = userEvent.setup();
    render(<TitleDetail {...mockProps} />);

    const backButton = screen.getByTestId('back-button');
    await user.click(backButton);

    expect(mockProps.onBack).toHaveBeenCalledTimes(1);
  });

  test('displays add to list button when item not added', () => {
    render(<TitleDetail {...mockProps} />);

    expect(screen.getByText('+ Add to List')).toBeInTheDocument();
  });

  test('displays added button when item is in addedItems', () => {
    const propsWithAdded = {
      ...mockProps,
      addedItems: new Set([1])
    };

    render(<TitleDetail {...propsWithAdded} />);

    expect(screen.getByText('✓ Added to List')).toBeInTheDocument();
  });

  test('displays in-progress button when item not in progress', () => {
    render(<TitleDetail {...mockProps} />);

    expect(screen.getByText('+ Mark as In Progress')).toBeInTheDocument();
  });

  test('displays in-progress added button when item is in progress', () => {
    const propsWithProgress = {
      ...mockProps,
      inProgressItems: new Set([1])
    };

    render(<TitleDetail {...propsWithProgress} />);

    expect(screen.getByText('✓ In Progress')).toBeInTheDocument();
  });

  test('add to list button calls onAddToList', async () => {
    const user = userEvent.setup();
    render(<TitleDetail {...mockProps} />);

    const addButton = screen.getByText('+ Add to List');
    await user.click(addButton);

    expect(mockProps.onAddToList).toHaveBeenCalledWith(mockItem);
  });

  test('remove from list button calls onRemoveFromList', async () => {
    const user = userEvent.setup();
    const propsWithAdded = {
      ...mockProps,
      addedItems: new Set([1])
    };

    render(<TitleDetail {...propsWithAdded} />);

    const removeButton = screen.getByText('✓ Added to List');
    await user.click(removeButton);

    expect(mockProps.onRemoveFromList).toHaveBeenCalledWith(mockItem);
  });

  test('in-progress button calls onAddToInProgress', async () => {
    const user = userEvent.setup();
    render(<TitleDetail {...mockProps} />);

    const inProgressButton = screen.getByText('+ Mark as In Progress');
    await user.click(inProgressButton);

    expect(mockProps.onAddToInProgress).toHaveBeenCalledWith(mockItem);
  });

  test('displays year and score information', () => {
    render(<TitleDetail {...mockProps} />);

    expect(screen.getByText(/Year: 2019/)).toBeInTheDocument();
    expect(screen.getByTestId('detail-info')).toHaveTextContent('85.0');
  });

  test('displays status with correct styling', () => {
    render(<TitleDetail {...mockProps} />);

    const statusElement = screen.getByTestId('status');
    expect(statusElement).toHaveClass('status-finished');
    expect(statusElement).toHaveTextContent('FINISHED');
  });

  test('displays cover image with correct src', () => {
    render(<TitleDetail {...mockProps} />);

    const img = screen.getByAltText('Demon Slayer');
    expect(img).toHaveAttribute('src', 'https://example.com/ds.jpg');
  });

  test('does not display adult warning when isAdult is false', () => {
    render(<TitleDetail {...mockProps} />);

    expect(screen.queryByTestId('adult-warning')).not.toBeInTheDocument();
  });

  test('displays adult warning when isAdult is true', () => {
    const propsWithAdult = {
      ...mockProps,
      selectedItem: { ...mockItem, isAdult: true }
    };

    render(<TitleDetail {...propsWithAdult} />);

    expect(screen.getByTestId('adult-warning')).toBeInTheDocument();
    expect(screen.getByText(/Adult Content/)).toBeInTheDocument();
  });

  test('does not display episodes when episodes is null', () => {
    const propsNoEpisodes = {
      ...mockProps,
      selectedItem: { ...mockItem, episodes: null }
    };

    render(<TitleDetail {...propsNoEpisodes} />);

    expect(screen.queryByTestId('episodes')).not.toBeInTheDocument();
  });

  test('displays chapters when item is manga', () => {
    const mangaItem = {
      ...mockItem,
      type: 'MANGA',
      episodes: null,
      chapters: 200
    };

    const mangaProps = {
      ...mockProps,
      selectedItem: mangaItem
    };

    render(<TitleDetail {...mangaProps} />);

    expect(screen.getByTestId('chapters')).toHaveTextContent('200');
    expect(screen.queryByTestId('episodes')).not.toBeInTheDocument();
  });

  test('displays description with HTML content', () => {
    const itemWithHtml = {
      ...mockItem,
      description: '<p>Test description with <b>bold</b> text</p>'
    };

    const propsWithHtml = {
      ...mockProps,
      selectedItem: itemWithHtml
    };

    render(<TitleDetail {...propsWithHtml} />);

    expect(screen.getByText('Description')).toBeInTheDocument();
  });

  test('displays genres list', () => {
    render(<TitleDetail {...mockProps} />);

    expect(screen.getByText(/Genres:/)).toBeInTheDocument();
    expect(screen.getByText(/Action, Supernatural/)).toBeInTheDocument();
  });

  test('displays studios list', () => {
    render(<TitleDetail {...mockProps} />);

    expect(screen.getByText(/Studios:/)).toBeInTheDocument();
    expect(screen.getByText(/ufotable/)).toBeInTheDocument();
  });

  test('displays synonyms list', () => {
    render(<TitleDetail {...mockProps} />);

    expect(screen.getByTestId('synonyms')).toBeInTheDocument();
    expect(screen.getByTestId('synonyms')).toHaveTextContent('Demon Slayer');
  });

  test('hides add button when item is in progress', () => {
    const propsWithProgress = {
      ...mockProps,
      inProgressItems: new Set([1])
    };

    render(<TitleDetail {...propsWithProgress} />);

    expect(screen.queryByText('+ Add to List')).not.toBeInTheDocument();
    expect(screen.getByText('✓ In Progress')).toBeInTheDocument();
  });

  test('renders media type and format when different', () => {
    render(<TitleDetail {...mockProps} />);

    const mediaTypeElement = screen.getByText(/ANIME.*TV/);
    expect(mediaTypeElement).toBeInTheDocument();
  });

  test('does not display format when it matches type', () => {
    const mangaItem = {
      ...mockItem,
      type: 'MANGA',
      format: 'MANGA'
    };

    const mangaProps = {
      ...mockProps,
      selectedItem: mangaItem
    };

    render(<TitleDetail {...mangaProps} />);

    const mediaTypeElement = screen.getByTestId('media-type');
    expect(mediaTypeElement.textContent.trim()).toContain('MANGA');
  });

  test('displays next airing episode information when available', () => {
    const itemWithAiring = {
      ...mockItem,
      status: 'RELEASING',
      nextAiringEpisode: {
        episode: 5,
        timeUntilAiring: 604800 // 7 days in seconds
      }
    };

    const propsWithAiring = {
      ...mockProps,
      selectedItem: itemWithAiring
    };

    render(<TitleDetail {...propsWithAiring} />);

    expect(screen.getByText(/Next Episode:/)).toBeInTheDocument();
    expect(screen.getByText(/Episode 5/)).toBeInTheDocument();
  });

  test('does not display next airing episode when null', () => {
    render(<TitleDetail {...mockProps} />);

    expect(screen.queryByText(/Next Episode:/)).not.toBeInTheDocument();
  });

  test('displays volumes for manga', () => {
    const mangaItem = {
      ...mockItem,
      type: 'MANGA',
      episodes: null,
      chapters: 500,
      volumes: 50
    };

    const mangaProps = {
      ...mockProps,
      selectedItem: mangaItem
    };

    render(<TitleDetail {...mangaProps} />);

    expect(screen.getByTestId('volumes')).toHaveTextContent('50');
  });

  test('does not show add and in-progress buttons when item is not selected', () => {
    const { rerender } = render(<TitleDetail {...mockProps} />);

    expect(screen.getByText('+ Add to List')).toBeInTheDocument();

    // Re-render with selectedItem as null
    const propsNoItem = {
      ...mockProps,
      selectedItem: null
    };

    rerender(<TitleDetail {...propsNoItem} />);

    expect(screen.queryByText('+ Add to List')).not.toBeInTheDocument();
  });
});
