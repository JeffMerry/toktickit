import { useCallback, useEffect, useState, type CSSProperties, type FormEvent } from 'react';
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

type Assignee = ActionPerson;
type ActionForm = { actionOccurredAt: string; description: string; result: string; assigneeId: string; followUpRequired: boolean; followUpNote: string; attachmentNotes: string };

function emptyForm(): ActionForm {
  return { actionOccurredAt: toLocalInputValue(new Date().toISOString()), description: '', result: '', assigneeId: '', followUpRequired: false, followUpNote: '', attachmentNotes: '' };
}

function formFromAction(action: ActionTaken): ActionForm {
  return { actionOccurredAt: toLocalInputValue(action.actionOccurredAt), description: action.description, result: action.result || '', assigneeId: action.assignee ? String(action.assignee.id) : '', followUpRequired: action.followUpRequired, followUpNote: action.followUpNote || '', attachmentNotes: action.attachmentNotes || '' };
}

function toLocalInputValue(value: string) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function ActionsTaken({ ticketId, canManage = false }: { ticketId: number; canManage?: boolean }) {
  const [actions, setActions] = useState<ActionTaken[]>([]);
  const [assignees, setAssignees] = useState<Assignee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assigneeError, setAssigneeError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ActionTaken | null>(null);
  const [form, setForm] = useState<ActionForm>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [completion, setCompletion] = useState<ActionTaken | null>(null);
  const [completionResult, setCompletionResult] = useState('');

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiFetch(`/api/tickets/${ticketId}/actions-taken`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to load Actions Taken.');
      const loadedActions = Array.isArray(data) ? data : [];
      setActions(loadedActions);
      return loadedActions as ActionTaken[];
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to load Actions Taken.');
    } finally {
      setIsLoading(false);
    }
  }, [ticketId]);

  useEffect(() => { void load(); }, [load]);

  const loadAssignees = useCallback(async () => {
    if (!canManage) return;
    setAssigneeError(null);
    try {
      const response = await apiFetch('/api/staff/action-assignees');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to load eligible assignees.');
      setAssignees(Array.isArray(data) ? data : []);
    } catch (reason) {
      setAssigneeError(reason instanceof Error ? reason.message : 'Unable to load eligible assignees.');
    }
  }, [canManage]);

  useEffect(() => { void loadAssignees(); }, [loadAssignees]);

  const retryAll = async () => {
    await Promise.all([load(), loadAssignees()]);
  };

  const closeForm = () => {
    if (isSubmitting) return;
    setShowForm(false);
    setEditing(null);
    setForm(emptyForm());
    setFormError(null);
  };

  const reloadEditing = async () => {
    setFormError(null);
    const latest = await load();
    if (editing && latest) {
      const refreshed = latest.find((action) => action.id === editing.id);
      if (refreshed) {
        setEditing(refreshed);
        setForm(formFromAction(refreshed));
      }
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setFormError(null);
    setShowForm(true);
  };

  const openEdit = (action: ActionTaken) => {
    setEditing(action);
    setForm(formFromAction(action));
    setFormError(null);
    setShowForm(true);
  };

  const submitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.description.trim()) return setFormError('Action description is required.');
    if (form.followUpRequired && !form.followUpNote.trim()) return setFormError('Follow-up note is required when follow-up is enabled.');
    setIsSubmitting(true);
    setFormError(null);
    try {
      const payload = {
        actionOccurredAt: new Date(form.actionOccurredAt).toISOString(),
        description: form.description.trim(),
        result: form.result.trim() || undefined,
        assigneeId: form.assigneeId ? Number(form.assigneeId) : null,
        followUpRequired: form.followUpRequired,
        followUpNote: form.followUpRequired ? form.followUpNote.trim() : '',
        attachmentNotes: form.attachmentNotes.trim() || undefined,
        ...(editing ? { expectedUpdatedAt: editing.updatedAt } : {}),
      };
      const path = editing ? `/api/staff/actions-taken/${editing.id}` : `/api/staff/tickets/${ticketId}/actions-taken`;
      const response = await apiFetch(path, { method: editing ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || (response.status === 409 ? 'This Action Taken has changed. Reload the latest action before retrying.' : 'Unable to save the Action Taken.'));
      closeForm();
      await load();
    } catch (reason) {
      setFormError(reason instanceof Error ? reason.message : 'Unable to save the Action Taken.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const transition = async (action: ActionTaken, status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED', result?: string) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await apiFetch(`/api/staff/actions-taken/${action.id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status, expectedUpdatedAt: action.updatedAt, ...(result ? { result } : {}) }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || (response.status === 409 ? 'This Action Taken has changed. Reload the latest action before retrying.' : 'Unable to update the Action Taken.'));
      setCompletion(null);
      setCompletionResult('');
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to update the Action Taken.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section aria-labelledby="actions-taken-title" style={styles.section}>
      <div style={styles.header}>
        <div>
          <h2 id="actions-taken-title" style={styles.title}>Actions Taken</h2>
          <p style={styles.subtitle}>Recorded work and its follow-up details for this ticket.</p>
        </div>
        {canManage ? <button type="button" onClick={openCreate} disabled={isSubmitting} style={styles.primaryButton}>Add Action Taken</button> : null}
      </div>

      {isLoading ? <p style={styles.state}>Loading Actions Taken...</p> : null}
      {error ? (
        <div role="alert" style={styles.error}>
          <p style={{ margin: 0 }}>{error}</p>
          <button type="button" onClick={() => void retryAll()} style={styles.retry}>Retry</button>
        </div>
      ) : null}
      {!isLoading && !error && actions.length === 0 ? <p style={styles.empty}>No actions have been recorded for this ticket.</p> : null}
      {showForm ? <ActionFormPanel form={form} assignees={assignees} assigneeError={assigneeError} editing={editing} isSubmitting={isSubmitting} error={formError} onChange={setForm} onCancel={closeForm} onReload={() => void reloadEditing()} onRetryAssignees={() => void loadAssignees()} onSubmit={submitForm} /> : null}
      {!isLoading && !error && actions.length > 0 ? (
        <div style={styles.list}>
          {actions.map((action) => <ActionCard key={action.id} action={action} canManage={canManage} isSubmitting={isSubmitting} isCompleting={completion?.id === action.id} completionResult={completionResult} onEdit={() => openEdit(action)} onStart={() => void transition(action, 'IN_PROGRESS')} onCancel={() => void transition(action, 'CANCELLED')} onShowCompletion={() => { setCompletion(action); setCompletionResult(action.result || ''); }} onCompletionResultChange={setCompletionResult} onConfirmCompletion={() => void transition(action, 'COMPLETED', completionResult.trim())} onDismissCompletion={() => { setCompletion(null); setCompletionResult(''); }} />)}
        </div>
      ) : null}
    </section>
  );
}

function ActionCard({ action, canManage, isSubmitting, isCompleting, completionResult, onEdit, onStart, onCancel, onShowCompletion, onCompletionResultChange, onConfirmCompletion, onDismissCompletion }: { action: ActionTaken; canManage: boolean; isSubmitting: boolean; isCompleting: boolean; completionResult: string; onEdit: () => void; onStart: () => void; onCancel: () => void; onShowCompletion: () => void; onCompletionResultChange: (value: string) => void; onConfirmCompletion: () => void; onDismissCompletion: () => void }) {
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
      {canManage ? <ActionControls action={action} isSubmitting={isSubmitting} isCompleting={isCompleting} completionResult={completionResult} onEdit={onEdit} onStart={onStart} onCancel={onCancel} onShowCompletion={onShowCompletion} onCompletionResultChange={onCompletionResultChange} onConfirmCompletion={onConfirmCompletion} onDismissCompletion={onDismissCompletion} /> : null}
    </article>
  );
}

function ActionControls({ action, isSubmitting, isCompleting, completionResult, onEdit, onStart, onCancel, onShowCompletion, onCompletionResultChange, onConfirmCompletion, onDismissCompletion }: { action: ActionTaken; isSubmitting: boolean; isCompleting: boolean; completionResult: string; onEdit: () => void; onStart: () => void; onCancel: () => void; onShowCompletion: () => void; onCompletionResultChange: (value: string) => void; onConfirmCompletion: () => void; onDismissCompletion: () => void }) {
  const terminal = action.status === 'COMPLETED' || action.status === 'CANCELLED';
  return <div style={styles.controls}>
    {action.status !== 'CANCELLED' ? <button type="button" onClick={onEdit} disabled={isSubmitting} style={styles.secondaryButton}>Edit Action</button> : null}
    {action.status === 'PLANNED' ? <button type="button" onClick={onStart} disabled={isSubmitting} style={styles.secondaryButton}>Start</button> : null}
    {!terminal ? <button type="button" onClick={onShowCompletion} disabled={isSubmitting} style={styles.primaryButton}>Complete</button> : null}
    {!terminal ? <button type="button" onClick={onCancel} disabled={isSubmitting} style={styles.cancelButton}>Cancel Action</button> : null}
    {isCompleting ? <div style={styles.completionPanel}><label style={styles.label}>Completion result<textarea value={completionResult} onChange={(event) => onCompletionResultChange(event.target.value)} maxLength={2000} disabled={isSubmitting} style={styles.textarea} /></label><div style={styles.buttonRow}><button type="button" onClick={onConfirmCompletion} disabled={isSubmitting || !completionResult.trim()} style={styles.primaryButton}>Confirm completion</button><button type="button" onClick={onDismissCompletion} disabled={isSubmitting} style={styles.secondaryButton}>Cancel</button></div></div> : null}
  </div>;
}

function ActionFormPanel({ form, assignees, assigneeError, editing, isSubmitting, error, onChange, onCancel, onReload, onRetryAssignees, onSubmit }: { form: ActionForm; assignees: Assignee[]; assigneeError: string | null; editing: ActionTaken | null; isSubmitting: boolean; error: string | null; onChange: (form: ActionForm) => void; onCancel: () => void; onReload: () => void; onRetryAssignees: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  const update = <K extends keyof ActionForm>(key: K, value: ActionForm[K]) => onChange({ ...form, [key]: value });
  return <form onSubmit={onSubmit} style={styles.form} aria-label={editing ? 'Edit Action Taken' : 'Add Action Taken'}>
    <h3 style={styles.formTitle}>{editing ? 'Edit Action Taken' : 'Add Action Taken'}</h3>
    {error ? <div role="alert" style={styles.error}><p style={{ margin: 0 }}>{error}</p><button type="button" onClick={onReload} style={styles.retry}>Reload latest action</button></div> : null}
    <label style={styles.label}>Action date and time<input required type="datetime-local" value={form.actionOccurredAt} onChange={(event) => update('actionOccurredAt', event.target.value)} disabled={isSubmitting} style={styles.input} /></label>
    <label style={styles.label}>Action description<textarea required value={form.description} onChange={(event) => update('description', event.target.value)} maxLength={2000} disabled={isSubmitting} style={styles.textarea} /></label>
    <label style={styles.label}>Result <span style={styles.optional}>(required when completing)</span><textarea value={form.result} onChange={(event) => update('result', event.target.value)} maxLength={2000} disabled={isSubmitting} style={styles.textarea} /></label>
    <label style={styles.label}>Assignee<select aria-label="Assignee" value={form.assigneeId} onChange={(event) => update('assigneeId', event.target.value)} disabled={isSubmitting || editing?.status === 'COMPLETED'} style={styles.input}><option value="">Unassigned</option>{assignees.map((assignee) => <option key={assignee.id} value={assignee.id}>{personLabel(assignee, '')}</option>)}</select>{editing?.status === 'COMPLETED' ? <span style={styles.optional}>Assignee is read-only after completion.</span> : null}</label>
    {assigneeError ? <div role="alert" style={styles.assigneeError}><span>{assigneeError} You can still save this Action as unassigned.</span><button type="button" onClick={onRetryAssignees} style={styles.retry}>Retry assignee lookup</button></div> : null}
    <label style={styles.checkLabel}><input type="checkbox" checked={form.followUpRequired} onChange={(event) => update('followUpRequired', event.target.checked)} disabled={isSubmitting} /> Follow-up required</label>
    {form.followUpRequired ? <label style={styles.label}>Follow-up note<textarea required value={form.followUpNote} onChange={(event) => update('followUpNote', event.target.value)} maxLength={2000} disabled={isSubmitting} style={styles.textarea} /></label> : null}
    <label style={styles.label}>Attachment notes <span style={styles.optional}>(optional)</span><textarea value={form.attachmentNotes} onChange={(event) => update('attachmentNotes', event.target.value)} maxLength={1000} disabled={isSubmitting} style={styles.textarea} /></label>
    <div style={styles.buttonRow}><button type="submit" disabled={isSubmitting} style={styles.primaryButton}>{isSubmitting ? 'Saving...' : 'Save Action'}</button><button type="button" onClick={onCancel} disabled={isSubmitting} style={styles.secondaryButton}>Cancel</button></div>
  </form>;
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
  assigneeError: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', padding: '10px', border: '1px solid #FDE68A', borderRadius: '8px', background: '#FFFBEB', color: '#92400E', fontSize: '.85rem' },
  retry: { border: '1px solid #991B1B', borderRadius: '6px', padding: '7px 10px', background: '#FFF', color: '#991B1B', fontWeight: 700, cursor: 'pointer' },
  primaryButton: { border: 0, borderRadius: '6px', padding: '9px 12px', background: '#006B3C', color: '#FFF', fontWeight: 700, cursor: 'pointer' },
  secondaryButton: { border: '1px solid #9CA3AF', borderRadius: '6px', padding: '8px 11px', background: '#FFF', color: '#374151', fontWeight: 700, cursor: 'pointer' },
  cancelButton: { border: '1px solid #B45309', borderRadius: '6px', padding: '8px 11px', background: '#FFF7ED', color: '#9A3412', fontWeight: 700, cursor: 'pointer' },
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
  controls: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '14px' },
  completionPanel: { width: '100%', marginTop: '6px', padding: '12px', borderRadius: '8px', border: '1px solid #B8E2C8', background: '#F0FDF4' },
  form: { marginBottom: '16px', padding: '16px', border: '1px solid #B8E2C8', borderRadius: '10px', background: '#F8FCF9' },
  formTitle: { margin: '0 0 12px', color: '#006B3C', fontSize: '1.05rem' },
  label: { display: 'grid', gap: '6px', margin: '12px 0', color: '#374151', fontWeight: 700, fontSize: '.9rem' },
  checkLabel: { display: 'flex', gap: '8px', alignItems: 'center', margin: '12px 0', color: '#374151', fontWeight: 700, fontSize: '.9rem' },
  optional: { color: '#6B7280', fontWeight: 400 },
  input: { boxSizing: 'border-box', width: '100%', padding: '8px', border: '1px solid #D1D5DB', borderRadius: '6px', background: '#FFF', font: 'inherit' },
  textarea: { boxSizing: 'border-box', width: '100%', minHeight: '76px', padding: '8px', border: '1px solid #D1D5DB', borderRadius: '6px', background: '#FFF', font: 'inherit', resize: 'vertical' },
  buttonRow: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' },
};
