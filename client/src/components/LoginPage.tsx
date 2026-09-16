import { useState, type CSSProperties, type FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to sign in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main style={styles.page}>
      <section style={styles.card} aria-labelledby="login-title">
        <h1 id="login-title" style={styles.title}>TokTickIT</h1>
        <p style={styles.subtitle}>Sign in to view and manage your IT support tickets.</p>
        {error && <div role="alert" style={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>
            Email
            <input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required style={styles.input} />
          </label>
          <label style={styles.label}>
            Password
            <input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required style={styles.input} />
          </label>
          <button type="submit" disabled={isSubmitting} style={styles.button}>
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </section>
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  page: { minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '24px', background: '#F5F7F6' },
  card: { width: '100%', maxWidth: '420px', padding: '32px', borderRadius: '12px', background: '#FFF', border: '1px solid #E5E7EB', boxShadow: '0 4px 20px rgba(0, 107, 60, 0.08)' },
  title: { margin: 0, color: '#006B3C', fontSize: '1.75rem' },
  subtitle: { color: '#4B5563', lineHeight: 1.5, margin: '8px 0 24px' },
  form: { display: 'grid', gap: '16px' },
  label: { display: 'grid', gap: '6px', color: '#1F2937', fontSize: '0.875rem', fontWeight: 600 },
  input: { boxSizing: 'border-box', width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '1rem' },
  button: { padding: '11px 16px', border: 0, borderRadius: '8px', background: '#006B3C', color: '#FFF', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer' },
  error: { marginBottom: '16px', padding: '10px 12px', borderRadius: '8px', color: '#991B1B', background: '#FEE2E2', border: '1px solid #FCA5A5' },
};
