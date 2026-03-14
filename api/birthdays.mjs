const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;
const APPS_SCRIPT_CLIENT_KEY = process.env.APPS_SCRIPT_CLIENT_KEY;

const json = (res, status, payload) => {
  res.status(status).setHeader('Content-Type', 'application/json').send(JSON.stringify(payload));
};

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return json(res, 405, { error: 'Method not allowed' });
  }

  if (!APPS_SCRIPT_URL) {
    return json(res, 500, { error: 'Server misconfigured: APPS_SCRIPT_URL missing' });
  }

  const { action, userId, id, input } = req.body || {};
  if (!action || typeof action !== 'string') {
    return json(res, 400, { error: 'Missing action' });
  }
  if (typeof userId !== 'string' || userId.trim().length < 6 || userId.trim().length > 80) {
    return json(res, 400, { error: 'Invalid access ID. Use 6-80 characters.' });
  }

  try {
    const upstream = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action,
        userId: userId.trim(),
        ...(id ? { id } : {}),
        ...(input ? { input } : {}),
        ...(APPS_SCRIPT_CLIENT_KEY ? { clientKey: APPS_SCRIPT_CLIENT_KEY } : {}),
      }),
    });

    const text = await upstream.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return json(res, 502, { error: `Apps Script returned invalid JSON: ${text.slice(0, 200)}` });
    }

    if (!upstream.ok || data?.error) {
      return json(res, 502, { error: data?.error || `Apps Script error (${upstream.status})` });
    }

    return json(res, 200, data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upstream request failed';
    return json(res, 500, { error: message });
  }
}
