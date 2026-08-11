import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

describe('App Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders TokTickIT title and Check System button', () => {
    render(<App />);
    expect(screen.getByText(/TokTickIT IT Service Desk/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Check System/i })).toBeDefined();
  });

  it('displays Online status and category list when API call succeeds', async () => {
    const mockCategories = [
      { id: 1, name: 'Account and Access' },
      { id: 2, name: 'Hardware' },
      { id: 3, name: 'Software' },
      { id: 4, name: 'Network' },
    ];

    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/api/health')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ status: 'ok', service: 'TokTickIT API' }),
        } as Response);
      }
      if (url.includes('/api/categories')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockCategories,
        } as Response);
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });

    render(<App />);
    const button = screen.getByRole('button', { name: /Check System/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/System Status:/i)).toBeDefined();
      expect(screen.getByText(/Online/i)).toBeDefined();
      expect(screen.getByText(/Supported Request Categories:/i)).toBeDefined();
      expect(screen.getByText(/Account and Access/i)).toBeDefined();
      expect(screen.getByText(/Hardware/i)).toBeDefined();
      expect(screen.getByText(/Software/i)).toBeDefined();
      expect(screen.getByText(/Network/i)).toBeDefined();
    });
  });

  it('displays Offline status and error message when API fails', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    render(<App />);
    const button = screen.getByRole('button', { name: /Check System/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/Offline/i)).toBeDefined();
      expect(screen.getByText(/Unable to connect to TokTickIT API/i)).toBeDefined();
    });
  });
});
