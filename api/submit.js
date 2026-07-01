// Vercel Serverless Function — TF ENERGY SRL Form Relay
// Receives JSON from the contact form, forwards to Google Apps Script
// Deployed automatically by Vercel when placed in /api folder

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxEVc674f5Tph61Cw5cmh4yfGfvYktJTy_9DWrDp5CVeodjrEJWsaqb4WTUnH63WGU/exec';

export default async function handler(req, res) {
  // Allow CORS from any origin (your Vercel site)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = req.body;

    // Build URLSearchParams for Apps Script
    const params = new URLSearchParams();
    params.append('timestamp', data.timestamp || new Date().toISOString());
    params.append('nome',      data.nome      || '');
    params.append('email',     data.email     || '');
    params.append('telefono',  data.telefono  || '');
    params.append('localita',  data.localita  || '');
    params.append('prodotto',  data.prodotto  || '');
    params.append('messaggio', data.messaggio || '');
    params.append('lingua',    data.lingua    || 'it');

    // POST to Google Apps Script — server-to-server, no CORS issues
    const gsRes = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      body: params,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      redirect: 'follow'
    });

    const text = await gsRes.text();
    return res.status(200).json({ status: 'success', gs: text });

  } catch (err) {
    console.error('TF ENERGY SRL submit error:', err);
    return res.status(500).json({ status: 'error', message: err.message });
  }
}
