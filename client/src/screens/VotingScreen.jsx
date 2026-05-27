import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { chapas } from '../data/chapas';
import { useAudio } from '../hooks/useAudio';

const DIGIT_COUNT = 4;

// Braille (Brasil) — strings prontas em Unicode
const BRAILLE = {
  '1': '⠼⠁',
  '2': '⠼⠃',
  '3': '⠼⠉',
  '4': '⠼⠙',
  '5': '⠼⠑',
  '6': '⠼⠋',
  '7': '⠼⠛',
  '8': '⠼⠓',
  '9': '⠼⠊',
  '0': '⠼⠚',
  BRANCO: '⠃⠗⠁⠝⠉⠕',
  CORRIGE: '⠉⠕⠗⠗⠊⠛⠑',
  CONFIRMA: '⠉⠕⠝⠋⠊⠗⠍⠁',
};

function Braille({ text, color }) {
  return <span className="braille" style={color ? { color } : undefined} aria-hidden="true">{text}</span>;
}

const PLACEHOLDER_PRES = '/candidatos/placeholder-presidente.jpg';
const PLACEHOLDER_VICE = '/candidatos/vice-placeholder.jpg';

function PlaceholderImg({ src }) {
  return <img className="photo-placeholder-img" src={src} alt="" aria-hidden="true" />;
}

function CandidatePhoto({ foto, nome, fallbackSrc }) {
  const [err, setErr] = useState(false);
  if (err || !foto) return <PlaceholderImg src={fallbackSrc} />;
  return (
    <img className="photo-img" src={foto} alt={nome} onError={() => setErr(true)} />
  );
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
      <circle cx="12" cy="12" r="9.5" stroke="#001325" strokeOpacity="0.7" strokeWidth="1.5" />
      <circle cx="12" cy="8" r="1" fill="#001325" fillOpacity="0.7" />
      <path d="M12 11.5v6" stroke="#001325" strokeOpacity="0.7" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function InfoModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h3>Como votar</h3>
        <p>
          Digite o número de 4 dígitos da chapa escolhida.<br /><br />
          Confira o nome dos candidatos na tela.<br /><br />
          Pressione <strong style={{ color: '#038f4d' }}>CONFIRMA</strong> para registrar seu voto.<br />
          Pressione <strong style={{ color: '#e65100' }}>CORRIGE</strong> para reiniciar.<br />
          Pressione <strong>BRANCO</strong> para votar em branco.
        </p>
        <button onClick={onClose}>Fechar</button>
      </div>
    </div>
  );
}

function NumKey({ digit, onPress }) {
  return (
    <button className="key-num" onPointerDown={() => onPress(digit)}>
      <span className="key-label">{digit}</span>
      <Braille text={BRAILLE[digit]} color="#cfd6da" />
    </button>
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
    ? chapas.find((c) => c.numero === currentNumber)
    : null;
  const isComplete = digits.length === DIGIT_COUNT;
  const isInvalid = isComplete && !chapa;

  const pressDigit = useCallback((d) => {
    if (digits.length >= DIGIT_COUNT) return;
    audio.beepKey();
    const next = [...digits, d];
    setDigits(next);
    if (next.length === DIGIT_COUNT) {
      const found = chapas.find((c) => c.numero === next.join(''));
      if (found) audio.beepEncontrado();
      else audio.beepInvalido();
    }
  }, [digits, audio]);

  const pressCorrige = useCallback(() => {
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
    } catch (_) {}
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
        <div className="urna-content">
          {/* LEFT: container */}
          <div className="urna-left">
            <div className="urna-top-row">
              <p className="urna-eyebrow">Seu voto para</p>
              <button className="urna-info" onClick={() => setShowInfo(true)} aria-label="Informações">
                <InfoIcon />
              </button>
            </div>

            <h1 className="urna-title">Presidente e Vice-Presidente</h1>

            <div className="urna-stack">
              <div className="digit-group">
                <div className="digit-row">
                  {Array.from({ length: DIGIT_COUNT }).map((_, i) => (
                    <div className={`digit-cell${digits[i] != null ? ' filled' : ''}`} key={i}>
                      {digits[i] ?? '0'}
                    </div>
                  ))}
                </div>
                <p className="digit-caption">Número</p>
              </div>

              <div className="photo-row">
                <div className="photo-col">
                  <div className="photo-card">
                    {isComplete && chapa
                      ? <CandidatePhoto foto={chapa.presidente.foto} nome={chapa.presidente.nome} fallbackSrc={PLACEHOLDER_PRES} />
                      : <PlaceholderImg src={PLACEHOLDER_PRES} />}
                  </div>
                  <p className="photo-label">
                    {isComplete && chapa ? chapa.presidente.nome : 'Presidente'}
                  </p>
                </div>
                <div className="photo-col">
                  <div className="photo-card">
                    {isComplete && chapa
                      ? <CandidatePhoto foto={chapa.vice.foto} nome={chapa.vice.nome} fallbackSrc={PLACEHOLDER_VICE} />
                      : <PlaceholderImg src={PLACEHOLDER_VICE} />}
                  </div>
                  <p className="photo-label">
                    {isComplete && chapa ? chapa.vice.nome : 'Vice-Presidente'}
                  </p>
                </div>
              </div>

              {isComplete && isInvalid && (
                <p className="invalid-banner">Número inválido — pressione CORRIGE para tentar novamente</p>
              )}
            </div>

            <div className="urna-footer">
              {isComplete && !isInvalid ? (
                <>
                  <span>Aperte</span>
                  <span className="footer-green">VERDE para confirmar</span>
                  <span>·</span>
                  <span className="footer-orange">CORRIGE para reiniciar</span>
                </>
              ) : (
                <>
                  <span>Digite o número de 4 dígitos</span>
                  <span className="footer-orange">CORRIGE para reiniciar</span>
                </>
              )}
            </div>
          </div>

          {/* RIGHT: keyboard */}
          <div className="urna-right">
            <div className="urna-brand">
              <img src="/logo-eadv.png" alt="Educação Adventista" className="urna-brand-logo" />
            </div>

            <div className="keypad">
              <div className="keypad-grid">
                {['1','2','3','4','5','6','7','8','9'].map((d) => (
                  <NumKey key={d} digit={d} onPress={pressDigit} />
                ))}
              </div>
              <div className="keypad-zero">
                <NumKey digit="0" onPress={pressDigit} />
              </div>

              <div className="keypad-actions">
                <button className="key-action key-branco" onPointerDown={pressBranco}>
                  <span className="key-label-sm">BRANCO</span>
                  <Braille text={BRAILLE.BRANCO} color="#3a3a3a" />
                </button>
                <button className="key-action key-corrige" onPointerDown={pressCorrige}>
                  <span className="key-label-sm">CORRIGE</span>
                  <Braille text={BRAILLE.CORRIGE} color="#5a2a00" />
                </button>
                <button
                  className="key-action key-confirma"
                  onPointerDown={pressConfirma}
                  disabled={!isComplete || isInvalid || sending}
                >
                  <span className="key-label-sm">CONFIRMA</span>
                  <Braille text={BRAILLE.CONFIRMA} color="#0a3a1a" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
