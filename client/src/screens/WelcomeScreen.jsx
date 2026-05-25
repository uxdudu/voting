import { useNavigate } from 'react-router-dom';

export default function WelcomeScreen() {
  const navigate = useNavigate();

  return (
    <div className="welcome-screen" onClick={() => navigate('/votar')}>
      <div className="welcome-tse">ESCOLA ADVENTISTA ZONA 7</div>
      <div className="welcome-title">URNA ELETRÔNICA</div>
      <div className="welcome-subtitle">Eleição da Turma • 5º Ano</div>
      <div className="welcome-cta">TOQUE PARA VOTAR</div>
    </div>
  );
}
