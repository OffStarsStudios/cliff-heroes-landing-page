/* ============================================================
   POST /api/subscribe — wishlist signup -> Brevo contact
   Runs as a Vercel serverless function (Node runtime, zero deps).
   Keeps the Brevo API key server-side; the browser only ever
   talks to this endpoint.

   Env vars (Vercel project settings):
     BREVO_API_KEY   Brevo API v3 key
     BREVO_LIST_ID   numeric contact-list id (optional but recommended)
   ============================================================ */

var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  var body = req.body || {};
  var email = String(body.email || '').trim().toLowerCase();
  var hp = String(body.hp || '');

  // Honeypot filled -> almost certainly a bot. Pretend success, store nothing.
  if (hp) return res.status(200).json({ ok: true });

  if (!EMAIL_RE.test(email) || email.length > 254) {
    return res.status(400).json({ ok: false, error: 'Invalid email' });
  }

  if (!process.env.BREVO_API_KEY) {
    // Deploy-time misconfiguration; never expose details to the client.
    console.error('BREVO_API_KEY is not set');
    return res.status(502).json({ ok: false, error: 'Subscription unavailable' });
  }

  var utm = body.utm && typeof body.utm === 'object' ? body.utm : {};
  var clean = function (v) { return String(v || '').slice(0, 120); };

  var payload = {
    email: email,
    updateEnabled: true, // re-subscribing the same email updates instead of failing
    attributes: {
      SOURCE: clean(body.source) || 'website',
      SIGNUP_PAGE: clean(body.page) || '/',
      SIGNUP_DATE: new Date().toISOString().slice(0, 10),
      UTM_SOURCE: clean(utm.source),
      UTM_MEDIUM: clean(utm.medium),
      UTM_CAMPAIGN: clean(utm.campaign)
    }
  };
  var listId = parseInt(process.env.BREVO_LIST_ID, 10);
  if (!isNaN(listId)) payload.listIds = [listId];

  function send(body) {
    return fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        // trimmed: pasted env values often carry a trailing newline/space,
        // which Brevo rejects as unauthorized
        'api-key': (process.env.BREVO_API_KEY || '').trim()
      },
      body: JSON.stringify(body)
    });
  }

  // 201 = created, 204 = updated an existing contact
  var ok = function (s) { return s === 201 || s === 204; };

  try {
    var brevo = await send(payload);
    if (ok(brevo.status)) return res.status(200).json({ ok: true });

    var detail = await brevo.text();

    // Brevo rejects attributes that have not been defined in the account.
    // Losing a signup over a missing custom field would be the worst
    // outcome, so retry once with just the email + list membership.
    if (brevo.status === 400 && /attribut/i.test(detail)) {
      console.warn('Brevo rejected attributes, retrying bare:', detail.slice(0, 200));
      var bare = { email: email, updateEnabled: true };
      if (payload.listIds) bare.listIds = payload.listIds;
      var retry = await send(bare);
      if (ok(retry.status)) return res.status(200).json({ ok: true, degraded: true });
      detail = await retry.text();
    }

    console.error('Brevo rejected signup:', brevo.status, detail.slice(0, 300));
    // TEMPORARY setup diagnostic: surfaces the upstream status/code so the
    // integration can be verified without digging through runtime logs.
    // Remove once the first real signup lands.
    if (req.query && req.query.diag === '1') {
      var code = '';
      try { code = (JSON.parse(detail) || {}).code || ''; } catch (e) {}
      // Key shape only — never the key. The fingerprint is a one-way hash,
      // used solely to tell whether a redeploy picked up a changed value.
      var raw = (process.env.BREVO_API_KEY || '').trim();
      var fp = require('crypto').createHash('sha256').update(raw).digest('hex').slice(0, 8);
      return res.status(502).json({
        ok: false,
        error: 'Subscription failed',
        brevoStatus: brevo.status,
        brevoCode: code,
        keyLen: raw.length,
        keyPrefix: raw.slice(0, 8),
        looksLikeBase64Blob: raw.slice(0, 3) === 'eyJ',
        keyFingerprint: fp,
        listId: process.env.BREVO_LIST_ID || '(unset)'
      });
    }
    return res.status(502).json({ ok: false, error: 'Subscription failed' });
  } catch (err) {
    console.error('Brevo request failed:', err);
    return res.status(502).json({ ok: false, error: 'Subscription failed' });
  }
};
