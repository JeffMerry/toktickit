import React, { useState, useEffect, useCallback } from 'react';
import { RequesterProvider, useRequester } from './context/RequesterContext';
import { Navbar } from './components/Navbar';
import { RequesterSelector } from './components/RequesterSelector';
import { CreateTicketForm } from './components/CreateTicketForm';
import { MyTicketsList, TicketItem, PaginationMeta } from './components/MyTicketsList';
import { TicketDetailView, TicketDetailData } from './components/TicketDetailView';
import { AttachmentSection } from './components/AttachmentSection';

type ViewMode = 'my-tickets' | 'create-ticket' | 'select-requester' | 'ticket-detail';

function MainApp() {
  const { selectedRequester } = useRequester();
  const [currentView, setCurrentView] = useState<ViewMode>('my-tickets');
  const [createdTicketNumber, setCreatedTicketNumber] = useState<string | null>(null);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);

  // Ticket Detail States
  const [ticketDetail, setTicketDetail] = useState<TicketDetailData | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
  const [detailError, setDetailError] = useState<{ status?: number; message: string } | null>(null);

  // My Tickets Data & Filter States
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  const [search, setSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState<number>(1);

  const [loadingTickets, setLoadingTickets] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Fetch Categories for Filter Dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/categories');
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (err) {
        console.error('Failed to load categories for filters:', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch Owned Tickets for Active Requester (Ownership Isolation)
  const fetchTickets = useCallback(async () => {
    if (!selectedRequester) return;

    setLoadingTickets(true);
    setFetchError(null);

    try {
      const params = new URLSearchParams();
      params.append('requesterId', String(selectedRequester.id));
      if (search.trim()) params.append('search', search.trim());
      if (selectedCategory) params.append('categoryId', selectedCategory);
      if (selectedPriority) params.append('priority', selectedPriority);
      if (selectedStatus) params.append('status', selectedStatus);
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);
      params.append('page', String(page));
      params.append('limit', '10');

      const res = await fetch(`http://localhost:5000/api/tickets?${params.toString()}`);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || `Server responded with ${res.status}`);
      }

      const result = await res.json();
      setTickets(result.data || []);
      setPagination(result.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 });
    } catch (err: any) {
      console.error('Error fetching tickets:', err);
      setFetchError(err.message || 'Failed to load tickets. Please check backend connection.');
    } finally {
      setLoadingTickets(false);
    }
  }, [selectedRequester, search, selectedCategory, selectedPriority, selectedStatus, sortBy, sortOrder, page]);

  // Fetch Ticket Detail with Ownership Validation (BR-13)
  const fetchTicketDetail = useCallback(async (id: number) => {
    if (!selectedRequester) return;

    setLoadingDetail(true);
    setDetailError(null);

    try {
      const res = await fetch(`http://localhost:5000/api/tickets/${id}?requesterId=${selectedRequester.id}`);
      const data = await res.json();

      if (!res.ok) {
        setDetailError({
          status: res.status,
          message: data.error || 'Failed to load ticket details',
        });
        setTicketDetail(null);
        return;
      }

      setTicketDetail(data);
    } catch (err: any) {
      console.error('Error fetching ticket detail:', err);
      setDetailError({
        status: 500,
        message: err.message || 'Network error occurred while fetching ticket detail',
      });
      setTicketDetail(null);
    } finally {
      setLoadingDetail(false);
    }
  }, [selectedRequester]);

  // Trigger ticket list fetch when parameters or selectedRequester changes
  useEffect(() => {
    if (selectedRequester && currentView === 'my-tickets') {
      fetchTickets();
    }
  }, [selectedRequester, currentView, fetchTickets]);

  // Trigger ticket detail fetch when selectedTicketId or currentView changes
  useEffect(() => {
    if (selectedRequester && currentView === 'ticket-detail' && selectedTicketId) {
      fetchTicketDetail(selectedTicketId);
    }
  }, [selectedRequester, currentView, selectedTicketId, fetchTicketDetail]);

  const handleSelectTicket = (ticketId: number) => {
    setSelectedTicketId(ticketId);
    setCurrentView('ticket-detail');
  };

  // Reset filters to defaults
  const handleClearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedPriority('');
    setSelectedStatus('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setPage(1);
  };

  const handleSortChange = (field: string) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPage(1);
  };

  // If no Requester selected, render RequesterSelector
  if (!selectedRequester || currentView === 'select-requester') {
    return (
      <div>
        <Navbar
          currentView={currentView}
          onNavigate={(view) => {
            setCreatedTicketNumber(null);
            setSelectedTicketId(null);
            setCurrentView(view);
          }}
        />
        <RequesterSelector
          onSuccess={() => {
            setPage(1);
            setCurrentView('my-tickets');
          }}
        />
      </div>
    );
  }

  const hasActiveFilters = Boolean(search || selectedCategory || selectedPriority || selectedStatus);

  return (
    <div style={{ backgroundColor: '#F5F7F6', minHeight: '100vh' }}>
      <Navbar
        currentView={currentView}
        onNavigate={(view) => {
          setCreatedTicketNumber(null);
          setSelectedTicketId(null);
          setCurrentView(view);
        }}
      />

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px' }}>
        {/* 1. My Tickets Screen */}
        {currentView === 'my-tickets' && (
          <div>
            <div style={headerStyle}>
              <div>
                <h1 style={{ fontSize: '1.65rem', color: '#006B3C', margin: 0, fontWeight: 700 }}>
                  My Tickets
                </h1>
                <p style={{ color: '#4B5563', margin: '4px 0 0 0', fontSize: '0.875rem' }}>
                  View and track all IT support tickets submitted by <strong>{selectedRequester.name}</strong>.
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

            {loadingTickets ? (
              <div style={loadingStateStyle}>
                <div style={spinnerStyle}></div>
                <p style={{ color: '#0B7A46', fontWeight: 600, margin: 0 }}>Loading your tickets...</p>
              </div>
            ) : fetchError ? (
              <div style={errorStateStyle}>
                <p style={{ margin: '0 0 12px 0', fontWeight: 600 }}>⚠️ {fetchError}</p>
                <button onClick={fetchTickets} style={primaryBtnStyle}>
                  Retry Loading
                </button>
              </div>
            ) : tickets.length === 0 ? (
              <div style={emptyStateStyle}>
                <div style={emptyIconCircle}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#006B3C" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                  </svg>
                </div>
                {hasActiveFilters ? (
                  <div>
                    <h3 style={{ margin: '0 0 8px 0', color: '#1F2937' }}>No tickets match your search criteria</h3>
                    <p style={{ color: '#6B7280', fontSize: '0.9rem', marginBottom: '16px' }}>
                      Try adjusting your search keywords, category, priority, or status filters.
                    </p>
                    <button onClick={handleClearFilters} style={secondaryBtnStyle}>
                      ↺ Clear All Filters
                    </button>
                  </div>
                ) : (
                  <div>
                    <h3 style={{ margin: '0 0 8px 0', color: '#1F2937' }}>No tickets submitted yet</h3>
                    <p style={{ color: '#6B7280', fontSize: '0.9rem', marginBottom: '20px' }}>
                      You haven't created any IT support tickets under this account.
                    </p>
                    <button
                      onClick={() => {
                        setCreatedTicketNumber(null);
                        setCurrentView('create-ticket');
                      }}
                      style={primaryBtnStyle}
                    >
                      + Create Your First Ticket
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <MyTicketsList
                tickets={tickets}
                pagination={pagination}
                categories={categories}
                search={search}
                selectedCategory={selectedCategory}
                selectedPriority={selectedPriority}
                selectedStatus={selectedStatus}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSearchChange={(val) => {
                  setSearch(val);
                  setPage(1);
                }}
                onCategoryChange={(val) => {
                  setSelectedCategory(val);
                  setPage(1);
                }}
                onPriorityChange={(val) => {
                  setSelectedPriority(val);
                  setPage(1);
                }}
                onStatusChange={(val) => {
                  setSelectedStatus(val);
                  setPage(1);
                }}
                onSortChange={handleSortChange}
                onPageChange={(p) => setPage(p)}
                onClearFilters={handleClearFilters}
                onSelectTicket={handleSelectTicket}
              />
            )}
          </div>
        )}

        {/* 2. Create Ticket Screen */}
        {currentView === 'create-ticket' && (
          <div>
            {createdTicketNumber ? (
              <div style={{ ...cardStyle, textAlign: 'center', padding: '40px' }}>
                <div style={successIconCircle}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#006B3C" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <h2 style={{ fontSize: '1.75rem', color: '#006B3C', margin: '0 0 8px 0' }}>Ticket Submitted Successfully!</h2>
                <p style={{ color: '#4B5563', fontSize: '0.95rem', marginBottom: '20px' }}>
                  Your IT support request has been registered in the system.
                </p>

                <div style={ticketNumberCard}>
                  <div style={{ fontSize: '0.8rem', color: '#0B7A46', fontWeight: 600, textTransform: 'uppercase' }}>
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
                    onClick={() => {
                      setCreatedTicketNumber(null);
                      setCurrentView('create-ticket');
                    }}
                    style={secondaryBtnStyle}
                  >
                    ➕ Create Another Ticket
                  </button>
                </div>
              </div>
            ) : (
              <CreateTicketForm
                onSuccess={(ticketNum) => {
                  setCreatedTicketNumber(ticketNum);
                  fetchTickets();
                }}
                onCancel={() => setCurrentView('my-tickets')}
              />
            )}
          </div>
        )}

        {/* 3. Ticket Detail Screen with Attachment Section */}
        {currentView === 'ticket-detail' && (
          <div>
            {loadingDetail ? (
              <div style={loadingStateStyle}>
                <div style={spinnerStyle}></div>
                <p style={{ color: '#0B7A46', fontWeight: 600, margin: 0 }}>Loading ticket details...</p>
              </div>
            ) : detailError ? (
              /* Access Denied (403 Forbidden) or Error View (BR-13 Validation) */
              <div style={detailError.status === 403 ? accessDeniedCardStyle : errorStateStyle}>
                <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>
                  {detailError.status === 403 ? '🛡️' : '⚠️'}
                </div>
                <h2 style={{ margin: '0 0 8px 0', fontSize: '1.4rem' }}>
                  {detailError.status === 403 ? 'Access Denied (403 Forbidden)' : 'Error Loading Ticket'}
                </h2>
                <p style={{ margin: '0 0 20px 0', fontSize: '0.95rem' }}>{detailError.message}</p>
                <button onClick={() => setCurrentView('my-tickets')} style={primaryBtnStyle}>
                  ← Return to My Tickets
                </button>
              </div>
            ) : ticketDetail ? (
              <TicketDetailView
                ticket={ticketDetail}
                onBack={() => setCurrentView('my-tickets')}
              >
                <AttachmentSection
                  ticketId={ticketDetail.id}
                  attachments={ticketDetail.attachments || []}
                  onAttachmentChanged={() => {
                    if (selectedTicketId) fetchTicketDetail(selectedTicketId);
                  }}
                />
              </TicketDetailView>
            ) : null}
          </div>
        )}
      </main>
    </div>
  );
}

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '20px',
  flexWrap: 'wrap',
  gap: '12px',
};

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

