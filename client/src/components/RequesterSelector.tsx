import React, { useState, useEffect } from 'react';
import { useRequester, type Requester } from '../context/RequesterContext';

interface RequesterSelectorProps {
  onSuccess?: () => void;
}

export const RequesterSelector: React.FC<RequesterSelectorProps> = ({ onSuccess }) => {
  const { selectedRequester, setSelectedRequester } = useRequester();
  const [requesters, setRequesters] = useState<Requester[]>([]);
  const [selectedId, setSelectedId] = useState<string>(
    selectedRequester ? String(selectedRequester.id) : ''
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequesters = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('http://localhost:5000/api/requesters');
        if (!res.ok) {
          throw new Error(`Server returned ${res.status}`);
        }
        const data: Requester[] = await res.json();
        setRequesters(data);

        // เซ็ตเลือกคนแรกเป็นค่าเริ่มต้นถ้ายังไม่มีที่เลือกไว้
        if (data.length > 0 && !selectedId) {
          setSelectedId(String(data[0].id));
        }
      } catch (err: any) {
        console.error('Failed to load requesters:', err);
        setError('Unable to load active Development Requesters. Please check backend connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchRequesters();
  }, []);

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    const chosen = requesters.find((r) => String(r.id) === selectedId);
    if (chosen) {
      setSelectedRequester(chosen);
      if (onSuccess) onSuccess();
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.iconCircle}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#006B3C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="8.5" cy="7" r="4"></circle>
            <line x1="20" y1="8" x2="20" y2="14"></line>
            <line x1="23" y1="11" x2="17" y2="11"></line>
          </svg>
        </div>

        <h2 style={styles.title}>Select Development Requester</h2>
        <p style={styles.subtitle}>
          Choose a development requester to simulate the current requester context for Lab 2.<br />
          This is for testing only and is not a login screen.
        </p>

        {loading ? (
          <div style={styles.loadingState}>
            <span>Loading active requesters...</span>
          </div>
        ) : error ? (
          <div style={styles.errorState}>
            <p style={{ margin: 0 }}>⚠️ {error}</p>
            <button
              onClick={() => window.location.reload()}
              style={styles.retryBtn}
            >
              Retry
            </button>
          </div>
        ) : requesters.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No active Development Requesters found in database.</p>
          </div>
        ) : (
          <form onSubmit={handleContinue} style={styles.form}>
            <label style={styles.label}>
              Development Requester <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              style={styles.select}
              required
            >
              {requesters.map((req) => (
                <option key={req.id} value={req.id}>
                  {req.name} ({req.email}) {req.department ? `- ${req.department}` : ''}
                </option>
              ))}
            </select>

            {/* Info Box 1 */}
            <div style={styles.infoBox}>
              <span style={styles.infoIcon}>ℹ️</span>
              <span style={{ fontSize: '0.875rem', color: '#0B7A46' }}>
                Only active development requesters are shown.
              </span>
            </div>

            {/* Info Box 2 (Authentication notice) */}
            <div style={styles.noticeBox}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1F2937', marginBottom: '4px' }}>
                🛡️ Authentication coming in Lab 3
              </div>
              <div style={{ fontSize: '0.825rem', color: '#4B5563' }}>
                In Lab 3, this selection will be replaced with secure authentication so you can access the system with your own account.
              </div>
            </div>

            <div style={styles.actions}>
              {selectedRequester && (
                <button
                  type="button"
                  onClick={onSuccess}
                  style={styles.cancelBtn}
                >
                  Cancel
                </button>
              )}
              <button type="submit" style={styles.submitBtn}>
                Continue →
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '80vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    backgroundColor: '#F5F7F6',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '36px',
    maxWidth: '520px',
    width: '100%',
    boxShadow: '0 4px 20px rgba(0, 107, 60, 0.08)',
    border: '1px solid #E5E7EB',
    textAlign: 'center',
  },
  iconCircle: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    backgroundColor: '#EAF6EF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px auto',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#006B3C',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '0.875rem',
    color: '#4B5563',
    lineHeight: 1.5,
    marginBottom: '24px',
  },
  form: {
    textAlign: 'left',
  },
  label: {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#1F2937',
    marginBottom: '6px',
  },
  select: {
    width: '100%',
    padding: '10px 14px',
    fontSize: '0.95rem',
    borderRadius: '8px',
    border: '1px solid #D1D5DB',
    backgroundColor: '#FFFFFF',
    color: '#1F2937',
    outline: 'none',
    boxSizing: 'border-box',
    marginBottom: '16px',
  },
  infoBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    borderRadius: '8px',
    backgroundColor: '#EAF6EF',
    border: '1px solid #B8E2C8',
    marginBottom: '16px',
  },
  infoIcon: {
    fontSize: '1rem',
  },
  noticeBox: {
    padding: '12px 14px',
    borderRadius: '8px',
    backgroundColor: '#F9FAFB',
    border: '1px solid #E5E7EB',
    marginBottom: '24px',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
  },
  cancelBtn: {
    padding: '10px 20px',
    borderRadius: '8px',
    border: '1px solid #D1D5DB',
    backgroundColor: '#FFFFFF',
    color: '#374151',
    fontWeight: 600,
    cursor: 'pointer',
  },
  submitBtn: {
    padding: '10px 24px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#006B3C',
    color: '#FFFFFF',
    fontWeight: 600,
    fontSize: '0.95rem',
    cursor: 'pointer',
  },
  loadingState: {
    padding: '24px',
    color: '#0B7A46',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  errorState: {
    padding: '16px',
    backgroundColor: '#FEE2E2',
    color: '#991B1B',
    borderRadius: '8px',
    border: '1px solid #FCA5A5',
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: '12px',
    padding: '6px 16px',
    backgroundColor: '#DC2626',
    color: '#FFF',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  emptyState: {
    padding: '16px',
    backgroundColor: '#FEF3C7',
    color: '#92400E',
    borderRadius: '8px',
  },
};
