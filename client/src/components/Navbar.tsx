import React from 'react';
import { useAuth, type UserRole } from '../context/AuthContext';

export type NavigationView = 'my-tickets' | 'create-ticket' | 'ticket-detail' | 'staff-queue' | 'user-management';

type NavigationItem = { view: NavigationView; label: string };

export function navigationForRole(role: UserRole): NavigationItem[] {
  if (role === 'REQUESTER') {
    return [
      { view: 'my-tickets', label: 'My Tickets' },
      { view: 'create-ticket', label: 'Create Ticket' },
    ];
  }
  if (role === 'IT_STAFF') return [{ view: 'staff-queue', label: 'Ticket Queue' }];
  return [{ view: 'user-management', label: 'User Management' }];
}

interface NavbarProps {
  currentView: NavigationView;
  onNavigate: (view: NavigationView) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const { user, logout } = useAuth();
  const navigationItems = user ? navigationForRole(user.role) : [];

  return (
    <header style={styles.header}>
      <div style={styles.container}>
        <button type="button" style={styles.brand} onClick={() => onNavigate(navigationItems[0]?.view ?? 'my-tickets')}>TokTickIT</button>
        <nav style={styles.navLinks} aria-label="Main navigation">
          {navigationItems.map((item) => (
            <button key={item.view} type="button" onClick={() => onNavigate(item.view)} style={{ ...styles.navBtn, ...(currentView === item.view || (item.view === 'my-tickets' && currentView === 'ticket-detail') ? styles.activeNavBtn : {}) }}>
              {item.label}
            </button>
          ))}
        </nav>
        {user && (
          <div style={styles.userBadge}>
            <span style={styles.avatar}>{user.name.charAt(0).toUpperCase()}</span>
            <span style={styles.userInfo}><strong>{user.name}</strong><small>{user.role.replace('_', ' ')}</small></span>
            <button type="button" onClick={() => void logout()} style={styles.signOut}>Sign out</button>
          </div>
        )}
      </div>
    </header>
  );
};

const styles: Record<string, React.CSSProperties> = {
  header: { backgroundColor: '#006B3C', color: '#FFF', padding: '0 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' },
  container: { maxWidth: '1200px', minHeight: '64px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' },
  brand: { border: 0, background: 'transparent', color: '#FFF', fontSize: '1.2rem', fontWeight: 700, cursor: 'pointer' },
  navLinks: { display: 'flex', gap: '6px' },
  navBtn: { border: 0, background: 'transparent', color: 'rgba(255,255,255,.85)', padding: '8px 14px', borderRadius: '6px', fontSize: '.875rem', fontWeight: 600, cursor: 'pointer' },
  activeNavBtn: { backgroundColor: '#0B7A46', color: '#FFF' },
  userBadge: { display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 8px 4px 6px', borderRadius: '20px', backgroundColor: 'rgba(255,255,255,.12)' },
  avatar: { display: 'grid', placeItems: 'center', width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#EAF6EF', color: '#006B3C', fontWeight: 700 },
  userInfo: { display: 'grid', fontSize: '.8rem', lineHeight: 1.15 },
  signOut: { border: 0, borderRadius: '12px', padding: '4px 8px', backgroundColor: 'rgba(255,255,255,.2)', color: '#FFF', fontSize: '.75rem', fontWeight: 600, cursor: 'pointer' },
};