const loadingStateStyle: React.CSSProperties = {
  padding: '60px',
  textAlign: 'center',
  backgroundColor: '#FFFFFF',
  borderRadius: '12px',
  border: '1px solid #E5E7EB',
};

const spinnerStyle: React.CSSProperties = {
  width: '36px',
  height: '36px',
  border: '3px solid #EAF6EF',
  borderTop: '3px solid #006B3C',
  borderRadius: '50%',
  margin: '0 auto 16px auto',
};

const errorStateStyle: React.CSSProperties = {
  padding: '40px 24px',
  textAlign: 'center',
  backgroundColor: '#FEE2E2',
  color: '#991B1B',
  borderRadius: '12px',
  border: '1px solid #FCA5A5',
};

const accessDeniedCardStyle: React.CSSProperties = {
  padding: '48px 24px',
  textAlign: 'center',
  backgroundColor: '#FEF2F2',
  color: '#991B1B',
  borderRadius: '12px',
  border: '2px solid #FCA5A5',
  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.08)',
};

const emptyStateStyle: React.CSSProperties = {
  padding: '60px 24px',
  textAlign: 'center',
  backgroundColor: '#FFFFFF',
  borderRadius: '12px',
  border: '1px solid #E5E7EB',
  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
};

const emptyIconCircle: React.CSSProperties = {
  width: '64px',
  height: '64px',
  borderRadius: '50%',
  backgroundColor: '#EAF6EF',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 16px auto',
};

export default function App() {
  return (
    <RequesterProvider>
      <MainApp />
    </RequesterProvider>
  );
}
