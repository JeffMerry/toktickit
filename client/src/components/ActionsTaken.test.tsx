import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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
    expect(screen.queryByRole('button', { name: 'Add Action Taken' })).not.toBeInTheDocument();
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

  it('shows operational create controls and submits a valid action', async () => {
    mockedApiFetch.mockImplementation(async (path, init) => {
      if (path === '/api/tickets/12/actions-taken') return { ok: true, json: async () => [action] } as Response;
      if (path === '/api/staff/action-assignees') return { ok: true, json: async () => [{ id: 2, name: 'Mary Support', role: 'IT_STAFF' }] } as Response;
      if (path === '/api/staff/tickets/12/actions-taken' && init?.method === 'POST') return { ok: true, json: async () => ({ ...action, id: 2 }) } as Response;
      throw new Error(`Unexpected API call: ${path}`);
    });
    render(<ActionsTaken ticketId={12} canManage />);
    fireEvent.click(screen.getByRole('button', { name: 'Add Action Taken' }));
    fireEvent.change(screen.getByLabelText('Action description'), { target: { value: 'Check the VPN cable.' } });
    fireEvent.click(screen.getByLabelText('Follow-up required'));
    fireEvent.change(screen.getByLabelText('Follow-up note'), { target: { value: 'Confirm connectivity tomorrow.' } });
    fireEvent.submit(screen.getByRole('form', { name: 'Add Action Taken' }));
    await waitFor(() => expect(mockedApiFetch).toHaveBeenCalledWith('/api/staff/tickets/12/actions-taken', expect.objectContaining({ method: 'POST' })));
  });

  it('starts a planned action only for an operational user', async () => {
    const planned = { ...action, status: 'PLANNED' as const, updatedAt: action.createdAt };
    mockedApiFetch.mockImplementation(async (path, init) => {
      if (path === '/api/tickets/12/actions-taken') return { ok: true, json: async () => [planned] } as Response;
      if (path === '/api/staff/action-assignees') return { ok: true, json: async () => [] } as Response;
      if (path === '/api/staff/actions-taken/1/status' && init?.method === 'PATCH') return { ok: true, json: async () => ({ ...planned, status: 'IN_PROGRESS' }) } as Response;
      throw new Error(`Unexpected API call: ${path}`);
    });
    render(<ActionsTaken ticketId={12} canManage />);
    fireEvent.click(await screen.findByRole('button', { name: 'Start' }));
    await waitFor(() => expect(mockedApiFetch).toHaveBeenCalledWith('/api/staff/actions-taken/1/status', expect.objectContaining({ method: 'PATCH' })));
  });

  it('keeps the completed action assignee read-only while allowing edits', async () => {
    const completed = { ...action, status: 'COMPLETED' as const, result: 'VPN is stable.' };
    mockedApiFetch.mockImplementation(async (path) => {
      if (path === '/api/tickets/12/actions-taken') return { ok: true, json: async () => [completed] } as Response;
      if (path === '/api/staff/action-assignees') return { ok: true, json: async () => [{ id: 2, name: 'Mary Support', role: 'IT_STAFF' }] } as Response;
      throw new Error(`Unexpected API call: ${path}`);
    });
    render(<ActionsTaken ticketId={12} canManage />);
    fireEvent.click(await screen.findByRole('button', { name: 'Edit Action' }));
    expect(screen.getByLabelText('Assignee')).toBeDisabled();
    expect(screen.getByText('Assignee is read-only after completion.')).toBeInTheDocument();
  });
});
