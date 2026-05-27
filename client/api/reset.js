import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const TEACHER_PASSWORD = (process.env.TEACHER_PASSWORD || 'professor123').trim();

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-teacher-password');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  if (req.headers['x-teacher-password'] !== TEACHER_PASSWORD) {
    return res.status(401).json({ error: 'Senha incorreta' });
  }

  const { error } = await supabase.from('votes').delete().neq('id', 0);
  if (error) return res.status(500).json({ error: error.message });

  res.json({ ok: true });
}
