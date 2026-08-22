import React from 'react';
import { useRequester } from '../context/RequesterContext';

interface NavbarProps {
  currentView: 'my-tickets' | 'create-ticket' | 'select-requester';
  onNavigate: (view: 'my-tickets' | 'create-ticket' | 'select-requester') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const { selectedRequester } = useRequester();

  return (
    <header style={styles.header}>
      <div style={styles.navContainer}>
        {/* Brand Identity */}
        <div style={styles.brand} onClick={() => onNavigate('my-tickets')}>
          <div style={styles.logoIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <span style={styles.brandName}>TokTickIT</span>
        </div>

        {/* Navigation Links */}
        {selectedRequester && (
          <nav style={styles.navLinks}>
            <button
              onClick={() => onNavigate('my-tickets')}
              style={{
                ...styles.navBtn,
                ...(currentView === 'my-tickets' ? styles.activeNavBtn : {}),
              }}
            >
              📄 My Tickets
            </button>
            <button
              onClick={() => onNavigate('create-ticket')}
              style={{
                ...styles.navBtn,
                ...(currentView === 'create-ticket' ? styles.activeNavBtn : {}),
              }}
            >
              ➕ Create Ticket
            </button>
          </nav>
        )}

        {/* User Identity / Change Requester */}
        <div style={styles.userSection}>
          {selectedRequester ? (
            <div style={styles.userBadge}>
              <div style={styles.avatar}>
                {selectedRequester.name.charAt(0).toUpperCase()}
              </div>
              <div style={styles.userInfo}>
                <span style={styles.userName}>{selectedRequester.name}</span>
                <span style={styles.userTag}>Requester</span>
              </div>
              <button
                onClick={() => onNavigate('select-requester')}
                style={styles.changeBtn}
                title="Switch Development Requester context"
              >
                🔄 Switch
              </button>
            </div>
          ) : (
            <button
              onClick={() => onNavigate('select-requester')}
              style={styles.selectUserBtn}
            >
              👤 Select Requester
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  header: {
    backgroundColor: '#006B3C', // Primary Green
    color: '#FFFFFF',
    padding: '0 24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  },
  navContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
  },
  logoIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    fontSize: '1.25rem',
    fontWeight: 700,
    letterSpacing: '-0.02em',
  },
  navLinks: {
    display: 'flex',
    gap: '8px',
  },
  navBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.85)',
    padding: '8px 16px',
    borderRadius: '6px',
    fontSize: '0.9rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  activeNavBtn: {
    backgroundColor: '#0B7A46', // Secondary Green for active tab
    color: '#FFFFFF',
    fontWeight: 600,
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
  },
  userBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    padding: '4px 12px 4px 6px',
    borderRadius: '20px',
  },
  avatar: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: '#EAF6EF',
    color: '#006B3C',
    fontWeight: 700,
    fontSize: '0.85rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  userName: {
    fontSize: '0.85rem',
    fontWeight: 600,
    lineHeight: 1.2,
  },
  userTag: {
    fontSize: '0.7rem',
    color: 'rgba(255, 255, 255, 0.75)',
  },
  changeBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    border: 'none',
    color: '#FFFFFF',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: 600,
    cursor: 'pointer',
    marginLeft: '6px',
  },
  selectUserBtn: {
    backgroundColor: '#EAF6EF',
    color: '#006B3C',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    fontWeight: 600,
    cursor: 'pointer',
  },
};
