import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserManagement } from './UserManagement';
import { apiFetch } from '../lib/api';

vi.mock('../lib/api', () => ({ apiFetch: vi.fn() }));

const mockedApiFetch = vi.mocked(apiFetch);
const user = {
  id: 14, name: 'Alex User', email: 'alex@example.test', role: 'IT_STAFF', isActive: true, mustChangePassword: false,
  createdAt: '2026-09-17T00:00:00.000Z', updatedAt: '2026-09-17T00:00:00.000Z',
};

describe('UserManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedApiFetch.mockImplementation(async (path, init) => {
      if (path === '/api/admin/users' && init?.method === 'POST') return { ok: true, json: async () => ({ ...user, id: 15, name: 'Created User' }) } as Response;
      return { ok: true, json: async () => ({ data: [user], pagination: { total: 1, page: 1, limit: 20, totalPages: 1 } }) } as Response;
    });
  });

  it('loads users and sends search and role filter query parameters', async () => {
    render(<UserManagement />);
    expect(await screen.findByText('Alex User')).toBeInTheDocument();
    expect(screen.getAllByText('IT STAFF')).not.toHaveLength(0);

    fireEvent.change(screen.getByLabelText('Search name or email'), { target: { value: 'alex' } });
    fireEvent.change(screen.getByLabelText('Role filter'), { target: { value: 'IT_STAFF' } });
    fireEvent.click(screen.getByRole('button', { name: 'Search' }));
    await waitFor(() => expect(mockedApiFetch).toHaveBeenCalledWith(expect.stringContaining('search=alex')));
    await waitFor(() => expect(mockedApiFetch).toHaveBeenCalledWith(expect.stringContaining('role=IT_STAFF')));
  });

  it('creates a user with an initial password and confirmation', async () => {
    render(<UserManagement />);
    await screen.findByText('Alex User');
    fireEvent.click(screen.getAllByRole('button', { name: 'Create User' })[0]);
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Created User' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'created@example.test' } });
    fireEvent.change(screen.getByLabelText('Initial Password'), { target: { value: 'CreatedPassword123!' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'CreatedPassword123!' } });
    fireEvent.click(screen.getAllByRole('button', { name: 'Create User' })[1]);

    await waitFor(() => expect(mockedApiFetch).toHaveBeenCalledWith('/api/admin/users', expect.objectContaining({ method: 'POST' })));
    const [, request] = mockedApiFetch.mock.calls.find(([path]) => path === '/api/admin/users')!;
    expect(JSON.parse((request as RequestInit).body as string)).toMatchObject({ name: 'Created User', email: 'created@example.test', role: 'REQUESTER', isActive: true, initialPassword: 'CreatedPassword123!' });
    expect(await screen.findByText(/User created/)).toBeInTheDocument();
  });
});
