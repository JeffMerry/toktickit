import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Navbar } from './Navbar';
import { useAuth } from '../context/AuthContext';

vi.mock('../context/AuthContext', () => ({ useAuth: vi.fn() }));

const mockedUseAuth = vi.mocked(useAuth);

function renderNavbar(role: 'REQUESTER' | 'IT_STAFF' | 'ADMINISTRATOR') {
  mockedUseAuth.mockReturnValue({
    user: { id: 1, name: 'Test User', email: 'test@example.test', role, mustChangePassword: false },
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
    changePassword: vi.fn(),
  });
  render(<Navbar currentView="my-tickets" onNavigate={vi.fn()} />);
}

describe('Navbar role navigation', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows requester ticket actions only to requesters', () => {
    renderNavbar('REQUESTER');
    expect(screen.getByRole('button', { name: 'My Tickets' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Ticket' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Ticket Queue' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'User Management' })).not.toBeInTheDocument();
  });

  it('shows the ticket queue only to IT staff', () => {
    renderNavbar('IT_STAFF');
    expect(screen.getByRole('button', { name: 'Ticket Queue' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'My Tickets' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Create Ticket' })).not.toBeInTheDocument();
  });

  it('shows user management only to administrators', () => {
    renderNavbar('ADMINISTRATOR');
    expect(screen.getByRole('button', { name: 'User Management' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'My Tickets' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Create Ticket' })).not.toBeInTheDocument();
  });
});
