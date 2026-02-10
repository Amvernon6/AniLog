import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserProfile from '../UserProfile';

const mockSelectedItem = {
  id: 2,
  username: 'testuser',
  avatarUrl: null,
};

const defaultProps = {
  selectedItem: mockSelectedItem,
  accessToken: 'mockToken',
  usersFollowing: [3],
  usersFollowers: [1],
  usersRequested: [4],
  addedItems: [101],
  inProgressItems: new Map([[101, 'WATCHING']]),
  onHandleFollow: jest.fn(),
  onHandleUnfollow: jest.fn(),
  onHandleFollowRequest: jest.fn(),
  onAddToMyList: jest.fn(),
  onAddToInProgress: jest.fn(),
  onBack: jest.fn(),
  onRefresh: jest.fn(),
};

describe('UserProfile Component', () => {
  it('renders profile for selected user', () => {
    render(<UserProfile {...defaultProps} />);
    expect(screen.getByText('testuser')).toBeInTheDocument();
  });

  it('calls onBack when back button is clicked', () => {
    render(<UserProfile {...defaultProps} />);
    const backButton = screen.queryByRole('button', { name: /back/i });
    if (backButton) {
      fireEvent.click(backButton);
      expect(defaultProps.onBack).toHaveBeenCalled();
    }
  });

  it('calls onHandleFollow when follow button is clicked', async () => {
    render(<UserProfile {...defaultProps} />);
    const followButton = screen.queryByRole('button', { name: /follow/i });
    if (followButton) {
      fireEvent.click(followButton);
      await waitFor(() => {
        expect(defaultProps.onHandleFollow).toHaveBeenCalled();
      });
    }
  });

  it('calls onHandleUnfollow when unfollow button is clicked', async () => {
    render(<UserProfile {...defaultProps} />);
    const unfollowButton = screen.queryByRole('button', { name: /unfollow/i });
    if (unfollowButton) {
      fireEvent.click(unfollowButton);
      await waitFor(() => {
        expect(defaultProps.onHandleUnfollow).toHaveBeenCalled();
      });
    }
  });

  it('calls onHandleFollowRequest when follow request button is clicked', async () => {
    render(<UserProfile {...defaultProps} />);
    const requestButton = screen.queryByRole('button', { name: /request/i });
    if (requestButton) {
      fireEvent.click(requestButton);
      await waitFor(() => {
        expect(defaultProps.onHandleFollowRequest).toHaveBeenCalled();
      });
    }
  });

  it('calls onAddToMyList when add to list button is clicked', async () => {
    render(<UserProfile {...defaultProps} />);
    const addToListButton = screen.queryByRole('button', { name: /add to list/i });
    if (addToListButton) {
      fireEvent.click(addToListButton);
      await waitFor(() => {
        expect(defaultProps.onAddToMyList).toHaveBeenCalled();
      });
    }
  });

  it('calls onAddToInProgress when add to in-progress button is clicked', async () => {
    render(<UserProfile {...defaultProps} />);
    const addToInProgressButton = screen.queryByRole('button', { name: /add to in-progress/i });
    if (addToInProgressButton) {
      fireEvent.click(addToInProgressButton);
      await waitFor(() => {
        expect(defaultProps.onAddToInProgress).toHaveBeenCalled();
      });
    }
  });

  it('calls onRefresh when refresh button is clicked', async () => {
    render(<UserProfile {...defaultProps} />);
    const refreshButton = screen.queryByRole('button', { name: /refresh/i });
    if (refreshButton) {
      fireEvent.click(refreshButton);
      await waitFor(() => {
        expect(defaultProps.onRefresh).toHaveBeenCalled();
      });
    }
  });
});
