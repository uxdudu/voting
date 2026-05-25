import { Routes, Route } from 'react-router-dom';
import WelcomeScreen from './screens/WelcomeScreen';
import VotingScreen from './screens/VotingScreen';
import FimScreen from './screens/FimScreen';
import ResultsScreen from './screens/ResultsScreen';

export default function App() {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Routes>
        <Route path="/" element={<WelcomeScreen />} />
        <Route path="/votar" element={<VotingScreen />} />
        <Route path="/fim" element={<FimScreen />} />
        <Route path="/resultados" element={<ResultsScreen />} />
      </Routes>
    </div>
  );
}
