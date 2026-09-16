import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { StaffTicketDetail } from './StaffTicketDetail';
import { apiFetch } from '../lib/api';

vi.mock('../lib/api', () => ({ apiFetch: vi.fn() }));

const mockedApiFetch = vi.mocked(apiFetch);

describe('StaffTicketDetail', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders operational controls for an unassigned ticket', async () => {
    mockedApiFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 1, ticketNumber: 'TKT-2026-DETAIL-A', summary: 'Network outage', description: 'Network outage detail', requestedPriority: 'HIGH', itPriority: 'HIGH', currentStatus: 'NEW', updatedAt: '2026-09-17T00:00:00.000Z',
        requester: { name: 'Requester A', email: 'requester@example.test' }, owner: null,
        eligibleOwners: [{ id: 2, name: 'Staff A', role: 'IT_STAFF' }], allowedNextStatuses: ['OPEN', 'CANCELLED'], category: { name: 'Network' }, relatedSystem: { name: 'VPN' }, attachments: [], publicComments: [], internalNotes: [],
      }),
    } as Response);

    render(<StaffTicketDetail ticketId={1} onBack={vi.fn()} />);

    expect(await screen.findByRole('heading', { name: 'Network outage' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Claim Ticket' })).toBeInTheDocument();
    expect(screen.getByLabelText('IT Priority')).toHaveValue('HIGH');
    expect(screen.getByLabelText('Owner')).toHaveValue('');
    expect(screen.getByLabelText('Next status')).toBeInTheDocument();
  });
});
