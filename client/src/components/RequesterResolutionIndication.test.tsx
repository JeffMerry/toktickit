import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RequesterResolutionIndication } from './RequesterResolutionIndication';
import { apiFetch } from '../lib/api';

vi.mock('../lib/api', () => ({ apiFetch: vi.fn() }));

const mockedApiFetch = vi.mocked(apiFetch);

describe('RequesterResolutionIndication', () => {
  beforeEach(() => vi.clearAllMocks());

  it('records an advisory indication and explains that IT Staff must review it', async () => {
    mockedApiFetch.mockResolvedValue({ ok: true, json: async () => ({ requesterResolvedAt: '2026-10-03T09:00:00.000Z' }) } as Response);
    const onRecorded = vi.fn();
    render(<RequesterResolutionIndication ticketId={12} requesterResolvedAt={null} onRecorded={onRecorded} />);

    fireEvent.click(screen.getByRole('button', { name: 'Problem appears resolved' }));

    await waitFor(() => expect(mockedApiFetch).toHaveBeenCalledWith('/api/tickets/12/resolution-indication', expect.objectContaining({ method: 'POST' })));
    expect(await screen.findByText('Resolution advisory recorded')).toBeInTheDocument();
    expect(screen.getByText(/IT Staff must still formally review/i)).toBeInTheDocument();
    expect(onRecorded).toHaveBeenCalledOnce();
  });
});
