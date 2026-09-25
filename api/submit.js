// TF ENERGY SRL — Vercel Serverless Function v4
// Saves to Google Sheet + triggers email to info@tfenergy.it

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwhv18aTF6TaO6HPtw5WZdaa8kdqPG4pq3kYQAhcbver4MtY-pMsY7pTji64oJFqrg4/exec';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const data = req.body || {};

    const params = new URLSearchParams();
    params.append('timestamp', data.timestamp || new Date().toISOString());
    params.append('nome',      data.nome      || '');
    params.append('email',     data.email     || '');
    params.append('telefono',  data.telefono  || '');
    params.append('localita',  data.localita  || '');
    params.append('prodotto',  data.prodotto  || '');
    params.append('messaggio', data.messaggio || '');
    params.append('lingua',    data.lingua    || 'it');
    params.append('sendEmail', 'true');  // tell Apps Script to send email too

    console.log('[TF ENERGY SRL] Forwarding to Apps Script:', Object.fromEntries(params));

    const gsRes = await fetch(APPS_SCRIPT_URL, {
      method:   'POST',
      body:     params,
      headers:  { 'Content-Type': 'application/x-www-form-urlencoded' },
      redirect: 'follow'
    });

    const text = await gsRes.text();
    console.log('[TF ENERGY SRL] Apps Script response:', text);

    return res.status(200).json({ status: 'success', response: text });

  } catch (err) {
    console.error('[TF ENERGY SRL] Error:', err.message);
    return res.status(500).json({ status: 'error', message: err.message });
  }
};
