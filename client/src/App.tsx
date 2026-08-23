import React, { useState } from 'react';
import { RequesterProvider, useRequester } from './context/RequesterContext';
import { Navbar } from './components/Navbar';
import { RequesterSelector } from './components/RequesterSelector';
import { CreateTicketForm } from './components/CreateTicketForm';

type ViewMode = 'my-tickets' | 'create-ticket' | 'select-requester';

function MainApp() {
  const { selectedRequester } = useRequester();
  const [currentView, setCurrentView] = useState<ViewMode>('my-tickets');
  const [createdTicketNumber, setCreatedTicketNumber] = useState<string | null>(null);

  // ถ้ายังไม่ได้เลือก Requester ให้แสดงหน้า RequesterSelector เสมอ
  if (!selectedRequester || currentView === 'select-requester') {
    return (
      <div>
        <Navbar
          currentView={currentView}
          onNavigate={(view) => {
            setCreatedTicketNumber(null);
            setCurrentView(view);
          }}
        />
        <RequesterSelector onSuccess={() => setCurrentView('my-tickets')} />
      </div>
    );
  }

  const handleTicketCreateSuccess = (ticketNumber: string) => {
    setCreatedTicketNumber(ticketNumber);
  };

  const handleResetCreateForm = () => {
    setCreatedTicketNumber(null);
    setCurrentView('create-ticket');
  };

  return (
    <div style={{ backgroundColor: '#F5F7F6', minHeight: '100vh' }}>
      <Navbar
        currentView={currentView}
        onNavigate={(view) => {
          setCreatedTicketNumber(null);
          setCurrentView(view);
        }}
      />

      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px' }}>
        {currentView === 'my-tickets' && (
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h1 style={{ fontSize: '1.5rem', color: '#006B3C', margin: 0 }}>My Tickets</h1>
                <p style={{ color: '#4B5563', margin: '4px 0 0 0', fontSize: '0.875rem' }}>
                  Logged in as: <strong>{selectedRequester.name}</strong> ({selectedRequester.email})
                </p>
              </div>
              <button
                onClick={() => {
                  setCreatedTicketNumber(null);
                  setCurrentView('create-ticket');
                }}
                style={primaryBtnStyle}
              >
                + Create Ticket
              </button>
            </div>

            {createdTicketNumber && (
              <div style={successAlertStyle}>
                <span style={{ fontSize: '1.25rem' }}>🎉</span>
                <div>
                  <strong>Ticket Created Successfully!</strong> Official Ticket Number:{' '}
                  <span style={badgeStyle}>{createdTicketNumber}</span>
                </div>
              </div>
            )}

            <div style={{ padding: '32px', backgroundColor: '#EAF6EF', borderRadius: '8px', border: '1px solid #B8E2C8', textAlign: 'center' }}>
              <p style={{ margin: 0, color: '#0B7A46', fontWeight: 600 }}>
                ✅ Requester Context Established: {selectedRequester.name} (ID: {selectedRequester.id})
              </p>
              <p style={{ fontSize: '0.875rem', color: '#374151', marginTop: '8px' }}>
                Create Ticket Workflow (Feature 7) is active. The ticket list feature will be implemented in Feature 8!
              </p>
            </div>
          </div>
        )}

        {currentView === 'create-ticket' && (
          <div>
            {createdTicketNumber ? (
              <div style={{ ...cardStyle, textAlign: 'center', padding: '40px' }}>
                <div style={successIconCircle}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#006B3C" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <h2 style={{ fontSize: '1.75rem', color: '#006B3C', margin: '0 0 8px 0' }}>Ticket Submitted Successfully!</h2>
                <p style={{ color: '#4B5563', fontSize: '0.95rem', marginBottom: '20px' }}>
                  Your IT support request has been registered in the system.
                </p>

                <div style={ticketNumberCard}>
                  <div style={{ fontSize: '0.8rem', color: '#0B7A46', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Official Ticket Number
                  </div>
                  <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#006B3C', fontFamily: 'monospace', margin: '4px 0' }}>
                    {createdTicketNumber}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                    Current Status: <strong style={{ color: '#0B7A46' }}>New</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '28px' }}>
                  <button
                    onClick={() => setCurrentView('my-tickets')}
                    style={primaryBtnStyle}
                  >
                    📄 View My Tickets
                  </button>
                  <button
                    onClick={handleResetCreateForm}
                    style={secondaryBtnStyle}
                  >
                    ➕ Create Another Ticket
                  </button>
                </div>
              </div>
            ) : (
              <CreateTicketForm
                onSuccess={handleTicketCreateSuccess}
                onCancel={() => setCurrentView('my-tickets')}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  backgroundColor: '#FFFFFF',
  borderRadius: '12px',
  padding: '24px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  border: '1px solid #E5E7EB',
};

const primaryBtnStyle: React.CSSProperties = {
  backgroundColor: '#006B3C',
  color: '#FFF',
  border: 'none',
  padding: '10px 20px',
  borderRadius: '8px',
  fontWeight: 600,
  fontSize: '0.9rem',
  cursor: 'pointer',
};

const secondaryBtnStyle: React.CSSProperties = {
  backgroundColor: '#FFFFFF',
  color: '#374151',
  border: '1px solid #D1D5DB',
  padding: '10px 20px',
  borderRadius: '8px',
  fontWeight: 600,
  fontSize: '0.9rem',
  cursor: 'pointer',
};

const successAlertStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  backgroundColor: '#EAF6EF',
  border: '1px solid #B8E2C8',
  borderRadius: '8px',
  padding: '12px 16px',
  color: '#006B3C',
  marginBottom: '20px',
};

const badgeStyle: React.CSSProperties = {
  backgroundColor: '#006B3C',
  color: '#FFFFFF',
  padding: '2px 8px',
  borderRadius: '4px',
  fontFamily: 'monospace',
  fontWeight: 700,
};

const successIconCircle: React.CSSProperties = {
  width: '64px',
  height: '64px',
  borderRadius: '50%',
  backgroundColor: '#EAF6EF',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 16px auto',
};

const ticketNumberCard: React.CSSProperties = {
  backgroundColor: '#EAF6EF',
  border: '1px solid #B8E2C8',
  borderRadius: '10px',
  padding: '16px 24px',
  display: 'inline-block',
  minWidth: '280px',
};

export default function App() {
  return (
    <RequesterProvider>
      <MainApp />
    </RequesterProvider>
  );
}
