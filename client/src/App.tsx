import React, { useState } from 'react';

interface Category {
  id: number;
  name: string;
}

function App() {
  const [status, setStatus] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const checkSystem = async () => {
    setLoading(true);
    setError(null);
    setStatus(null);
    setCategories([]);

    try {
      const [healthRes, catRes] = await Promise.all([
        fetch('http://localhost:5000/api/health'),
        fetch('http://localhost:5000/api/categories'),
      ]);

      if (!healthRes.ok || !catRes.ok) {
        throw new Error('API request failed');
      }

      const healthData = await healthRes.json();
      const categoriesData = await catRes.json();

      if (healthData.status === 'ok') {
        setStatus('Online');
        setCategories(categoriesData);
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

        {loading && <p className="text-secondary fs-5">loading...</p>}

        {!loading && status && (
          <div className="mt-3">
            <h5 className="mb-3">
              System Status: <span className={status === 'Online' ? 'text-success fw-bold' : 'text-danger fw-bold'}>{status}</span>
            </h5>

            {status === 'Online' && categories.length > 0 && (
              <div className="mt-4">
                <h6 className="fw-bold mb-2">Supported Request Categories:</h6>
                <ul className="list-group list-group-flush border rounded bg-white">
                  {categories.map((cat) => (
                    <li key={cat.id} className="list-group-item">
                      {cat.id}. {cat.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {error && <p className="text-danger mt-2">{error}</p>}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
