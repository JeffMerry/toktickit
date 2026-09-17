import { useCallback, useEffect, useState, type CSSProperties, type FormEvent } from 'react';
import { apiFetch } from '../lib/api';
import type { UserRole } from '../context/AuthContext';

type ManagedUser = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  mustChangePassword: boolean;
  createdAt: string;
  updatedAt: string;
};

type Pagination = { total: number; page: number; limit: number; totalPages: number };
type Draft = { name: string; email: string; role: UserRole; isActive: boolean; initialPassword: string; confirmPassword: string };

const roles: UserRole[] = ['REQUESTER', 'IT_STAFF', 'ADMINISTRATOR'];
const emptyDraft = (): Draft => ({ name: '', email: '', role: 'REQUESTER', isActive: true, initialPassword: '', confirmPassword: '' });

function errorMessage(data: unknown, fallback: string) {
  return data && typeof data === 'object' && 'error' in data && typeof data.error === 'string' ? data.error : fallback;
}

export function UserManagement() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [editing, setEditing] = useState<ManagedUser | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setListError(null);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (search) params.set('search', search);
      if (roleFilter) params.set('role', roleFilter);
      const response = await apiFetch(`/api/admin/users?${params}`);
      const data = await response.json();
      if (!response.ok) throw new Error(errorMessage(data, 'Unable to load users.'));
      setUsers(data.data ?? []);
      setPagination(data.pagination ?? { total: 0, page, limit: 20, totalPages: 1 });
    } catch (reason) {
      setListError(reason instanceof Error ? reason.message : 'Unable to load users.');
    } finally {
      setIsLoading(false);
    }
  }, [page, roleFilter, search]);

  useEffect(() => { void loadUsers(); }, [loadUsers]);

  const closePanel = () => { setEditing(null); setIsCreating(false); setDraft(emptyDraft()); setFormError(null); };
  const startCreate = () => { setSuccess(null); setEditing(null); setDraft(emptyDraft()); setFormError(null); setIsCreating(true); };
  const startEdit = (user: ManagedUser) => {
    setSuccess(null);
    setEditing(user);
    setIsCreating(false);
    setDraft({ name: user.name, email: user.email, role: user.role, isActive: user.isActive, initialPassword: '', confirmPassword: '' });
    setFormError(null);
  };
  const updateDraft = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((current) => ({ ...current, [key]: value }));

  const validateDraft = (needsPassword: boolean) => {
    if (draft.name.trim().length < 2 || draft.name.trim().length > 100) return 'Name must contain 2 to 100 characters.';
    if (!/^\S+@\S+\.\S+$/.test(draft.email.trim())) return 'Enter a valid email address.';
    if (needsPassword && draft.initialPassword.length < 10) return 'Initial password must contain at least 10 characters.';
    if (needsPassword && draft.initialPassword !== draft.confirmPassword) return 'Password confirmation does not match.';
    return undefined;
  };

  const saveUser = async (event: FormEvent) => {
    event.preventDefault();
    const validationError = validateDraft(isCreating);
    if (validationError) return setFormError(validationError);
    if (editing?.isActive && !draft.isActive && !window.confirm(`Deactivate ${editing.name}? Their active sessions will end.`)) return;
    setIsSaving(true);
    setFormError(null);
    try {
      const creating = isCreating;
      const response = await apiFetch(creating ? '/api/admin/users' : `/api/admin/users/${editing!.id}`, {
        method: creating ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(creating
          ? { name: draft.name.trim(), email: draft.email.trim(), role: draft.role, isActive: draft.isActive, initialPassword: draft.initialPassword }
          : { name: draft.name.trim(), email: draft.email.trim(), role: draft.role, isActive: draft.isActive, expectedUpdatedAt: editing!.updatedAt }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(errorMessage(data, 'Unable to save the user.'));
      setSuccess(creating ? 'User created. They must change the initial password at first sign-in.' : 'User details saved.');
      closePanel();
      await loadUsers();
    } catch (reason) {
      setFormError(reason instanceof Error ? reason.message : 'Unable to save the user.');
    } finally {
      setIsSaving(false);
    }
  };

  const resetInitialPassword = async () => {
    if (!editing) return;
    const validationError = validateDraft(true);
    if (validationError) return setFormError(validationError);
    setIsSaving(true);
    setFormError(null);
    try {
      const response = await apiFetch(`/api/admin/users/${editing.id}/initial-password`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ initialPassword: draft.initialPassword, confirmPassword: draft.confirmPassword }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(errorMessage(data, 'Unable to reset the initial password.'));
      setDraft((current) => ({ ...current, initialPassword: '', confirmPassword: '' }));
      setSuccess(`A new initial password was set for ${editing.name}. Their existing sessions have ended.`);
      await loadUsers();
    } catch (reason) {
      setFormError(reason instanceof Error ? reason.message : 'Unable to reset the initial password.');
    } finally {
      setIsSaving(false);
    }
  };

  const applyFilters = (event: FormEvent) => { event.preventDefault(); setPage(1); setSearch(searchInput.trim()); };
  const panelOpen = isCreating || editing !== null;

  return (
    <section aria-labelledby="users-title">
      <div style={styles.header}>
        <div><h1 id="users-title" style={styles.title}>Users</h1><p style={styles.subtitle}>Manage accounts, access roles, and initial passwords.</p></div>
        <button type="button" onClick={startCreate} style={styles.primaryButton}>Create User</button>
      </div>
      {success && <p aria-live="polite" style={styles.success}>{success}</p>}
      <form onSubmit={applyFilters} style={styles.filters}>
        <label style={styles.label}>Search name or email<input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} style={styles.input} /></label>
        <label style={styles.label}>Role<select aria-label="Role filter" value={roleFilter} onChange={(event) => { setRoleFilter(event.target.value); setPage(1); }} style={styles.input}><option value="">All roles</option>{roles.map((role) => <option key={role} value={role}>{role.replace('_', ' ')}</option>)}</select></label>
        <button type="submit" style={styles.secondaryButton}>Search</button>
      </form>
      {isLoading ? <p style={styles.state}>Loading users...</p> : listError ? <div role="alert" style={styles.error}><p>{listError}</p><button type="button" onClick={() => void loadUsers()} style={styles.primaryButton}>Retry</button></div> : users.length === 0 ? <p style={styles.state}>No users match the current filters.</p> : <div className="user-management-list" style={styles.userList}>
        <div aria-hidden="true" className="user-management-list-header" style={styles.listHeader}><strong>Name</strong><strong>Email</strong><strong>Role</strong><strong>Status</strong><span /></div>
        {users.map((user) => <article key={user.id} className="user-management-card" style={styles.userCard}>
          <div><span style={styles.mobileLabel}>Name</span><strong>{user.name}</strong>{user.mustChangePassword && <small style={styles.passwordFlag}>Password change required</small>}</div>
          <div><span style={styles.mobileLabel}>Email</span><span style={styles.wrap}>{user.email}</span></div>
          <div><span style={styles.mobileLabel}>Role</span><span style={styles.roleBadge}>{user.role.replace('_', ' ')}</span></div>
          <div><span style={styles.mobileLabel}>Status</span><span style={user.isActive ? styles.activeBadge : styles.inactiveBadge}>{user.isActive ? 'Active' : 'Inactive'}</span></div>
          <button type="button" onClick={() => startEdit(user)} style={styles.editButton}>Edit</button>
        </article>)}
      </div>}
      {!isLoading && !listError && <nav aria-label="User pagination" style={styles.pagination}><button type="button" disabled={pagination.page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} style={styles.secondaryButton}>Previous page</button><span>{pagination.total} user{pagination.total === 1 ? '' : 's'} · Page {pagination.page} of {pagination.totalPages}</span><button type="button" disabled={pagination.page >= pagination.totalPages} onClick={() => setPage((value) => Math.min(pagination.totalPages, value + 1))} style={styles.secondaryButton}>Next page</button></nav>}
      {panelOpen && <div role="dialog" aria-modal="true" aria-labelledby="user-form-title" style={styles.overlay}><div style={styles.panel}>
        <div style={styles.panelHeader}><h2 id="user-form-title" style={styles.panelTitle}>{isCreating ? 'Create User' : `Edit ${editing!.name}`}</h2><button type="button" onClick={closePanel} aria-label="Close user form" style={styles.closeButton}>×</button></div>
        {formError && <p role="alert" style={styles.formError}>{formError}</p>}
        <form onSubmit={saveUser} style={styles.form}>
          <label style={styles.label}>Name<input required minLength={2} maxLength={100} value={draft.name} onChange={(event) => updateDraft('name', event.target.value)} style={styles.input} /></label>
          <label style={styles.label}>Email<input required type="email" value={draft.email} onChange={(event) => updateDraft('email', event.target.value)} style={styles.input} /></label>
          <label style={styles.label}>Role<select value={draft.role} onChange={(event) => updateDraft('role', event.target.value as UserRole)} style={styles.input}>{roles.map((role) => <option key={role} value={role}>{role.replace('_', ' ')}</option>)}</select></label>
          <label style={styles.checkboxLabel}><input type="checkbox" checked={draft.isActive} onChange={(event) => updateDraft('isActive', event.target.checked)} /> Active account</label>
          {isCreating && <PasswordFields draft={draft} updateDraft={updateDraft} />}
          <div style={styles.actions}><button type="button" onClick={closePanel} style={styles.secondaryButton}>Cancel</button><button type="submit" disabled={isSaving} style={styles.primaryButton}>{isSaving ? 'Saving...' : isCreating ? 'Create User' : 'Save Changes'}</button></div>
        </form>
        {editing && <div style={styles.resetBox}><h3 style={styles.resetTitle}>Set New Initial Password</h3><p style={styles.resetText}>This ends all current sessions and requires the user to change the password at their next sign-in.</p><PasswordFields draft={draft} updateDraft={updateDraft} /><button type="button" disabled={isSaving} onClick={() => void resetInitialPassword()} style={styles.secondaryButton}>{isSaving ? 'Saving...' : 'Set New Initial Password'}</button></div>}
      </div></div>}
    </section>
  );
}

function PasswordFields({ draft, updateDraft }: { draft: Draft; updateDraft: <K extends keyof Draft>(key: K, value: Draft[K]) => void }) {
  return <><label style={styles.label}>Initial Password<input required type="password" minLength={10} value={draft.initialPassword} onChange={(event) => updateDraft('initialPassword', event.target.value)} style={styles.input} /></label><label style={styles.label}>Confirm Password<input required type="password" minLength={10} value={draft.confirmPassword} onChange={(event) => updateDraft('confirmPassword', event.target.value)} style={styles.input} /></label><p style={styles.help}>Use 10–64 characters with at least one letter and one number.</p></>;
}

const styles: Record<string, CSSProperties> = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '20px' }, title: { color: '#006B3C', margin: 0, fontSize: '1.65rem' }, subtitle: { color: '#4B5563', margin: '4px 0 0' }, filters: { display: 'flex', gap: '12px', alignItems: 'end', flexWrap: 'wrap', marginBottom: '18px', padding: '16px', border: '1px solid #E5E7EB', borderRadius: '10px', background: '#FFF' }, label: { display: 'grid', gap: '6px', color: '#374151', fontSize: '.85rem', fontWeight: 600, minWidth: '180px', flex: 1 }, input: { boxSizing: 'border-box', width: '100%', padding: '9px 10px', border: '1px solid #D1D5DB', borderRadius: '7px', fontSize: '.95rem' }, primaryButton: { border: 0, borderRadius: '7px', padding: '10px 14px', background: '#006B3C', color: '#FFF', fontWeight: 700, cursor: 'pointer' }, secondaryButton: { border: '1px solid #006B3C', borderRadius: '7px', padding: '9px 14px', background: '#FFF', color: '#006B3C', fontWeight: 700, cursor: 'pointer' }, success: { padding: '12px 14px', border: '1px solid #B8E2C8', borderRadius: '8px', background: '#EAF6EF', color: '#006B3C' }, state: { padding: '32px', textAlign: 'center', border: '1px solid #E5E7EB', borderRadius: '10px', background: '#FFF', color: '#4B5563' }, error: { padding: '18px', border: '1px solid #FCA5A5', borderRadius: '10px', background: '#FEE2E2', color: '#991B1B' }, userList: { display: 'grid', gap: '8px' }, listHeader: { display: 'grid', gridTemplateColumns: 'minmax(120px,1fr) minmax(180px,1.4fr) minmax(125px,.8fr) minmax(100px,.6fr) auto', gap: '12px', padding: '0 14px', color: '#4B5563', fontSize: '.8rem' }, userCard: { display: 'grid', gridTemplateColumns: 'minmax(120px,1fr) minmax(180px,1.4fr) minmax(125px,.8fr) minmax(100px,.6fr) auto', alignItems: 'center', gap: '12px', padding: '14px', border: '1px solid #E5E7EB', borderRadius: '10px', background: '#FFF' }, mobileLabel: { display: 'block', color: '#6B7280', fontSize: '.72rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '3px' }, wrap: { overflowWrap: 'anywhere' }, roleBadge: { display: 'inline-block', padding: '3px 8px', borderRadius: '12px', background: '#EAF6EF', color: '#006B3C', fontSize: '.75rem', fontWeight: 700 }, activeBadge: { display: 'inline-block', padding: '3px 8px', borderRadius: '12px', background: '#DCFCE7', color: '#166534', fontSize: '.75rem', fontWeight: 700 }, inactiveBadge: { display: 'inline-block', padding: '3px 8px', borderRadius: '12px', background: '#FEE2E2', color: '#991B1B', fontSize: '.75rem', fontWeight: 700 }, passwordFlag: { display: 'block', color: '#92400E', marginTop: '4px' }, editButton: { border: '1px solid #006B3C', borderRadius: '6px', padding: '7px 10px', background: '#FFF', color: '#006B3C', fontWeight: 700, cursor: 'pointer' }, pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '20px', color: '#4B5563' }, overlay: { position: 'fixed', inset: 0, zIndex: 10, display: 'flex', justifyContent: 'flex-end', background: 'rgba(17, 24, 39, .35)' }, panel: { width: 'min(100%, 520px)', minHeight: '100%', boxSizing: 'border-box', padding: '24px', overflowY: 'auto', background: '#FFF', boxShadow: '-4px 0 18px rgba(0,0,0,.16)' }, panelHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '18px' }, panelTitle: { margin: 0, color: '#006B3C' }, closeButton: { border: 0, background: 'transparent', color: '#374151', fontSize: '1.8rem', cursor: 'pointer' }, form: { display: 'grid', gap: '14px' }, checkboxLabel: { display: 'flex', gap: '8px', alignItems: 'center', color: '#374151', fontWeight: 600 }, actions: { display: 'flex', justifyContent: 'flex-end', gap: '10px', flexWrap: 'wrap' }, formError: { padding: '10px 12px', border: '1px solid #FCA5A5', borderRadius: '7px', background: '#FEE2E2', color: '#991B1B' }, resetBox: { display: 'grid', gap: '12px', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #E5E7EB' }, resetTitle: { color: '#374151', margin: 0 }, resetText: { color: '#4B5563', margin: 0, fontSize: '.9rem' }, help: { color: '#6B7280', margin: '-6px 0 0', fontSize: '.8rem' },
};
