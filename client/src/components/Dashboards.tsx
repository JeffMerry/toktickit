import { useCallback, useEffect, useState, type CSSProperties } from 'react';
import { apiFetch } from '../lib/api';

export type DashboardFilters = Record<string, string | boolean>;
type Metric = { value: number; drillDown: { view: 'my-tickets' | 'staff-queue'; filters: DashboardFilters } };
type TicketSummary = { id: number; ticketNumber: string; summary: string; currentStatus: string; updatedAt: string; requestedPriority: string; itPriority: string };
type RequesterData = {
  metrics: { openTickets: Metric; waitingForRequester: Metric; recentlyUpdated: Metric; recentlyResolved: Metric };
  attentionTickets: TicketSummary[];
  recentResolvedTickets: TicketSummary[];
};
type StaffData = {
  metrics: { unassignedTickets: Metric; myOwnedTickets: Metric; urgentActiveTickets: Metric; recentlyUpdatedTickets: Metric };
  byStatus: { status: string; value: number }[];
  byItPriority: { priority: string; value: number }[];
  urgentTickets: TicketSummary[];
  recentTickets: TicketSummary[];
};

function useDashboard<T>(path: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiFetch(path);
      if (!response.ok) throw new Error('Dashboard is unavailable. Please try again.');
      setData(await response.json() as T);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Dashboard is unavailable.');
    } finally {
      setLoading(false);
    }
  }, [path]);
  useEffect(() => { void load(); }, [load]);
  return { data, error, loading, load };
}

function DashboardState({ error, loading, retry }: { error: string; loading: boolean; retry: () => void }) {
  if (loading) return <p role="status" style={styles.state}>Loading dashboard...</p>;
  return <div role="alert" style={styles.error}><p>{error || 'Dashboard is unavailable.'}</p><button type="button" onClick={retry} style={styles.button}>Retry dashboard</button></div>;
}

function MetricCard({ label, metric, onOpen }: { label: string; metric: Metric; onOpen: (filters: DashboardFilters) => void }) {
  return <button type="button" aria-label={`View ${metric.value} ${label.toLowerCase()}`} onClick={() => onOpen(metric.drillDown.filters)} style={styles.metric}>
    <span>{label}</span><strong style={styles.number}>{metric.value}</strong><span style={styles.hint}>View matching tickets →</span>
  </button>;
}

function TicketPanel({ title, tickets, onTicket }: { title: string; tickets: TicketSummary[]; onTicket: (id: number) => void }) {
  return <section style={styles.panel} aria-label={title}><h2 style={styles.panelTitle}>{title}</h2>
    {tickets.length === 0 ? <p>No matching tickets right now.</p> : <ul style={styles.list}>{tickets.map((ticket) => <li key={ticket.id} style={styles.item}>
      <button type="button" onClick={() => onTicket(ticket.id)} style={styles.ticketButton}>{ticket.ticketNumber}: {ticket.summary}</button>
      <p style={styles.detail}>{ticket.currentStatus.replaceAll('_', ' ')} · IT priority {ticket.itPriority} · Updated {new Date(ticket.updatedAt).toLocaleDateString()}</p>
    </li>)}</ul>}
  </section>;
}

export function RequesterDashboard({ onDrillDown, onTicket, onCreate }: { onDrillDown: (filters: DashboardFilters) => void; onTicket: (id: number) => void; onCreate: () => void }) {
  const { data, error, loading, load } = useDashboard<RequesterData>('/api/dashboard/requester');
  if (loading || error || !data) return <DashboardState error={error} loading={loading} retry={() => void load()} />;
  return <section className="lab4-dashboard" aria-labelledby="requester-dashboard-title">
    <div style={styles.header}><div><h1 id="requester-dashboard-title" style={styles.title}>My Dashboard</h1><p>Only your support tickets appear here.</p></div><button type="button" onClick={onCreate} style={styles.button}>Create Ticket</button></div>
    <div style={styles.grid} aria-label="Requester metrics">
      <MetricCard label="Open Tickets" metric={data.metrics.openTickets} onOpen={onDrillDown} />
      <MetricCard label="Waiting for You" metric={data.metrics.waitingForRequester} onOpen={onDrillDown} />
      <MetricCard label="Recently Updated" metric={data.metrics.recentlyUpdated} onOpen={onDrillDown} />
      <MetricCard label="Recently Resolved" metric={data.metrics.recentlyResolved} onOpen={onDrillDown} />
    </div>
    <div style={styles.grid}><TicketPanel title="Needs attention / recently updated" tickets={data.attentionTickets} onTicket={onTicket} /><TicketPanel title="Recently resolved" tickets={data.recentResolvedTickets} onTicket={onTicket} /></div>
  </section>;
}

