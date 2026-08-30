import React from 'react';
import { useRequester } from '../context/RequesterContext';

interface NavbarProps {
  currentView: 'my-tickets' | 'create-ticket' | 'select-requester' | 'ticket-detail';
  onNavigate: (view: 'my-tickets' | 'create-ticket' | 'select-requester') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const { selectedRequester } = useRequester();

  return (
    <header style={styles.header}>
      <style>{`
        .navbar-responsive-container {
          max-width: 1200px;
          margin: 0 auto;
          min-height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 0;
          gap: 12px;
        }

        @media (max-width: 768px) {
          .navbar-responsive-container {
            flex-wrap: wrap;
            padding: 10px 0;
          }
          .nav-links-group {
            order: 3;
            width: 100%;
            justify-content: center;
            border-top: 1px solid rgba(255, 255, 255, 0.15);
            padding-top: 8px;
            margin-top: 4px;
          }
          .user-name-text {
            max-width: 80px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
      `}</style>

      <div className="navbar-responsive-container">
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
          <nav className="nav-links-group" style={styles.navLinks}>
            <button
              onClick={() => onNavigate('my-tickets')}
              style={{
                ...styles.navBtn,
                ...(currentView === 'my-tickets' || currentView === 'ticket-detail' ? styles.activeNavBtn : {}),
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
                <span className="user-name-text" style={styles.userName}>
                  {selectedRequester.name}
                </span>
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
    padding: '0 16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
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
    fontSize: '1.2rem',
    fontWeight: 700,
    letterSpacing: '-0.02em',
  },
  navLinks: {
    display: 'flex',
    gap: '6px',
  },
  navBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.85)',
    padding: '8px 14px',
    borderRadius: '6px',
    fontSize: '0.875rem',
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
    gap: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    padding: '4px 10px 4px 6px',
    borderRadius: '20px',
  },
  avatar: {
    width: '26px',
    height: '26px',
    borderRadius: '50%',
    backgroundColor: '#EAF6EF',
    color: '#006B3C',
    fontWeight: 700,
    fontSize: '0.8rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  userName: {
    fontSize: '0.8rem',
    fontWeight: 600,
    lineHeight: 1.2,
  },
  userTag: {
    fontSize: '0.675rem',
    color: 'rgba(255, 255, 255, 0.75)',
  },
  changeBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    border: 'none',
    color: '#FFFFFF',
    padding: '3px 8px',
    borderRadius: '12px',
    fontSize: '0.725rem',
    fontWeight: 600,
    cursor: 'pointer',
    marginLeft: '4px',
  },
  selectUserBtn: {
    backgroundColor: '#EAF6EF',
    color: '#006B3C',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '6px',
    fontWeight: 600,
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
};
