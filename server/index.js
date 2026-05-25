const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;
const TEACHER_PASSWORD = process.env.TEACHER_PASSWORD || 'professor123';

app.use(cors());
app.use(express.json());

app.post('/api/vote', (req, res) => {
  const { chapaNumero } = req.body;
  if (!chapaNumero) {
    return res.status(400).json({ error: 'chapaNumero is required' });
  }
  db.prepare('INSERT INTO votes (chapa_numero) VALUES (?)').run(chapaNumero);
  res.json({ ok: true });
});

app.get('/api/results', (req, res) => {
  const password = req.headers['x-teacher-password'];
  if (password !== TEACHER_PASSWORD) {
    return res.status(401).json({ error: 'Senha incorreta' });
  }
  const rows = db.prepare(
    'SELECT chapa_numero, COUNT(*) as total FROM votes GROUP BY chapa_numero'
  ).all();
  const totalVotes = db.prepare('SELECT COUNT(*) as total FROM votes').get().total;
  res.json({ results: rows, total: totalVotes });
});

app.get('/api/status', (_req, res) => {
  res.json({ open: true });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
