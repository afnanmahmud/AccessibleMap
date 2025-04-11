import { render, screen, fireEvent } from '@testing-library/react';
import { vi, test, expect } from 'vitest'; // Import vi for mocking
import { BrowserRouter } from 'react-router-dom';
import SignUpForm from '../components/SignUpForm';

vi.mock('axios', () => ({
  default: {
    post: vi.fn().mockResolvedValue({ data: { success: true } }),
  },
}));

test('submits signup form successfully', () => {
  render(
    <BrowserRouter>
      <SignUpForm />
    </BrowserRouter>
  );
  // Add test logic for form submission
});