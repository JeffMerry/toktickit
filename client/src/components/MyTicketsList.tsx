import React from 'react';

export interface TicketAttachment {
  id: number;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export interface TicketItem {
  id: number;
  ticketNumber: string;
  summary: string;
  description: string;
  requestedPriority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' | string;
  currentStatus: 'New' | 'In Progress' | 'Resolved' | 'Closed' | string;
  createdAt: string;
  updatedAt?: string;
  category: { id: number; name: string };
  relatedSystem: { id: number; name: string };
  attachments?: TicketAttachment[];
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface MyTicketsListProps {
  tickets: TicketItem[];
  pagination: PaginationMeta;
  categories: { id: number; name: string }[];
  search: string;
  selectedCategory: string;
  selectedPriority: string;
  selectedStatus: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onSortChange: (field: string) => void;
  onPageChange: (page: number) => void;
  onClearFilters: () => void;
  onSelectTicket?: (ticketId: number) => void;
}

export const MyTicketsList: React.FC<MyTicketsListProps> = ({
  tickets,
  pagination,
  categories,
  search,
  selectedCategory,
  selectedPriority,
  selectedStatus,
  sortBy,
  sortOrder,
  onSearchChange,
  onCategoryChange,
  onPriorityChange,
  onStatusChange,
  onSortChange,
  onPageChange,
  onClearFilters,
  onSelectTicket,
}) => {
  // Helper for formatting date
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  // Helper for Priority Badges
  const getPriorityBadge = (priority: string) => {
    const p = priority.toUpperCase();
    let bg = '#F3F4F6';
    let color = '#374151';

    if (p === 'LOW') {
      bg = '#F3F4F6';
      color = '#4B5563';
    } else if (p === 'MEDIUM') {
      bg = '#FEF3C7';
      color = '#92400E';
    } else if (p === 'HIGH') {
      bg = '#FFEDD5';
      color = '#C2410C';
    } else if (p === 'URGENT') {
      bg = '#FEE2E2';
      color = '#991B1B';
    }

    return (
      <span
        style={{
          backgroundColor: bg,
          color,
          padding: '4px 10px',
          borderRadius: '12px',
          fontSize: '0.75rem',
          fontWeight: 700,
          display: 'inline-block',
        }}
      >
        {p}
      </span>
    );
  };

  // Helper for Status Badges
  const getStatusBadge = (status: string) => {
    let bg = '#EAF6EF';
    let color = '#006B3C';

    if (status === 'New') {
      bg = '#EAF6EF';
      color = '#006B3C';
    } else if (status === 'In Progress') {
      bg = '#E0F2FE';
      color = '#0369A1';
    } else if (status === 'Resolved') {
      bg = '#F3E8FF';
      color = '#6B21A8';
    } else if (status === 'Closed') {
      bg = '#F3F4F6';
      color = '#4B5563';
    }

    return (
      <span
        style={{
          backgroundColor: bg,
          color,
          padding: '4px 10px',
          borderRadius: '12px',
          fontSize: '0.75rem',
          fontWeight: 700,
          display: 'inline-block',
        }}
      >
        {status}
      </span>
    );
  };

  const hasActiveFilters = Boolean(search || selectedCategory || selectedPriority || selectedStatus);

  const startRecord = (pagination.page - 1) * pagination.limit + 1;
  const endRecord = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <div style={styles.outerContainer}>
      {/* Dynamic CSS Media Queries for Responsive Display */}
      <style>{`
        .desktop-tickets-container {
          display: block;
        }
        .mobile-tickets-container {
          display: none;
        }
        .filter-bar-box {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .filter-select-element {
          flex: 1;
          min-width: 120px;
        }

        @media (max-width: 768px) {
          .desktop-tickets-container {
            display: none !important;
          }
          .mobile-tickets-container {
            display: flex !important;
            flex-direction: column;
            gap: 12px;
          }
          .filter-bar-box {
            flex-direction: column;
            align-items: stretch;
          }
          .search-box-container {
            min-width: 100% !important;
          }
          .filters-group-container {
            width: 100%;
            justify-content: space-between;
          }
          .pagination-bar-container {
            flex-direction: column;
            gap: 12px;
            text-align: center;
          }
        }
      `}</style>

      {/* 1. Filter Bar Controls */}
      <div className="filter-bar-box" style={styles.filterBar}>
        {/* Search Bar Input */}
        <div className="search-box-container" style={styles.searchBox}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Search by ticket number or summary..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        {/* Filters Group */}
        <div className="filters-group-container" style={styles.filtersGroup}>
          {/* Category Filter */}
          <select
            className="filter-select-element"
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            className="filter-select-element"
            value={selectedPriority}
            onChange={(e) => onPriorityChange(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="">All Priorities</option>
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
            <option value="URGENT">URGENT</option>
          </select>

          {/* Status Filter */}
          <select
            className="filter-select-element"
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="">All Statuses</option>
            <option value="New">New</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button onClick={onClearFilters} style={styles.clearBtn} title="Reset all filters">
              ↺ Clear
            </button>
          )}
        </div>
      </div>

      {/* 2. Desktop Table Data Grid (Displays on ≥ 768px) */}
      <div className="desktop-tickets-container" style={styles.desktopContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.theadRow}>
              <th style={styles.thSortable} onClick={() => onSortChange('ticketNumber')}>
                Ticket No. {sortBy === 'ticketNumber' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th style={styles.thSortable} onClick={() => onSortChange('createdAt')}>
                Created Date {sortBy === 'createdAt' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th style={styles.th}>Summary</th>
              <th style={styles.th}>Category</th>
              <th style={styles.th}>System</th>
              <th style={styles.thSortable} onClick={() => onSortChange('requestedPriority')}>
                Priority {sortBy === 'requestedPriority' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th style={styles.thSortable} onClick={() => onSortChange('currentStatus')}>
                Status {sortBy === 'currentStatus' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
              </th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr
                key={ticket.id}
                style={styles.tr}
                onClick={() => onSelectTicket && onSelectTicket(ticket.id)}
              >
                <td style={{ ...styles.td, fontWeight: 700, color: '#006B3C', fontFamily: 'monospace' }}>
                  {ticket.ticketNumber}
                </td>
                <td style={{ ...styles.td, color: '#6B7280', fontSize: '0.85rem' }}>
                  {formatDate(ticket.createdAt)}
                </td>
                <td style={{ ...styles.td, fontWeight: 600, color: '#1F2937' }}>
                  {ticket.summary}
                  {ticket.attachments && ticket.attachments.length > 0 && (
                    <span style={{ marginLeft: '6px', fontSize: '0.8rem', color: '#6B7280' }}>
                      📎 ({ticket.attachments.length})
                    </span>
                  )}
                </td>
                <td style={styles.td}>{ticket.category.name}</td>
                <td style={{ ...styles.td, color: '#4B5563' }}>{ticket.relatedSystem.name}</td>
                <td style={styles.td}>{getPriorityBadge(ticket.requestedPriority)}</td>
                <td style={styles.td}>{getStatusBadge(ticket.currentStatus)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 3. Mobile Card View (Displays on < 768px) */}
      <div className="mobile-tickets-container">
        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            style={styles.card}
            onClick={() => onSelectTicket && onSelectTicket(ticket.id)}
          >
            <div style={styles.cardHeader}>
              <span style={{ fontWeight: 700, color: '#006B3C', fontFamily: 'monospace', fontSize: '0.95rem' }}>
                {ticket.ticketNumber}
              </span>
              <div>{getStatusBadge(ticket.currentStatus)}</div>
            </div>

            <h3 style={styles.cardSummary}>{ticket.summary}</h3>

            <div style={styles.cardMetaRow}>
              <span>📁 {ticket.category.name}</span>
              <span>💻 {ticket.relatedSystem.name}</span>
            </div>

            <div style={styles.cardFooter}>
              <span>🕒 {formatDate(ticket.createdAt)}</span>
              <div>{getPriorityBadge(ticket.requestedPriority)}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 4. Pagination Controls Bar */}
      {pagination.total > 0 && (
        <div className="pagination-bar-container" style={styles.paginationBar}>
          <div style={{ fontSize: '0.85rem', color: '#4B5563' }}>
            Showing <strong>{startRecord}</strong> to <strong>{endRecord}</strong> of{' '}
            <strong>{pagination.total}</strong> tickets
          </div>

          <div style={styles.paginationButtons}>
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              style={{
                ...styles.pageBtn,
                ...(pagination.page <= 1 ? styles.pageBtnDisabled : {}),
              }}
            >
              ‹ Previous
            </button>

            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                style={{
                  ...styles.pageNumBtn,
                  ...(pagination.page === p ? styles.activePageNumBtn : {}),
                }}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              style={{
                ...styles.pageBtn,
                ...(pagination.page >= pagination.totalPages ? styles.pageBtnDisabled : {}),
              }}
            >
              Next ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  outerContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  filterBar: {
    backgroundColor: '#FFFFFF',
    padding: '16px',
    borderRadius: '10px',
    border: '1px solid #E5E7EB',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    padding: '6px 12px',
    minWidth: '240px',
  },
  searchIcon: {
    marginRight: '8px',
    fontSize: '0.9rem',
    color: '#6B7280',
  },
  searchInput: {
    border: 'none',
    backgroundColor: 'transparent',
    outline: 'none',
    width: '100%',
    fontSize: '0.9rem',
    color: '#1F2937',
  },
  filtersGroup: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  filterSelect: {
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #D1D5DB',
    backgroundColor: '#FFFFFF',
    fontSize: '0.85rem',
    color: '#374151',
    outline: 'none',
    cursor: 'pointer',
  },
  clearBtn: {
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #D1D5DB',
    backgroundColor: '#F3F4F6',
    color: '#374151',
    fontWeight: 600,
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
  desktopContainer: {
    overflowX: 'auto',
    borderRadius: '10px',
    border: '1px solid #E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '0.9rem',
  },
  theadRow: {
    backgroundColor: '#F9FAFB',
    borderBottom: '2px solid #E5E7EB',
  },
  th: {
    padding: '14px 16px',
    fontWeight: 600,
    color: '#374151',
    whiteSpace: 'nowrap',
  },
  thSortable: {
    padding: '14px 16px',
    fontWeight: 600,
    color: '#374151',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    userSelect: 'none',
  },
  tr: {
    borderBottom: '1px solid #E5E7EB',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
  },
  td: {
    padding: '14px 16px',
    verticalAlign: 'middle',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '10px',
    padding: '16px',
    border: '1px solid #E5E7EB',
    boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
    cursor: 'pointer',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  cardSummary: {
    fontSize: '0.95rem',
    fontWeight: 700,
    color: '#1F2937',
    margin: '0 0 10px 0',
  },
  cardMetaRow: {
    display: 'flex',
    gap: '12px',
    fontSize: '0.825rem',
    color: '#4B5563',
    marginBottom: '12px',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.775rem',
    color: '#6B7280',
    borderTop: '1px solid #F3F4F6',
    paddingTop: '10px',
  },
  paginationBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    backgroundColor: '#FFFFFF',
    borderRadius: '10px',
    border: '1px solid #E5E7EB',
  },
  paginationButtons: {
    display: 'flex',
    gap: '6px',
    alignItems: 'center',
  },
  pageBtn: {
    padding: '6px 14px',
    borderRadius: '6px',
    border: '1px solid #D1D5DB',
    backgroundColor: '#FFFFFF',
    color: '#374151',
    fontSize: '0.85rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  pageBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  pageNumBtn: {
    padding: '6px 12px',
    borderRadius: '6px',
    border: '1px solid #D1D5DB',
    backgroundColor: '#FFFFFF',
    color: '#374151',
    fontSize: '0.85rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  activePageNumBtn: {
    backgroundColor: '#006B3C',
    color: '#FFFFFF',
    borderColor: '#006B3C',
  },
};
