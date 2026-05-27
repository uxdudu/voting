import { useNavigate } from 'react-router-dom';

export default function WelcomeScreen() {
  const navigate = useNavigate();

  return (
    <div className="welcome-screen" onClick={() => navigate('/votar')}>
      <div className="welcome-watermark" aria-hidden="true">
        <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg">
          <path d="M380 -50 L40 800 L160 800 L460 50 Z M520 50 L820 800 L700 800 L420 100 Z M280 500 L520 500 L470 620 L260 620 Z"
            fill="#ffffff" fillOpacity="0.06" />
        </svg>
      </div>

      <div className="welcome-content">
        <div className="welcome-text">
          <h1 className="welcome-title">Eleição da Turma 5º ano</h1>
          <p className="welcome-subtitle">Escola Adventista Zona 7</p>
        </div>
        <button className="welcome-button" type="button">TOQUE PARA VOTAR</button>
      </div>
    </div>
  );
}