export function StaffDashboard({ onDrillDown, onTicket }: { onDrillDown: (filters: DashboardFilters) => void; onTicket: (id: number) => void }) {
  const { data, error, loading, load } = useDashboard<StaffData>('/api/dashboard/staff');
  if (loading || error || !data) return <DashboardState error={error} loading={loading} retry={() => void load()} />;
  return <section className="lab4-dashboard" aria-labelledby="staff-dashboard-title">
    <h1 id="staff-dashboard-title" style={styles.title}>IT Staff Dashboard</h1><p>Operational tickets and recent work.</p>
    <div style={styles.grid} aria-label="Staff metrics">
      <MetricCard label="Unassigned Tickets" metric={data.metrics.unassignedTickets} onOpen={onDrillDown} />
      <MetricCard label="My Owned Tickets" metric={data.metrics.myOwnedTickets} onOpen={onDrillDown} />
      <MetricCard label="Urgent Active Tickets" metric={data.metrics.urgentActiveTickets} onOpen={onDrillDown} />
      <MetricCard label="Recently Updated Tickets" metric={data.metrics.recentlyUpdatedTickets} onOpen={onDrillDown} />
    </div>
    <div style={styles.grid}>
      <section style={styles.panel} aria-label="Tickets by status"><h2 style={styles.panelTitle}>Tickets by status</h2>{data.byStatus.map(({ status, value }) => <button key={status} type="button" onClick={() => onDrillDown({ status })} style={styles.distribution}>{status.replaceAll('_', ' ')}: {value}</button>)}</section>
      <section style={styles.panel} aria-label="Tickets by IT priority"><h2 style={styles.panelTitle}>Tickets by IT priority</h2>{data.byItPriority.map(({ priority, value }) => <button key={priority} type="button" onClick={() => onDrillDown({ itPriority: priority })} style={styles.distribution}>{priority}: {value}</button>)}</section>
      <TicketPanel title="Urgent work" tickets={data.urgentTickets} onTicket={onTicket} />
      <TicketPanel title="Recently updated" tickets={data.recentTickets} onTicket={onTicket} />
    </div>
  </section>;
}

const styles: Record<string, CSSProperties> = {
  title: { color: '#006B3C', margin: '0 0 4px', fontSize: '1.65rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: 14, margin: '20px 0' },
  metric: { display: 'grid', gap: 8, textAlign: 'left', background: '#FFF', color: '#16432E', border: '1px solid #B8E2C8', borderRadius: 12, padding: 18, cursor: 'pointer', minWidth: 0 },
  number: { fontSize: '2rem', color: '#006B3C' }, hint: { fontSize: '.8rem', textDecoration: 'underline' },
  panel: { background: '#FFF', border: '1px solid #D1E0D8', borderRadius: 12, padding: 18, minWidth: 0 },
  panelTitle: { color: '#16432E', fontSize: '1.1rem', margin: '0 0 12px' },
  list: { listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10 },
  item: { borderTop: '1px solid #D1E0D8', paddingTop: 10 },
  ticketButton: { border: 0, background: 'transparent', color: '#006B3C', fontWeight: 700, textDecoration: 'underline', textAlign: 'left', cursor: 'pointer', overflowWrap: 'anywhere' },
  detail: { color: '#4B5563', fontSize: '.8rem', margin: '4px 0 0', overflowWrap: 'anywhere' },
  distribution: { display: 'block', width: '100%', border: 0, borderTop: '1px solid #E5E7EB', background: '#FFF', color: '#006B3C', textAlign: 'left', padding: '8px 0', cursor: 'pointer' },
  button: { background: '#006B3C', color: '#FFF', border: 0, borderRadius: 8, padding: '10px 16px', fontWeight: 700, cursor: 'pointer' },
  state: { padding: 32, background: '#FFF', color: '#16432E' },
  error: { padding: 24, background: '#FEE2E2', color: '#991B1B', borderRadius: 10 },
};
