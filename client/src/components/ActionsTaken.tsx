import { useCallback, useEffect, useState, type CSSProperties } from 'react';
import { apiFetch } from '../lib/api';

export type ActionPerson = { id: number; name: string; role?: string };

export type ActionTaken = {
  id: number;
  actionOccurredAt: string;
  description: string;
  result: string | null;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  assignee: ActionPerson | null;
  createdBy: ActionPerson;
  performedBy: ActionPerson | null;
  followUpRequired: boolean;
  followUpNote: string | null;
  attachmentNotes: string | null;
  createdAt: string;
  updatedAt: string;
};

export function ActionsTaken({ ticketId }: { ticketId: number }) {
  const [actions, setActions] = useState<ActionTaken[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiFetch(`/api/tickets/${ticketId}/actions-taken`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to load Actions Taken.');
      setActions(Array.isArray(data) ? data : []);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to load Actions Taken.');
    } finally {
      setIsLoading(false);
    }
  }, [ticketId]);

  useEffect(() => { void load(); }, [load]);

  return (
    <section aria-labelledby="actions-taken-title" style={styles.section}>
      <div style={styles.header}>
        <div>
          <h2 id="actions-taken-title" style={styles.title}>Actions Taken</h2>
          <p style={styles.subtitle}>Recorded work and its follow-up details for this ticket.</p>
        </div>
      </div>

      {isLoading ? <p style={styles.state}>Loading Actions Taken...</p> : null}
      {error ? (
        <div role="alert" style={styles.error}>
          <p style={{ margin: 0 }}>{error}</p>
          <button type="button" onClick={() => void load()} style={styles.retry}>Retry</button>
        </div>
      ) : null}
      {!isLoading && !error && actions.length === 0 ? <p style={styles.empty}>No actions have been recorded for this ticket.</p> : null}
      {!isLoading && !error && actions.length > 0 ? (
        <div style={styles.list}>
          {actions.map((action) => <ActionCard key={action.id} action={action} />)}
        </div>
      ) : null}
    </section>
  );
}

function ActionCard({ action }: { action: ActionTaken }) {
  const formattedTime = new Date(action.actionOccurredAt).toLocaleString();
  const wasEdited = action.updatedAt !== action.createdAt;
  return (
    <article style={styles.card} aria-label={`Action Taken: ${action.description}`}>
      <div style={styles.cardHeader}>
        <div>
          <p style={styles.date}><time dateTime={action.actionOccurredAt} title={action.actionOccurredAt}>{formattedTime}</time></p>
          <p style={styles.utc}>UTC: {new Date(action.actionOccurredAt).toISOString()}</p>
        </div>
        <span style={{ ...styles.badge, ...statusStyle(action.status) }}>{action.status.replaceAll('_', ' ')}</span>
      </div>
      <p style={styles.description}>{action.description}</p>
      <Detail label="Result" value={action.result || 'No result recorded yet.'} muted={!action.result} />
      <Detail label="Assignee" value={personLabel(action.assignee, 'Unassigned')} />
      <Detail label="Performed by" value={personLabel(action.performedBy, 'Not completed yet')} />
      <Detail label="Follow-up" value={action.followUpRequired ? 'Follow-up required' : 'No follow-up required'} />
      {action.followUpNote ? <Detail label="Follow-up note" value={action.followUpNote} /> : null}
      {action.attachmentNotes ? <Detail label="Attachment notes" value={action.attachmentNotes} /> : null}
      <p style={styles.context}>Created by {personLabel(action.createdBy, 'Unknown user')}{wasEdited ? ' · Edited after creation' : ''}</p>
    </article>
  );
}

function Detail({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) {
  return <p style={{ ...styles.detail, ...(muted ? styles.muted : {}) }}><strong>{label}:</strong> {value}</p>;
}

function personLabel(person: ActionPerson | null, fallback: string) {
  return person ? `${person.name}${person.role ? ` (${person.role.replaceAll('_', ' ')})` : ''}` : fallback;
}

function statusStyle(status: ActionTaken['status']): CSSProperties {
  if (status === 'COMPLETED') return { background: '#DCFCE7', color: '#166534' };
  if (status === 'IN_PROGRESS') return { background: '#DBEAFE', color: '#1D4ED8' };
  if (status === 'CANCELLED') return { background: '#F3F4F6', color: '#4B5563' };
  return { background: '#FEF3C7', color: '#92400E' };
}

const styles: Record<string, CSSProperties> = {
  section: { marginTop: '16px', padding: '24px', border: '1px solid #E5E7EB', borderRadius: '12px', background: '#FFF' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '12px', marginBottom: '16px' },
  title: { margin: 0, color: '#006B3C', fontSize: '1.2rem' },
  subtitle: { margin: '4px 0 0', color: '#4B5563', fontSize: '.9rem' },
  state: { color: '#4B5563', margin: 0 },
  empty: { margin: 0, padding: '16px', borderRadius: '8px', background: '#F9FAFB', color: '#4B5563' },
  error: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', padding: '12px', border: '1px solid #FCA5A5', borderRadius: '8px', background: '#FEF2F2', color: '#991B1B' },
  retry: { border: '1px solid #991B1B', borderRadius: '6px', padding: '7px 10px', background: '#FFF', color: '#991B1B', fontWeight: 700, cursor: 'pointer' },
  list: { display: 'grid', gap: '12px' },
  card: { padding: '16px', border: '1px solid #D1D5DB', borderRadius: '10px', background: '#FCFDFC' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '12px', marginBottom: '10px' },
  date: { margin: 0, color: '#1F2937', fontWeight: 700 },
  utc: { margin: '3px 0 0', color: '#6B7280', fontSize: '.75rem' },
  badge: { display: 'inline-block', padding: '4px 8px', borderRadius: '999px', fontWeight: 700, fontSize: '.75rem', whiteSpace: 'nowrap' },
  description: { margin: '0 0 12px', color: '#111827', whiteSpace: 'pre-wrap', lineHeight: 1.5 },
  detail: { margin: '6px 0', color: '#374151', whiteSpace: 'pre-wrap' },
  muted: { color: '#6B7280', fontStyle: 'italic' },
  context: { margin: '12px 0 0', paddingTop: '10px', borderTop: '1px solid #E5E7EB', color: '#6B7280', fontSize: '.8rem' },
};
