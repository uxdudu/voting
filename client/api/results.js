import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const TEACHER_PASSWORD = (process.env.TEACHER_PASSWORD || 'professor123').trim();

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-teacher-password');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).end();

  if (req.headers['x-teacher-password'] !== TEACHER_PASSWORD) {
    return res.status(401).json({ error: 'Senha incorreta' });
  }

  const { data, error } = await supabase
    .from('votes')
    .select('chapa_numero');

  if (error) return res.status(500).json({ error: error.message });

  const counts = {};
  for (const row of data) {
    counts[row.chapa_numero] = (counts[row.chapa_numero] || 0) + 1;
  }

  const results = Object.entries(counts).map(([chapa_numero, total]) => ({
    chapa_numero,
    total,
  }));

  res.json({ results, total: data.length });
}
