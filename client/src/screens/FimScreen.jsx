import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function FimScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => navigate('/'), 4000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="fim-screen">
      <div className="fim-text">FIM</div>
    </div>
  );
}
