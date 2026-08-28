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

interface MyTicketsTableProps {
  tickets: TicketItem[];
  onSelectTicket?: (ticketId: number) => void;
}

export const MyTicketsList: React.FC<MyTicketsTableProps> = ({ tickets, onSelectTicket }) => {
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

  return (
    <div>
      {/* 1. Desktop & Tablet View (Table Grid) */}
      <div style={styles.desktopContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.theadRow}>
              <th style={styles.th}>Ticket No.</th>
              <th style={styles.th}>Created Date</th>
              <th style={styles.th}>Summary</th>
              <th style={styles.th}>Category</th>
              <th style={styles.th}>System</th>
              <th style={styles.th}>Priority</th>
              <th style={styles.th}>Status</th>
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

      {/* 2. Mobile View (Responsive Cards) */}
      <div style={styles.mobileContainer}>
        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            style={styles.card}
            onClick={() => onSelectTicket && onSelectTicket(ticket.id)}
          >
            <div style={styles.cardHeader}>
              <span style={{ fontWeight: 700, color: '#006B3C', fontFamily: 'monospace' }}>
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
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  desktopContainer: {
    overflowX: 'auto',
    borderRadius: '8px',
    border: '1px solid #E5E7EB',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: '#FFFFFF',
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
  tr: {
    borderBottom: '1px solid #E5E7EB',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
  },
  td: {
    padding: '14px 16px',
    verticalAlign: 'middle',
  },
  // Mobile Card Styles
  mobileContainer: {
    display: 'none', // Controlled via CSS media query or responsive flex in App
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '10px',
    padding: '16px',
    marginBottom: '12px',
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
    fontSize: '1rem',
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
};
