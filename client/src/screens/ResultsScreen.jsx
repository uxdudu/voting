import { useState, useEffect } from 'react';
import { chapas } from '../data/chapas';

function ChapaCard({ chapa, count, total }) {
  const pct = total > 0 ? ((count / total) * 100).toFixed(2) : '0.00';
  const [presErr, setPresErr] = useState(false);
  const [viceErr, setViceErr] = useState(false);

  return (
    <div className="result-card">
      <div className="result-card-photos">
        <div className="result-photo-wrap">
          <div className="result-photo-badge-wrap">
            <div className="result-photo-circle">
              {presErr
                ? <div className="result-photo-fallback"><SilhouetteIcon /></div>
                : <img src={chapa.presidente.foto} alt={chapa.presidente.nome} className="result-photo" onError={() => setPresErr(true)} />}
            </div>
            <span className="result-numero-badge">{chapa.numero}</span>
          </div>
          <span className="result-photo-role">Presidente</span>
        </div>
        <div className="result-photo-wrap result-photo-vice">
          <div className="result-photo-circle">
            {viceErr
              ? <div className="result-photo-fallback"><SilhouetteIcon /></div>
              : <img src={chapa.vice.foto} alt={chapa.vice.nome} className="result-photo" onError={() => setViceErr(true)} />}
          </div>
          <span className="result-photo-role">Vice</span>
        </div>
      </div>

      <div className="result-pct">{pct}%</div>
      <div className="result-votes">{count.toLocaleString('pt-BR')} {count === 1 ? 'voto' : 'votos'}</div>

      <div className="result-bar-wrap">
        <div className="result-bar-fill" style={{ width: `${pct}%` }} />
      </div>

      <div className="result-names">
        <span className="result-name-pres">{chapa.presidente.nome}</span>
        <span className="result-name-vice">{chapa.vice.nome}</span>
      </div>
    </div>
  );
}

function BrancoCard({ count, total }) {
  const pct = total > 0 ? ((count / total) * 100).toFixed(2) : '0.00';
  return (
    <div className="result-card result-card--branco">
      <div className="result-card-photos">
        <div className="result-photo-wrap">
          <div className="result-photo-fallback result-photo-branco">
            <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="40" cy="40" r="40" fill="#e0e0e0"/>
              <text x="40" y="52" textAnchor="middle" fontSize="32" fill="#888">—</text>
            </svg>
          </div>
        </div>
      </div>
      <div className="result-pct result-pct--branco">{pct}%</div>
      <div className="result-votes">{count.toLocaleString('pt-BR')} {count === 1 ? 'voto' : 'votos'}</div>
      <div className="result-bar-wrap">
        <div className="result-bar-fill result-bar-fill--branco" style={{ width: `${pct}%` }} />
      </div>
      <div className="result-names">
        <span className="result-name-pres">Voto em Branco</span>
      </div>
    </div>
  );
}

function SilhouetteIcon() {
  return (
    <svg viewBox="0 0 80 80" fill="#aaa" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40" r="40" fill="#ddd"/>
      <circle cx="40" cy="28" r="14" fill="#aaa"/>
      <ellipse cx="40" cy="68" rx="24" ry="18" fill="#aaa"/>
    </svg>
  );
}

function ConfirmModal({ onConfirm, onCancel, loading }) {
  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3>Resetar todos os votos?</h3>
        <p>Esta ação apagará <strong>todos os votos</strong> do banco de dados e não pode ser desfeita.</p>
        <div className="modal-actions">
          <button className="modal-btn-cancel" onClick={onCancel} disabled={loading}>Cancelar</button>
          <button className="modal-btn-confirm" onClick={onConfirm} disabled={loading}>
            {loading ? 'Resetando...' : 'Sim, resetar'}
          </button>
        </div>
      </div>
    </div>
  );
}

const SESSION_KEY = 'admin_pwd';

export default function ResultsScreen() {
  const [password, setPassword] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetMsg, setResetMsg] = useState('');

  useEffect(() => {
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (saved) fetchResults(saved);
  }, []);

  async function fetchResults(pwd) {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/results', {
        headers: { 'x-teacher-password': pwd },
      });
      if (res.status === 401) {
        sessionStorage.removeItem(SESSION_KEY);
        setError('Senha incorreta.');
        setLoading(false);
        return;
      }
      const data = await res.json();
      sessionStorage.setItem(SESSION_KEY, pwd);
      setPassword(pwd);
      setResults(data);
    } catch {
      setError('Erro ao conectar ao servidor.');
    }
    setLoading(false);
  }

  async function handleLogin(e) {
    e.preventDefault();
    fetchResults(password);
  }

  async function handleReset() {
    setResetting(true);
    try {
      const res = await fetch('/api/reset', {
        method: 'POST',
        headers: { 'x-teacher-password': password },
      });
      if (res.status === 401) { setShowConfirm(false); setResetting(false); return; }
      const refreshed = await fetch('/api/results', {
        headers: { 'x-teacher-password': password },
      });
      const data = await refreshed.json();
      setResults(data);
      setResetMsg('Votos resetados com sucesso.');
      setTimeout(() => setResetMsg(''), 3000);
    } catch {
      setResetMsg('Erro ao resetar.');
    }
    setShowConfirm(false);
    setResetting(false);
  }

  if (!results) {
    return (
      <div className="results-screen">
        <form className="login-form" onSubmit={handleLogin}>
          <h2>Painel do Professor</h2>
          <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} autoFocus />
          <button type="submit" disabled={loading}>{loading ? 'Verificando...' : 'Entrar'}</button>
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
  const sorted = [...chapas].sort((a, b) => getCount(b.numero) - getCount(a.numero));

  return (
    <div className="results-screen results-screen--cards">
      {showConfirm && (
        <ConfirmModal
          onConfirm={handleReset}
          onCancel={() => setShowConfirm(false)}
          loading={resetting}
        />
      )}

      <div className="results-header">
        <div>
          <h2 className="results-title">Resultado da Eleição</h2>
          <p className="results-total">Total de votos apurados: <strong>{total}</strong></p>
        </div>
        <div className="results-actions">
          {resetMsg && <span className="reset-msg">{resetMsg}</span>}
          <button className="btn-reset" onClick={() => setShowConfirm(true)}>Resetar Votos</button>
          <button className="results-logout" onClick={() => { sessionStorage.removeItem(SESSION_KEY); setResults(null); setPassword(''); }}>Sair</button>
        </div>
      </div>

      <div className="results-grid">
        {sorted.map((c, i) => (
          <ChapaCard key={c.numero} chapa={c} count={getCount(c.numero)} total={total} rank={i} />
        ))}
        <BrancoCard count={brancosCount} total={total} />
      </div>
    </div>
  );
}
