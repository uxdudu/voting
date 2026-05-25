import { useState } from 'react';
import { chapas } from '../data/chapas';

export default function ResultsScreen() {
  const [password, setPassword] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/results', {
        headers: { 'x-teacher-password': password },
      });
      if (res.status === 401) {
        setError('Senha incorreta. Tente novamente.');
        setLoading(false);
        return;
      }
      const data = await res.json();
      setResults(data);
    } catch (_) {
      setError('Erro ao conectar ao servidor.');
    }
    setLoading(false);
  }

  if (!results) {
    return (
      <div className="results-screen">
        <form className="login-form" onSubmit={handleLogin}>
          <h2>Painel do Professor</h2>
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoFocus
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Verificando...' : 'Entrar'}
          </button>
          {error && <div className="login-error">{error}</div>}
        </form>
      </div>
    );
  }

  const { total } = results;

  function getCount(numero) {
    const row = results.results.find(r => r.chapa_numero === numero);
    return row ? row.total : 0;
  }

  const brancosCount = getCount('branco');

  return (
    <div className="results-screen">
      <div className="results-title">Resultado da Eleição</div>
      <div className="results-total">Total de votos: {total}</div>
      <table className="results-table">
        <thead>
          <tr>
            <th>Nº</th>
            <th>Chapa</th>
            <th>Presidente</th>
            <th>Vice-Presidente</th>
            <th>Votos</th>
            <th>%</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {chapas.map(c => {
            const count = getCount(c.numero);
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <tr key={c.numero}>
                <td>{c.numero}</td>
                <td>{c.nome}</td>
                <td>{c.presidente.nome}</td>
                <td>{c.vice.nome}</td>
                <td><strong>{count}</strong></td>
                <td>{pct}%</td>
                <td>
                  <div className="results-bar-wrap">
                    <div className="results-bar" style={{ width: `${pct}%` }} />
                  </div>
                </td>
              </tr>
            );
          })}
          <tr>
            <td>—</td>
            <td colSpan={3}><em>Votos em branco</em></td>
            <td><strong>{brancosCount}</strong></td>
            <td>{total > 0 ? Math.round((brancosCount / total) * 100) : 0}%</td>
            <td>
              <div className="results-bar-wrap">
                <div
                  className="results-bar"
                  style={{
                    width: `${total > 0 ? Math.round((brancosCount / total) * 100) : 0}%`,
                    background: '#888',
                  }}
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <button
        onClick={() => setResults(null)}
        style={{ padding: '8px 18px', background: '#1a237e', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13 }}
      >
        Sair
      </button>
    </div>
  );
}
