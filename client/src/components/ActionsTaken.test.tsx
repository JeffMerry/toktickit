import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ActionsTaken } from './ActionsTaken';
import { apiFetch } from '../lib/api';

vi.mock('../lib/api', () => ({ apiFetch: vi.fn() }));
const mockedApiFetch = vi.mocked(apiFetch);

const action = {
  id: 1,
  actionOccurredAt: '2026-10-01T03:30:00.000Z',
  description: 'Inspect the VPN connection logs.',
  result: null,
  status: 'IN_PROGRESS' as const,
  assignee: { id: 2, name: 'Mary Support', role: 'IT_STAFF' },
  createdBy: { id: 3, name: 'Somchai Technician', role: 'IT_STAFF' },
  performedBy: null,
  followUpRequired: true,
  followUpNote: 'Confirm stable access tomorrow.',
  attachmentNotes: null,
  createdAt: '2026-10-01T03:31:00.000Z',
  updatedAt: '2026-10-01T03:35:00.000Z',
};

describe('ActionsTaken', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows a readable Actions Taken entry', async () => {
    mockedApiFetch.mockResolvedValue({ ok: true, json: async () => [action] } as Response);
    render(<ActionsTaken ticketId={12} />);
    expect(await screen.findByText('Inspect the VPN connection logs.')).toBeInTheDocument();
    expect(screen.getByText('IN PROGRESS')).toBeInTheDocument();
    expect(screen.getByText(/Follow-up required/)).toBeInTheDocument();
    expect(screen.getByText(/Mary Support/)).toBeInTheDocument();
    expect(screen.getByText(/Edited after creation/)).toBeInTheDocument();
  });

  it('shows an explicit empty state', async () => {
    mockedApiFetch.mockResolvedValue({ ok: true, json: async () => [] } as Response);
    render(<ActionsTaken ticketId={12} />);
    expect(await screen.findByText('No actions have been recorded for this ticket.')).toBeInTheDocument();
  });

  it('offers retry after a safe API failure', async () => {
    mockedApiFetch.mockResolvedValue({ ok: false, json: async () => ({ error: 'Unable to load actions safely.' }) } as Response);
    render(<ActionsTaken ticketId={12} />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to load actions safely.');
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });
});
