import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserSearch from '../UserSearch';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key],
    setItem: (key, value) => { store[key] = value; },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock makeAuthenticatedRequest
jest.mock('../utils/makeAuthenticatedRequest', () => ({
  makeAuthenticatedRequest: jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({}) }))
}));

// Mock fetch
global.fetch = jest.fn(() => Promise.resolve({
  ok: true,
  json: () => Promise.resolve([
    { id: 2, username: 'testuser', avatarUrl: null },
    { id: 3, username: 'anotheruser', avatarUrl: 'avatar.png' }
  ])
}));

describe('UserSearch Component', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.localStorage.setItem('userId', '1');
  });

  it('renders search input and button', () => {
    render(<UserSearch loggedIn={true} userData={{}} />);
    expect(screen.getByTestId('search-input')).toBeInTheDocument();
    expect(screen.getByTestId('search-button')).toBeInTheDocument();
  });

  it('executes search and displays results', async () => {
    render(<UserSearch loggedIn={true} userData={{}} />);
    fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'test' } });
    fireEvent.click(screen.getByTestId('search-button'));
    await waitFor(() => {
      expect(screen.getByText('testuser')).toBeInTheDocument();
      expect(screen.getByText('anotheruser')).toBeInTheDocument();
    });
  });

  it('shows no results message when search yields nothing', async () => {
    global.fetch.mockImplementationOnce(() => Promise.resolve({ ok: true, json: () => Promise.resolve([]) }));
    render(<UserSearch loggedIn={true} userData={{}} />);
    fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'none' } });
    fireEvent.click(screen.getByTestId('search-button'));
    await waitFor(() => {
      expect(screen.getByTestId('no-results-message')).toBeInTheDocument();
    });
  });

  it('disables search button while loading', async () => {
    render(<UserSearch loggedIn={true} userData={{}} />);
    fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'test' } });
    fireEvent.click(screen.getByTestId('search-button'));
    expect(screen.getByTestId('search-button')).toBeDisabled();
    await waitFor(() => {
      expect(screen.getByTestId('search-button')).not.toBeDisabled();
    });
  });

  it('handles follow request and shows toast', async () => {
    render(<UserSearch loggedIn={true} userData={{}} />);
    fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'test' } });
    fireEvent.click(screen.getByTestId('search-button'));
    await waitFor(() => {
      fireEvent.click(screen.getByText('testuser'));
    });
    // Simulate follow request
    await waitFor(() => {
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });
});
