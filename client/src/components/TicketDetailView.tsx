import React from 'react';

export interface AttachmentData {
  id: number;
  fileName: string;
  fileSize: number;
  mimeType: string;
  storagePath: string;
  isRemoved: boolean;
  removedAt?: string;
  removalReason?: string;
  createdAt: string;
}

export interface TicketDetailData {
  id: number;
  ticketNumber: string;
  summary: string;
  description: string;
  requestedPriority: string;
  currentStatus: string;
  createdAt: string;
  updatedAt?: string;
  requester: { id: number; name: string; email: string; department?: string };
  category: { id: number; name: string; description?: string };
  relatedSystem: { id: number; name: string; description?: string };
  attachments: AttachmentData[];
}

interface TicketDetailViewProps {
  ticket: TicketDetailData;
  onBack: () => void;
  children?: React.ReactNode; // For AttachmentSection in Step 4
}

export const TicketDetailView: React.FC<TicketDetailViewProps> = ({ ticket, onBack, children }) => {
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
    let bg = '#FEF3C7';
    let color = '#92400E';

    if (p === 'LOW') {
      bg = '#F3F4F6';
      color = '#4B5563';
    } else if (p === 'HIGH') {
      bg = '#FFEDD5';
      color = '#C2410C';
    } else if (p === 'URGENT') {
      bg = '#FEE2E2';
      color = '#991B1B';
    }

    return (
      <span style={{ backgroundColor: bg, color, padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700 }}>
        {p}
      </span>
    );
  };

  // Helper for Status Badges
  const getStatusBadge = (status: string) => {
    let bg = '#EAF6EF';
    let color = '#006B3C';

    if (status === 'In Progress') {
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
      <span style={{ backgroundColor: bg, color, padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700 }}>
        {status}
      </span>
    );
  };

  return (
    <div style={styles.container}>
      {/* 1. Header & Navigation Bar */}
      <div style={styles.topNavRow}>
        <div style={styles.breadcrumb}>
          <span style={{ color: '#006B3C', cursor: 'pointer', fontWeight: 500 }} onClick={onBack}>
            My Tickets
          </span>
          <span style={{ margin: '0 8px', color: '#9CA3AF' }}>›</span>
          <span style={{ color: '#4B5563', fontWeight: 600 }}>Ticket Details</span>
        </div>

        <button onClick={onBack} style={styles.backBtn}>
          ← Back to My Tickets
        </button>
      </div>

      {/* 2. Main Ticket Read-Only Card (Zen Green Design Language) */}
      <div style={styles.card}>
        {/* Row 1: Ticket No., Date, Category, System */}
        <div style={styles.gridRow4}>
          <div>
            <label style={styles.label}>Ticket No.</label>
            <div style={styles.readOnlyFieldHighlight}>{ticket.ticketNumber}</div>
          </div>
          <div>
            <label style={styles.label}>Ticket Date</label>
            <div style={styles.readOnlyField}>{formatDate(ticket.createdAt)}</div>
          </div>
          <div>
            <label style={styles.label}>Category</label>
            <div style={styles.readOnlyField}>{ticket.category.name}</div>
          </div>
          <div>
            <label style={styles.label}>Related System</label>
            <div style={styles.readOnlyField}>{ticket.relatedSystem.name}</div>
          </div>
        </div>

        {/* Row 2: Requester, Priority, Status */}
        <div style={styles.gridRow3}>
          <div>
            <label style={styles.label}>Requester</label>
            <div style={styles.readOnlyField}>
              {ticket.requester.name} {ticket.requester.department ? `(${ticket.requester.department})` : ''}
            </div>
          </div>
          <div>
            <label style={styles.label}>Requested Priority</label>
            <div style={{ marginTop: '4px' }}>{getPriorityBadge(ticket.requestedPriority)}</div>
          </div>
          <div>
            <label style={styles.label}>Current Status</label>
            <div style={{ marginTop: '4px' }}>{getStatusBadge(ticket.currentStatus)}</div>
          </div>
        </div>

        {/* Row 3: Summary */}
        <div style={styles.fullRow}>
          <label style={styles.label}>Summary</label>
          <div style={styles.readOnlyFieldBold}>{ticket.summary}</div>
        </div>

        {/* Row 4: Description */}
        <div style={styles.fullRow}>
          <label style={styles.label}>Description</label>
          <div style={styles.descriptionBox}>{ticket.description}</div>
        </div>

        {/* Row 5: Resolution Summary (Read-Only Placeholder) */}
        <div style={styles.fullRow}>
          <label style={styles.label}>Resolution Summary</label>
          <div style={styles.resolutionBox}>
            <span style={{ color: '#9CA3AF', fontStyle: 'italic' }}>No resolution summary available yet.</span>
          </div>
        </div>
      </div>

      {/* 3. Attachment Section Slot (Step 4) */}
      {children}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  topNavRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  breadcrumb: {
    fontSize: '0.9rem',
  },
  backBtn: {
    backgroundColor: '#FFFFFF',
    color: '#006B3C',
    border: '1px solid #006B3C',
    padding: '8px 16px',
    borderRadius: '8px',
    fontWeight: 600,
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '28px',
    boxShadow: '0 2px 10px rgba(0, 107, 60, 0.05)',
    border: '1px solid #E5E7EB',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  gridRow4: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
  },
  gridRow3: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
  },
  fullRow: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontSize: '0.8rem',
    fontWeight: 600,
    color: '#4B5563',
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
  },
  readOnlyField: {
    backgroundColor: '#F9FAFB',
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '0.925rem',
    color: '#1F2937',
  },
  readOnlyFieldHighlight: {
    backgroundColor: '#EAF6EF',
    border: '1px solid #B8E2C8',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '0.95rem',
    fontWeight: 700,
    color: '#006B3C',
    fontFamily: 'monospace',
  },
  readOnlyFieldBold: {
    backgroundColor: '#F9FAFB',
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '1rem',
    fontWeight: 700,
    color: '#1F2937',
  },
  descriptionBox: {
    backgroundColor: '#F9FAFB',
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
    padding: '14px',
    fontSize: '0.95rem',
    color: '#374151',
    lineHeight: 1.6,
    whiteSpace: 'pre-wrap',
    minHeight: '100px',
  },
  resolutionBox: {
    backgroundColor: '#F9FAFB',
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
    padding: '12px 14px',
    fontSize: '0.875rem',
    color: '#6B7280',
  },
};
