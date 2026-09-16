import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { StaffTicketQueue } from './StaffTicketQueue';
import { apiFetch } from '../lib/api';

vi.mock('../lib/api', () => ({ apiFetch: vi.fn() }));

const mockedApiFetch = vi.mocked(apiFetch);

describe('StaffTicketQueue', () => {
  beforeEach(() => vi.clearAllMocks());

  it('loads and displays operational ticket queue entries', async () => {
    mockedApiFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [{ id: 1, ticketNumber: 'TKT-2026-QUEUE-A', summary: 'Queue Alpha issue', requestedPriority: 'HIGH', itPriority: 'URGENT', currentStatus: 'NEW', requester: { name: 'Queue Requester', email: 'requester@example.test' }, owner: null, category: { name: 'Network' } }],
        pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
      }),
    } as Response);

    render(<StaffTicketQueue />);

    expect(await screen.findByText('TKT-2026-QUEUE-A')).toBeInTheDocument();
    expect(screen.getByText('Queue Alpha issue')).toBeInTheDocument();
    expect(screen.getByText(/Requester: Queue Requester/)).toBeInTheDocument();
    expect(mockedApiFetch).toHaveBeenCalledWith(expect.stringContaining('/api/staff/tickets?'));
  });
});
