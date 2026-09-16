import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PublicCommentSection } from './PublicCommentSection';
import { apiFetch } from '../lib/api';

vi.mock('../lib/api', () => ({ apiFetch: vi.fn() }));
const mockedApiFetch = vi.mocked(apiFetch);

describe('PublicCommentSection', () => {
  beforeEach(() => vi.clearAllMocks());

  it('loads comments and renders the requester comment form', async () => {
    mockedApiFetch.mockResolvedValue({ ok: true, json: async () => [{ id: 1, content: 'Support is investigating.', createdAt: '2026-09-17T00:00:00.000Z', author: { name: 'Support Staff', role: 'IT_STAFF' } }] } as Response);
    render(<PublicCommentSection ticketId={1} />);
    expect(await screen.findByText('Support is investigating.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Post Comment' })).toBeInTheDocument();
  });
});
