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

  it('displays Online status when API health returns ok', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'ok', service: 'TokTickIT API' }),
    } as Response);

    render(<App />);
    const button = screen.getByRole('button', { name: /Check System/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/System Status:/i)).toBeDefined();
      expect(screen.getByText(/Online/i)).toBeDefined();
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
