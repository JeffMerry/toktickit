import { useCallback, useEffect, useState, type CSSProperties, type FormEvent } from 'react';
import { apiFetch } from '../lib/api';

type PublicComment = { id: number; content: string; createdAt: string; author: { name: string; role: string } };

export function PublicCommentSection({ ticketId }: { ticketId: number }) {
  const [comments, setComments] = useState<PublicComment[]>([]);
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiFetch(`/api/tickets/${ticketId}/public-comments`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to load public comments.');
      setComments(data);
      setError(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to load public comments.');
    } finally {
      setIsLoading(false);
    }
  }, [ticketId]);

  useEffect(() => { void load(); }, [load]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!content.trim()) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await apiFetch(`/api/tickets/${ticketId}/public-comments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: content.trim() }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to add public comment.');
      setContent('');
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to add public comment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section style={styles.card} aria-labelledby="public-comments-title">
      <h3 id="public-comments-title" style={styles.title}>Public Comments</h3>
      <p style={styles.subtitle}>Comments are visible to you and the IT support team.</p>
      {error && <div role="alert" style={styles.error}>{error}</div>}
      {isLoading ? <p>Loading comments...</p> : comments.length ? <div style={styles.list}>{comments.map((comment) => <article key={comment.id} style={styles.comment}><strong>{comment.author.name}</strong><p>{comment.content}</p></article>)}</div> : <p>No public comments yet.</p>}
      <form onSubmit={submit} style={styles.form}>
        <label style={styles.label}>Add Public Comment<textarea value={content} onChange={(event) => setContent(event.target.value)} maxLength={2000} disabled={isSubmitting} style={styles.textarea} /></label>
        <button type="submit" disabled={isSubmitting || !content.trim()} style={styles.button}>Post Comment</button>
      </form>
    </section>
  );
}

const styles: Record<string, CSSProperties> = {
  card: { marginTop: '16px', padding: '24px', border: '1px solid #E5E7EB', borderRadius: '12px', background: '#FFF' }, title: { margin: 0, color: '#006B3C' }, subtitle: { color: '#4B5563', fontSize: '.875rem' }, list: { display: 'grid', gap: '8px' }, comment: { padding: '10px 12px', borderRadius: '7px', background: '#F9FAFB', color: '#374151' }, form: { marginTop: '14px', borderTop: '1px solid #E5E7EB', paddingTop: '12px' }, label: { display: 'grid', gap: '6px', color: '#374151', fontWeight: 700 }, textarea: { minHeight: '72px', padding: '8px', border: '1px solid #D1D5DB', borderRadius: '6px', resize: 'vertical', fontFamily: 'inherit' }, button: { marginTop: '10px', border: 0, borderRadius: '6px', padding: '9px 12px', background: '#006B3C', color: '#FFF', fontWeight: 700, cursor: 'pointer' }, error: { padding: '10px', borderRadius: '6px', background: '#FEE2E2', color: '#991B1B' },
};
