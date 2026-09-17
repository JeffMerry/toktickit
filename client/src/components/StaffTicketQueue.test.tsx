import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { StaffTicketQueue } from './StaffTicketQueue';
import { apiFetch } from '../lib/api';

vi.mock('../lib/api', () => ({ apiFetch: vi.fn() }));

const mockedApiFetch = vi.mocked(apiFetch);

describe('StaffTicketQueue', () => {
  beforeEach(() => vi.clearAllMocks());

  it('loads and displays operational ticket queue entries', async () => {
    mockedApiFetch.mockImplementation(async (path) => {
      if (path === '/api/categories') return { ok: true, json: async () => [{ id: 1, name: 'Network' }] } as Response;
      if (path === '/api/staff/eligible-owners') return { ok: true, json: async () => [{ id: 2, name: 'Queue Staff', role: 'IT_STAFF' }] } as Response;
      return {
        ok: true,
        json: async () => ({
          data: [{ id: 1, ticketNumber: 'TKT-2026-QUEUE-A', summary: 'Queue Alpha issue', requestedPriority: 'HIGH', itPriority: 'URGENT', currentStatus: 'NEW', requester: { name: 'Queue Requester', email: 'requester@example.test' }, owner: null, category: { name: 'Network' } }],
          pagination: { total: 11, page: path.includes('page=2') ? 2 : 1, limit: 10, totalPages: 2 },
        }),
      } as Response;
    });

    render(<StaffTicketQueue onSelectTicket={vi.fn()} />);

    expect(await screen.findByText('TKT-2026-QUEUE-A')).toBeInTheDocument();
    expect(screen.getByText('Queue Alpha issue')).toBeInTheDocument();
    expect(screen.getByText(/Requester: Queue Requester/)).toBeInTheDocument();
    expect(screen.getByLabelText('Category')).toBeInTheDocument();
    expect(screen.getByLabelText('Owner')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'NEW' } });
    await waitFor(() => expect(mockedApiFetch).toHaveBeenCalledWith(expect.stringContaining('status=NEW')));
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    await waitFor(() => expect(mockedApiFetch).toHaveBeenCalledWith(expect.stringContaining('page=2')));
  });
});
