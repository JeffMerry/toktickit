import { useState } from 'react';
import { apiFetch } from '../lib/api';

export function RequesterResolutionIndication({
  ticketId,
  requesterResolvedAt,
  onRecorded,
}: {
  ticketId: number;
  requesterResolvedAt?: string | null;
  onRecorded: () => Promise<void> | void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recordedAt, setRecordedAt] = useState<string | null>(requesterResolvedAt ?? null);

  const indicateResolution = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await apiFetch(`/api/tickets/${ticketId}/resolution-indication`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to record your indication.');
      setRecordedAt(data.requesterResolvedAt);
      await onRecorded();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to record your indication.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (recordedAt) {
    return (
      <section aria-label="Resolution advisory" style={styles.card}>
        <strong style={styles.title}>Resolution advisory recorded</strong>
        <p style={styles.text}>You indicated that the problem appears resolved on {new Date(recordedAt).toLocaleString()}. IT Staff must still formally review the ticket.</p>
      </section>
    );
  }

  return (
    <section aria-label="Resolution advisory" style={styles.card}>
      <strong style={styles.title}>Is the problem resolved?</strong>
      <p style={styles.text}>Tell IT Staff that the problem appears resolved. This is an advisory only and does not change the formal ticket status.</p>
      {error && <p role="alert" style={styles.error}>{error}</p>}
      <button type="button" onClick={() => void indicateResolution()} disabled={isSubmitting} style={styles.button}>
        {isSubmitting ? 'Recording indication...' : 'Problem appears resolved'}
      </button>
    </section>
  );
}

const styles = {
  card: { padding: '16px', border: '1px solid #A7D7B8', borderRadius: '10px', background: '#F0FDF4' },
  title: { color: '#006B3C' },
  text: { margin: '8px 0 12px', color: '#374151' },
  error: { margin: '0 0 12px', color: '#991B1B' },
  button: { border: 0, borderRadius: '6px', padding: '9px 12px', background: '#006B3C', color: '#FFF', fontWeight: 700, cursor: 'pointer' },
};
