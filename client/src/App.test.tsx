import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('App Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: 'Authentication is required.' }),
    }));
  });

  it('renders the login page when no session is available', async () => {
    render(<App />);
    expect(await screen.findByRole('heading', { name: 'TokTickIT' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
  });
});
