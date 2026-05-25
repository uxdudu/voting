import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { chapas } from '../data/chapas';
import { useAudio } from '../hooks/useAudio';

const DIGIT_COUNT = 4;

function SilhouetteIcon() {
  return (
    <svg width="80" height="96" viewBox="0 0 80 96" fill="#aaa" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="26" r="18" />
      <ellipse cx="40" cy="78" rx="32" ry="24" />
    </svg>
  );
}

function CandidatePhoto({ foto, nome }) {
  const [err, setErr] = useState(false);
  if (err) return <div className="candidate-photo-placeholder"><SilhouetteIcon /></div>;
  return (
    <img
      className="candidate-photo"
      src={foto}
      alt={nome}
      onError={() => setErr(true)}
    />
  );
}

function InfoModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <h3>Como votar</h3>
        <p>
          Digite o número de 4 dígitos da chapa escolhida.<br /><br />
          Confira o nome dos candidatos na tela.<br /><br />
          Pressione <strong style={{ color: '#2e7d32' }}>CONFIRMA</strong> para registrar seu voto.<br />
          Pressione <strong style={{ color: '#e65100' }}>LARANJA</strong> para recomeçar.<br />
          Pressione <strong>BRANCO</strong> para votar em branco.
        </p>
        <button onClick={onClose}>Fechar</button>
      </div>
    </div>
  );
}

export default function VotingScreen() {
  const navigate = useNavigate();
  const audio = useAudio();
  const [digits, setDigits] = useState([]);
  const [showInfo, setShowInfo] = useState(false);
  const [sending, setSending] = useState(false);

  const currentNumber = digits.join('');
  const chapa = currentNumber.length === DIGIT_COUNT
    ? chapas.find(c => c.numero === currentNumber)
    : null;
  const isComplete = digits.length === DIGIT_COUNT;
  const isInvalid = isComplete && !chapa;

  const pressDigit = useCallback((d) => {
    if (digits.length >= DIGIT_COUNT) return;
    audio.beepKey();
    const next = [...digits, d];
    setDigits(next);
    if (next.length === DIGIT_COUNT) {
      const found = chapas.find(c => c.numero === next.join(''));
      if (found) audio.beepEncontrado();
      else audio.beepInvalido();
    }
  }, [digits, audio]);

  const pressCorrige = useCallback(() => {
    if (digits.length === 0) return;
    audio.beepCorrige();
    setDigits(prev => prev.slice(0, -1));
  }, [digits, audio]);

  const pressLaranja = useCallback(() => {
    audio.beepCorrige();
    setDigits([]);
  }, [audio]);

  async function submitVote(chapaNumero) {
    if (sending) return;
    setSending(true);
    new Audio('/confirma.mp3').play().catch(() => audio.beepConfirmar());
    try {
      await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chapaNumero }),
      });
    } catch (_) {
      // offline fallback — still navigate to FIM
    }
    navigate('/fim');
  }

  const pressConfirma = useCallback(() => {
    if (!isComplete || isInvalid || sending) return;
    submitVote(currentNumber);
  }, [isComplete, isInvalid, sending, currentNumber]);

  const pressBranco = useCallback(() => {
    if (sending) return;
    audio.beepBranco();
    submitVote('branco');
  }, [sending, audio]);

  return (
    <>
      {showInfo && <InfoModal onClose={() => setShowInfo(false)} />}
      <div className="urna">
        <div className="urna-header urna-header--hidden" />
        <div className="urna-body">
          {/* Screen */}
          <div className="urna-screen">
            <button className="info-btn" onClick={() => setShowInfo(true)}>i</button>
            <div className="urna-label">Seu voto para</div>
            <div className="urna-cargo">Presidente e<br />Vice-Presidente</div>

            <div className="digit-row">
              <span className="digit-label">Número:</span>
              <div className="digit-boxes">
                {Array.from({ length: DIGIT_COUNT }).map((_, i) => (
                  <div className="digit-box" key={i}>
                    {digits[i] ?? ''}
                  </div>
                ))}
              </div>
            </div>

            {/* Candidate display */}
            {!isComplete && (
              <div className="candidate-section">
                <div className="candidate-card">
                  <div className="role-label">Presidente</div>
                  <div className="candidate-row">
                    <div className="candidate-photo-placeholder"><SilhouetteIcon /></div>
                    <div className="candidate-info">
                      <div className="empty-nome">—</div>
                    </div>
                  </div>
                </div>
                <div className="candidate-card">
                  <div className="role-label">Vice-Presidente</div>
                  <div className="candidate-row">
                    <div className="candidate-photo-placeholder"><SilhouetteIcon /></div>
                    <div className="candidate-info">
                      <div className="empty-nome">—</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {isComplete && isInvalid && (
              <div className="invalid-state">
                <div className="candidate-photo-placeholder"><SilhouetteIcon /></div>
                <div>
                  <div className="invalid-text">Número inválido</div>
                  <div style={{ fontSize: 12, color: '#555', marginTop: 4 }}>
                    Pressione LARANJA para tentar novamente
                  </div>
                </div>
              </div>
            )}

            {isComplete && chapa && (
              <div className="candidate-section">
                <div className="candidate-card">
                  <div className="role-label">Presidente</div>
                  <div className="candidate-row">
                    <CandidatePhoto foto={chapa.presidente.foto} nome={chapa.presidente.nome} />
                    <div className="candidate-info">
                      <div className="nome">{chapa.presidente.nome}</div>
                      <div className="chapa-nome">{chapa.nome}</div>
                    </div>
                  </div>
                </div>
                <div className="candidate-card">
                  <div className="role-label">Vice-Presidente</div>
                  <div className="candidate-row">
                    <CandidatePhoto foto={chapa.vice.foto} nome={chapa.vice.nome} />
                    <div className="candidate-info">
                      <div className="nome">{chapa.vice.nome}</div>
                      <div className="chapa-nome">{chapa.nome}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="urna-instructions">
              {isComplete && !isInvalid && (
                <>Aperte a tecla: <strong>VERDE para CONFIRMAR</strong> este voto ·{' '}
                  <span className="orange-key">LARANJA para REINICIAR</span></>
              )}
              {(!isComplete || isInvalid) && (
                <>Digite o número de 4 dígitos da chapa · <span className="orange-key">LARANJA para REINICIAR</span></>
              )}
            </div>
          </div>

          {/* Keyboard */}
          <div className="urna-keyboard">
            <div className="key-grid">
              {['1','2','3','4','5','6','7','8','9'].map(d => (
                <button key={d} className="key" onPointerDown={() => pressDigit(d)}>{d}</button>
              ))}
              <button className="key" onPointerDown={() => pressDigit('0')}>0</button>
            </div>
            <button className="key key-corrige" onPointerDown={pressCorrige}>CORRIGE</button>
            <button className="key key-branco" onPointerDown={pressBranco}>BRANCO</button>
            <button
              className="key key-confirma"
              onPointerDown={pressConfirma}
              disabled={!isComplete || isInvalid || sending}
            >
              CONFIRMA
            </button>
            <button className="key key-laranja" onPointerDown={pressLaranja}>LARANJA</button>
          </div>
        </div>
      </div>
    </>
  );
}
