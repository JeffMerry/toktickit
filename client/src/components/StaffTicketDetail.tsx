import { useCallback, useEffect, useState, type CSSProperties, type FormEvent } from 'react';
import { apiFetch } from '../lib/api';

type DetailTicket = {
  id: number;
  ticketNumber: string;
  summary: string;
  description: string;
  requestedPriority: string;
  itPriority: string;
  currentStatus: string;
  updatedAt: string;
  requester: { name: string; email: string; department?: string | null };
  owner: { id: number; name: string } | null;
  eligibleOwners: { id: number; name: string; role: string }[];
  allowedNextStatuses: string[];
  category: { name: string };
  relatedSystem: { name: string };
  attachments: { id: number; fileName: string; isRemoved: boolean; removalReason?: string | null }[];
  publicComments: { id: number; content: string; author: { name: string }; createdAt: string }[];
  internalNotes: { id: number; content: string; author: { name: string }; createdAt: string }[];
};

export function StaffTicketDetail({ ticketId, onBack }: { ticketId: number; onBack: () => void }) {
  const [ticket, setTicket] = useState<DetailTicket | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [status, setStatus] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiFetch(`/api/staff/tickets/${ticketId}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to load ticket detail.');
      setTicket(data);
      setStatus('');
      setConfirmed(false);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to load ticket detail.');
    } finally {
      setIsLoading(false);
    }
  }, [ticketId]);

  useEffect(() => { void load(); }, [load]);

  const mutate = async (path: string, body: Record<string, unknown>) => {
    if (!ticket) return;
    setIsUpdating(true);
    setError(null);
    try {
      const response = await apiFetch(path, { method: path.endsWith('/claim') ? 'POST' : 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...body, expectedUpdatedAt: ticket.updatedAt }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to update the ticket.');
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to update the ticket.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatus = (event: FormEvent) => {
    event.preventDefault();
    if (status) void mutate(`/api/staff/tickets/${ticketId}/status`, { status, confirmed });
  };

  if (isLoading) return <p style={styles.state}>Loading operational ticket detail...</p>;
  if (error && !ticket) return <div role="alert" style={styles.error}><p>{error}</p><button onClick={() => void load()} style={styles.button}>Retry</button></div>;
  if (!ticket) return null;

  return (
    <section aria-labelledby="staff-ticket-detail-title">
      <button type="button" onClick={onBack} style={styles.back}>Back to Ticket Queue</button>
      <header style={styles.header}><div><p style={styles.ticketNumber}>{ticket.ticketNumber}</p><h1 id="staff-ticket-detail-title" style={styles.title}>{ticket.summary}</h1></div><span style={styles.status}>{ticket.currentStatus.replaceAll('_', ' ')}</span></header>
      {error && <div role="alert" style={styles.error}>{error}</div>}
      <div style={styles.grid}>
        <section style={styles.card}><h2 style={styles.heading}>Requester details</h2><p>{ticket.requester.name}</p><p>{ticket.requester.email}</p><p>{ticket.requester.department || 'No department recorded'}</p><p>Category: {ticket.category.name}</p><p>System: {ticket.relatedSystem.name}</p><p style={styles.description}>{ticket.description}</p></section>
        <section style={styles.card}><h2 style={styles.heading}>Operational controls</h2><p>Requested Priority: <strong>{ticket.requestedPriority}</strong></p>
          <label style={styles.label}>IT Priority<select value={ticket.itPriority} disabled={isUpdating} onChange={(event) => void mutate(`/api/staff/tickets/${ticketId}/priority`, { itPriority: event.target.value })} style={styles.select}>{['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map((value) => <option key={value}>{value}</option>)}</select></label>
          <label style={styles.label}>Owner<select value={ticket.owner?.id ?? ''} disabled={isUpdating} onChange={(event) => void mutate(`/api/staff/tickets/${ticketId}/owner`, { ownerId: event.target.value ? Number(event.target.value) : null })} style={styles.select}><option value="">Unassigned</option>{ticket.eligibleOwners.map((owner) => <option key={owner.id} value={owner.id}>{owner.name} ({owner.role.replace('_', ' ')})</option>)}</select></label>
          {!ticket.owner && <button type="button" disabled={isUpdating} onClick={() => void mutate(`/api/staff/tickets/${ticketId}/claim`, {})} style={styles.button}>Claim Ticket</button>}
          <form onSubmit={handleStatus} style={styles.statusForm}><label style={styles.label}>Next status<select value={status} onChange={(event) => setStatus(event.target.value)} disabled={isUpdating} style={styles.select}><option value="">Select a transition</option>{ticket.allowedNextStatuses.map((value) => <option key={value}>{value}</option>)}</select></label><label style={styles.confirm}><input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} /> I confirm this status change when required.</label><button type="submit" disabled={!status || isUpdating} style={styles.button}>Update status</button></form>
        </section>
      </div>
      <div style={styles.grid}>
        <section style={styles.card}><h2 style={styles.heading}>Attachments</h2>{ticket.attachments.length ? ticket.attachments.map((attachment) => <p key={attachment.id}>{attachment.fileName}{attachment.isRemoved ? ` (removed: ${attachment.removalReason || 'no reason'})` : ''}</p>) : <p>No attachments.</p>}</section>
        <section style={styles.card}><h2 style={styles.heading}>Public Comments</h2>{ticket.publicComments.length ? ticket.publicComments.map((comment) => <p key={comment.id}><strong>{comment.author.name}:</strong> {comment.content}</p>) : <p>No public comments.</p>}<h2 style={styles.heading}>Internal Notes</h2>{ticket.internalNotes.length ? ticket.internalNotes.map((note) => <p key={note.id}><strong>{note.author.name}:</strong> {note.content}</p>) : <p>No internal notes.</p>}</section>
      </div>
    </section>
  );
}

const styles: Record<string, CSSProperties> = {
  back: { border: 0, background: 'transparent', color: '#006B3C', padding: 0, fontWeight: 700, cursor: 'pointer', marginBottom: '16px' },
  header: { display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'start', marginBottom: '18px' },
  ticketNumber: { color: '#006B3C', fontWeight: 700, margin: 0 }, title: { color: '#1F2937', margin: '4px 0 0' }, status: { padding: '5px 9px', borderRadius: '12px', background: '#EAF6EF', color: '#006B3C', fontWeight: 700, whiteSpace: 'nowrap' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '16px' }, card: { padding: '18px', border: '1px solid #E5E7EB', borderRadius: '10px', background: '#FFF' }, heading: { color: '#006B3C', fontSize: '1.05rem', margin: '0 0 12px' }, description: { whiteSpace: 'pre-wrap', color: '#374151' }, label: { display: 'grid', gap: '5px', fontWeight: 700, color: '#374151', margin: '12px 0' }, select: { padding: '8px', border: '1px solid #D1D5DB', borderRadius: '6px', background: '#FFF' }, button: { border: 0, borderRadius: '6px', padding: '9px 12px', background: '#006B3C', color: '#FFF', fontWeight: 700, cursor: 'pointer' }, statusForm: { borderTop: '1px solid #E5E7EB', marginTop: '16px', paddingTop: '4px' }, confirm: { display: 'flex', gap: '7px', alignItems: 'center', fontSize: '.85rem', color: '#374151', margin: '10px 0' }, state: { padding: '32px', textAlign: 'center' }, error: { padding: '12px', border: '1px solid #FCA5A5', borderRadius: '8px', background: '#FEE2E2', color: '#991B1B', marginBottom: '14px' },
};
