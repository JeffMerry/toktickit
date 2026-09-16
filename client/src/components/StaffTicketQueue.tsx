import { useCallback, useEffect, useState, type CSSProperties, type FormEvent } from 'react';
import { apiFetch } from '../lib/api';

type QueueTicket = { id: number; ticketNumber: string; summary: string; requestedPriority: string; itPriority: string; currentStatus: string; requester: { name: string; email: string }; owner: { name: string } | null; category: { name: string } };
type Pagination = { total: number; page: number; limit: number; totalPages: number };
type Category = { id: number; name: string };
type Owner = { id: number; name: string; role: string };

const priorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const statuses = ['NEW', 'OPEN', 'IN_PROGRESS', 'WAITING_FOR_REQUESTER', 'RESOLVED', 'CLOSED', 'REOPENED', 'CANCELLED'];
const sortFields = [
  { value: 'updatedAt', label: 'Last updated' }, { value: 'createdAt', label: 'Created' }, { value: 'ticketNumber', label: 'Ticket number' }, { value: 'itPriority', label: 'IT priority' }, { value: 'currentStatus', label: 'Status' },
];

export function StaffTicketQueue({ onSelectTicket }: { onSelectTicket: (ticketId: number) => void }) {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [requestedPriority, setRequestedPriority] = useState('');
  const [itPriority, setItPriority] = useState('');
  const [status, setStatus] = useState('');
  const [ownerId, setOwnerId] = useState('');
  const [assignment, setAssignment] = useState('');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [tickets, setTickets] = useState<QueueTicket[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const resetPage = <T,>(setValue: (value: T) => void) => (value: T) => { setValue(value); setPage(1); };

  useEffect(() => {
    const loadReferences = async () => {
      try {
        const [categoryResponse, ownerResponse] = await Promise.all([apiFetch('/api/categories'), apiFetch('/api/staff/eligible-owners')]);
        if (categoryResponse.ok) setCategories(await categoryResponse.json());
        if (ownerResponse.ok) setOwners(await ownerResponse.json());
      } catch {
        // Queue results remain usable even if an optional filter list cannot be loaded.
      }
    };
    void loadReferences();
  }, []);

  const loadQueue = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '10', sortBy, sortOrder });
      if (search) params.set('search', search);
      if (categoryId) params.set('categoryId', categoryId);
      if (requestedPriority) params.set('requestedPriority', requestedPriority);
      if (itPriority) params.set('itPriority', itPriority);
      if (status) params.set('status', status);
      if (ownerId) params.set('ownerId', ownerId);
      if (assignment) params.set('assignment', assignment);
      const response = await apiFetch(`/api/staff/tickets?${params.toString()}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to load the ticket queue.');
      setTickets(data.data || []);
      setPagination(data.pagination || { total: 0, page, limit: 10, totalPages: 1 });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to load the ticket queue.');
    } finally {
      setIsLoading(false);
    }
  }, [search, categoryId, requestedPriority, itPriority, status, ownerId, assignment, sortBy, sortOrder, page, refreshKey]);

  useEffect(() => { void loadQueue(); }, [loadQueue]);

  const handleSearch = (event: FormEvent) => { event.preventDefault(); setSearch(searchInput.trim()); setPage(1); };
  const clearFilters = () => { setSearchInput(''); setSearch(''); setCategoryId(''); setRequestedPriority(''); setItPriority(''); setStatus(''); setOwnerId(''); setAssignment(''); setSortBy('updatedAt'); setSortOrder('desc'); setPage(1); };

  return (
    <section aria-labelledby="staff-queue-title">
      <div style={styles.header}><div><h1 id="staff-queue-title" style={styles.title}>Ticket Queue</h1><p style={styles.subtitle}>{pagination.total} ticket{pagination.total === 1 ? '' : 's'} match the current queue filters.</p></div><button type="button" onClick={() => setRefreshKey((value) => value + 1)} style={styles.secondaryButton}>Refresh</button></div>
      <form onSubmit={handleSearch} style={styles.filters}>
        <label style={styles.label}>Search ticket, requester, or email<input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} style={styles.input} /></label>
        <label style={styles.label}>Category<select aria-label="Category" value={categoryId} onChange={(event) => resetPage(setCategoryId)(event.target.value)} style={styles.input}><option value="">All categories</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
        <label style={styles.label}>Requested Priority<select aria-label="Requested Priority" value={requestedPriority} onChange={(event) => resetPage(setRequestedPriority)(event.target.value)} style={styles.input}><option value="">All requested priorities</option>{priorities.map((value) => <option key={value}>{value}</option>)}</select></label>
        <label style={styles.label}>IT Priority<select aria-label="IT Priority" value={itPriority} onChange={(event) => resetPage(setItPriority)(event.target.value)} style={styles.input}><option value="">All IT priorities</option>{priorities.map((value) => <option key={value}>{value}</option>)}</select></label>
        <label style={styles.label}>Status<select aria-label="Status" value={status} onChange={(event) => resetPage(setStatus)(event.target.value)} style={styles.input}><option value="">All statuses</option>{statuses.map((value) => <option key={value}>{value.replaceAll('_', ' ')}</option>)}</select></label>
        <label style={styles.label}>Owner<select aria-label="Owner" value={ownerId} onChange={(event) => resetPage(setOwnerId)(event.target.value)} style={styles.input}><option value="">All owners</option>{owners.map((owner) => <option key={owner.id} value={owner.id}>{owner.name} ({owner.role.replace('_', ' ')})</option>)}</select></label>
        <label style={styles.label}>Assignment<select aria-label="Assignment" value={assignment} onChange={(event) => resetPage(setAssignment)(event.target.value)} style={styles.input}><option value="">All tickets</option><option value="unassigned">Unassigned</option><option value="assigned">Assigned</option></select></label>
        <label style={styles.label}>Sort by<select aria-label="Sort by" value={sortBy} onChange={(event) => resetPage(setSortBy)(event.target.value)} style={styles.input}>{sortFields.map((field) => <option key={field.value} value={field.value}>{field.label}</option>)}</select></label>
        <label style={styles.label}>Sort order<select aria-label="Sort order" value={sortOrder} onChange={(event) => resetPage(setSortOrder)(event.target.value)} style={styles.input}><option value="desc">Descending</option><option value="asc">Ascending</option></select></label>
        <button type="submit" style={styles.primaryButton}>Apply filters</button><button type="button" onClick={clearFilters} style={styles.secondaryButton}>Clear filters</button>
      </form>
      {isLoading ? <p style={styles.state}>Loading ticket queue...</p> : error ? <div role="alert" style={styles.error}><p>{error}</p><button type="button" onClick={() => setRefreshKey((value) => value + 1)} style={styles.primaryButton}>Retry</button></div> : tickets.length === 0 ? <p style={styles.state}>No tickets match the current queue filters.</p> : <div style={styles.list}>{tickets.map((ticket) => <article key={ticket.id} style={styles.ticket}><div style={styles.ticketHeader}><strong>{ticket.ticketNumber}</strong><span style={styles.status}>{ticket.currentStatus.replaceAll('_', ' ')}</span></div><h2 style={styles.summary}>{ticket.summary}</h2><p style={styles.meta}>Requester: {ticket.requester.name} ({ticket.requester.email})</p><p style={styles.meta}>Category: {ticket.category.name} · Requested: {ticket.requestedPriority} · IT: {ticket.itPriority}</p><p style={styles.meta}>Owner: {ticket.owner?.name ?? 'Unassigned'}</p><button type="button" onClick={() => onSelectTicket(ticket.id)} style={styles.viewButton}>View operational detail</button></article>)}</div>}
      {!isLoading && !error && <nav aria-label="Queue pagination" style={styles.pagination}><button type="button" disabled={pagination.page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} style={styles.secondaryButton}>Previous page</button><span>Page {pagination.page} of {pagination.totalPages}</span><button type="button" disabled={pagination.page >= pagination.totalPages} onClick={() => setPage((value) => Math.min(pagination.totalPages, value + 1))} style={styles.secondaryButton}>Next page</button></nav>}
    </section>
  );
}

const styles: Record<string, CSSProperties> = {
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }, title: { color: '#006B3C', margin: 0, fontSize: '1.65rem' }, subtitle: { color: '#4B5563', margin: '4px 0 0' }, filters: { display: 'flex', gap: '12px', alignItems: 'end', flexWrap: 'wrap', marginBottom: '20px', padding: '16px', border: '1px solid #E5E7EB', borderRadius: '10px', background: '#FFF' }, label: { display: 'grid', gap: '6px', color: '#374151', fontSize: '.85rem', fontWeight: 600, minWidth: '180px' }, input: { padding: '9px 10px', border: '1px solid #D1D5DB', borderRadius: '7px', fontSize: '.95rem' }, primaryButton: { border: 0, borderRadius: '7px', padding: '10px 14px', background: '#006B3C', color: '#FFF', fontWeight: 700, cursor: 'pointer' }, secondaryButton: { border: '1px solid #006B3C', borderRadius: '7px', padding: '9px 14px', background: '#FFF', color: '#006B3C', fontWeight: 700, cursor: 'pointer' }, state: { padding: '32px', textAlign: 'center', border: '1px solid #E5E7EB', borderRadius: '10px', background: '#FFF', color: '#4B5563' }, error: { padding: '18px', border: '1px solid #FCA5A5', borderRadius: '10px', background: '#FEE2E2', color: '#991B1B' }, list: { display: 'grid', gap: '12px' }, ticket: { padding: '18px', border: '1px solid #E5E7EB', borderRadius: '10px', background: '#FFF' }, ticketHeader: { display: 'flex', justifyContent: 'space-between', gap: '12px', color: '#006B3C' }, status: { padding: '2px 8px', borderRadius: '12px', background: '#EAF6EF', fontSize: '.75rem', fontWeight: 700 }, summary: { margin: '10px 0 8px', color: '#1F2937', fontSize: '1.05rem' }, meta: { margin: '4px 0', color: '#4B5563', fontSize: '.875rem' }, viewButton: { marginTop: '10px', border: 0, borderRadius: '6px', padding: '8px 11px', background: '#006B3C', color: '#FFF', fontWeight: 700, cursor: 'pointer' }, pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '20px' },
};
