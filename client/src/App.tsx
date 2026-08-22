import React, { useState } from 'react';
import { RequesterProvider, useRequester } from './context/RequesterContext';
import { Navbar } from './components/Navbar';
import { RequesterSelector } from './components/RequesterSelector';

type ViewMode = 'my-tickets' | 'create-ticket' | 'select-requester';

function MainApp() {
  const { selectedRequester } = useRequester();
  const [currentView, setCurrentView] = useState<ViewMode>('my-tickets');

  // ถ้ายังไม่ได้เลือก Requester ให้แสดงหน้า RequesterSelector เสมอ
  if (!selectedRequester || currentView === 'select-requester') {
    return (
      <div>
        <Navbar
          currentView={currentView}
          onNavigate={(view) => setCurrentView(view)}
        />
        <RequesterSelector onSuccess={() => setCurrentView('my-tickets')} />
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#F5F7F6', minHeight: '100vh' }}>
      <Navbar
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
      />

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
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
                onClick={() => setCurrentView('create-ticket')}
                style={{ backgroundColor: '#006B3C', color: '#FFF', border: 'none', padding: '10px 18px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
              >
                + Create Ticket
              </button>
            </div>

            <div style={{ padding: '32px', backgroundColor: '#EAF6EF', borderRadius: '8px', border: '1px solid #B8E2C8', textAlign: 'center' }}>
              <p style={{ margin: 0, color: '#0B7A46', fontWeight: 600 }}>
                ✅ Requester Context Established: {selectedRequester.name} (ID: {selectedRequester.id})
              </p>
              <p style={{ fontSize: '0.875rem', color: '#374151', marginTop: '8px' }}>
                Feature 6 (Requester Context) is active. The ticket list feature will be implemented in Feature 8!
              </p>
            </div>
          </div>
        )}

        {currentView === 'create-ticket' && (
          <div style={cardStyle}>
            <h1 style={{ fontSize: '1.5rem', color: '#006B3C', marginTop: 0 }}>Create Ticket</h1>
            <p style={{ color: '#4B5563' }}>
              Submitting ticket on behalf of: <strong>{selectedRequester.name}</strong>
            </p>
            <div style={{ padding: '32px', backgroundColor: '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB', textAlign: 'center' }}>
              <p style={{ color: '#6B7280' }}>
                Create Ticket Workflow will be implemented in Feature 7.
              </p>
            </div>
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

export default function App() {
  return (
    <RequesterProvider>
      <MainApp />
    </RequesterProvider>
  );
}
