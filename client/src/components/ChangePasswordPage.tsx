import { useState, type CSSProperties, type FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';

export function ChangePasswordPage() {
  const { changePassword, logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation must match.');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await changePassword(currentPassword, newPassword);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to change password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main style={styles.page}>
      <section style={styles.card} aria-labelledby="change-password-title">
        <h1 id="change-password-title" style={styles.title}>Set a new password</h1>
        <p style={styles.subtitle}>For your account security, you must change the temporary password before continuing.</p>
        {error && <div role="alert" style={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Current password<input type="password" autoComplete="current-password" required value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} style={styles.input} /></label>
          <label style={styles.label}>New password<input type="password" autoComplete="new-password" required minLength={10} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} style={styles.input} /></label>
          <label style={styles.label}>Confirm new password<input type="password" autoComplete="new-password" required minLength={10} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} style={styles.input} /></label>
          <button type="submit" disabled={isSubmitting} style={styles.button}>{isSubmitting ? 'Saving...' : 'Save new password'}</button>
        </form>
        <button type="button" onClick={() => void logout()} style={styles.logout}>Sign out</button>
      </section>
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  page: { minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '24px', background: '#F5F7F6' },
  card: { width: '100%', maxWidth: '440px', padding: '32px', borderRadius: '12px', background: '#FFF', border: '1px solid #E5E7EB', boxShadow: '0 4px 20px rgba(0, 107, 60, 0.08)' },
  title: { margin: 0, color: '#006B3C', fontSize: '1.6rem' },
  subtitle: { color: '#4B5563', lineHeight: 1.5, margin: '8px 0 24px' },
  form: { display: 'grid', gap: '16px' },
  label: { display: 'grid', gap: '6px', color: '#1F2937', fontSize: '0.875rem', fontWeight: 600 },
  input: { boxSizing: 'border-box', width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '1rem' },
  button: { padding: '11px 16px', border: 0, borderRadius: '8px', background: '#006B3C', color: '#FFF', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer' },
  logout: { marginTop: '16px', border: 0, background: 'transparent', color: '#006B3C', fontWeight: 600, cursor: 'pointer' },
  error: { marginBottom: '16px', padding: '10px 12px', borderRadius: '8px', color: '#991B1B', background: '#FEE2E2', border: '1px solid #FCA5A5' },
};
