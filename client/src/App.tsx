import React, { useState } from 'react';

function App() {
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const checkSystem = async () => {
    setLoading(true);
    setError(null);
    setStatus(null);

    try {
      const response = await fetch('http://localhost:5000/api/health');
      if (!response.ok) {
        throw new Error('Backend response was not ok');
      }
      const data = await response.json();
      if (data.status === 'ok') {
        setStatus('Online');
      } else {
        setStatus('Offline');
        setError('Unexpected backend status');
      }
    } catch (err) {
      setStatus('Offline');
      setError('Unable to connect to TokTickIT API');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <header className="pb-3 mb-4 border-bottom">
        <span className="fs-3 fw-bold text-success">
          <i className="bi bi-ticket-perforated me-2"></i>TokTickIT IT Service Desk
        </span>
      </header>
      <main className="p-4 bg-light rounded-3 border">
        <div className="mb-3">
          <button
            id="check-system-btn"
            className="btn btn-primary"
            onClick={checkSystem}
            disabled={loading}
          >
            {loading ? 'Checking...' : 'Check System'}
          </button>
        </div>

        {loading && <p className="text-secondary">loading...</p>}

        {status && (
          <div className="mt-3">
            <h5>
              System Status: <span className={status === 'Online' ? 'text-success fw-bold' : 'text-danger fw-bold'}>{status}</span>
            </h5>
            {error && <p className="text-danger mt-1">{error}</p>}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
