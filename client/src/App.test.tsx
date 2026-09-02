import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('App Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders correctly', () => {
    render(<App />);
    expect(screen.getByText(/TokTickIT/i)).toBeInTheDocument();
  });
});
