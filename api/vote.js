import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { chapaNumero } = req.body;
  if (!chapaNumero) return res.status(400).json({ error: 'chapaNumero is required' });

  const { error } = await supabase.from('votes').insert({ chapa_numero: chapaNumero });
  if (error) return res.status(500).json({ error: error.message });

  res.json({ ok: true });
}
