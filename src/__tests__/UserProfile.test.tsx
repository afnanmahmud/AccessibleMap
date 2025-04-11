import { render, screen, fireEvent } from '@testing-library/react';
import { vi, test, expect } from 'vitest'; // Import vi for mocking
import { BrowserRouter } from 'react-router-dom';
import UserProfile from '../components/UserProfile';

// Mock the navigate function from react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'), // Preserve other exports
  useNavigate: () => mockNavigate,
  BrowserRouter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>, // Mock BrowserRouter as a simple wrapper
}));

test('navigates to map when Back to Map button is clicked', () => {
  render(
    <BrowserRouter>
      <UserProfile />
    </BrowserRouter>
  );

  const backButton = screen.getByText('Back to Map');
  fireEvent.click(backButton);

  expect(mockNavigate).toHaveBeenCalledWith('/map');
});