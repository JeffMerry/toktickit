import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RequesterDashboard, StaffDashboard } from './Dashboards';
import { apiFetch } from '../lib/api';

vi.mock('../lib/api', () => ({ apiFetch: vi.fn() }));
const mockedFetch = vi.mocked(apiFetch);
const metric = (value: number, filters: Record<string, string | boolean>, view = 'my-tickets') => ({ value, drillDown: { view, filters } });

describe('Lab 4 dashboard UI', () => {
  beforeEach(() => vi.clearAllMocks());

  it('opens requester metric filters and an owned Ticket detail', async () => {
    mockedFetch.mockResolvedValue({ ok: true, json: async () => ({
      metrics: {
        openTickets: metric(1, { terminal: false }), waitingForRequester: metric(0, { status: 'WAITING_FOR_REQUESTER' }),
        recentlyUpdated: metric(1, { sortBy: 'updatedAt' }), recentlyResolved: metric(0, { status: 'RESOLVED' }),
      },
      attentionTickets: [{ id: 17, ticketNumber: 'TKT-17', summary: 'Network issue', currentStatus: 'OPEN', itPriority: 'HIGH', updatedAt: '2026-10-06T00:00:00Z' }],
      recentResolvedTickets: [],
    }) } as Response);
    const onDrillDown = vi.fn();
    const onTicket = vi.fn();
    render(<RequesterDashboard onDrillDown={onDrillDown} onTicket={onTicket} onCreate={vi.fn()} />);
    fireEvent.click(await screen.findByRole('button', { name: 'View 1 open tickets' }));
    expect(onDrillDown).toHaveBeenCalledWith({ terminal: false });
    fireEvent.click(screen.getByRole('button', { name: 'TKT-17: Network issue' }));
    expect(onTicket).toHaveBeenCalledWith(17);
    expect(screen.getByText('No matching tickets right now.')).toBeInTheDocument();
  });

  it('shows a safe error and retries staff dashboard loading', async () => {
    mockedFetch.mockRejectedValueOnce(new Error('Connection failed'));
    mockedFetch.mockResolvedValueOnce({ ok: true, json: async () => ({
      metrics: {
        unassignedTickets: metric(0, { assignment: 'unassigned' }, 'staff-queue'),
        myOwnedTickets: metric(0, { ownerId: '3' }, 'staff-queue'),
        urgentActiveTickets: metric(0, { itPriority: 'URGENT' }, 'staff-queue'),
        recentlyUpdatedTickets: metric(0, { sortBy: 'updatedAt' }, 'staff-queue'),
      }, byStatus: [{ status: 'OPEN', value: 0 }], byItPriority: [{ priority: 'URGENT', value: 0 }], urgentTickets: [], recentTickets: [],
    }) } as Response);
    const onDrillDown = vi.fn();
    render(<StaffDashboard onDrillDown={onDrillDown} onTicket={vi.fn()} />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Connection failed');
    fireEvent.click(screen.getByRole('button', { name: 'Retry dashboard' }));
    expect(await screen.findByRole('heading', { name: 'IT Staff Dashboard' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'OPEN: 0' }));
    expect(onDrillDown).toHaveBeenCalledWith({ status: 'OPEN' });
    await waitFor(() => expect(mockedFetch).toHaveBeenCalledTimes(2));
  });
});
