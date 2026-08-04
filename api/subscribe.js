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

  try {
    var brevo = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': process.env.BREVO_API_KEY
      },
      body: JSON.stringify(payload)
    });

    // 201 = created, 204 = updated existing contact
    if (brevo.status === 201 || brevo.status === 204) {
      return res.status(200).json({ ok: true });
    }

    var detail = await brevo.text();
    console.error('Brevo rejected signup:', brevo.status, detail.slice(0, 300));
    return res.status(502).json({ ok: false, error: 'Subscription failed' });
  } catch (err) {
    console.error('Brevo request failed:', err);
    return res.status(502).json({ ok: false, error: 'Subscription failed' });
  }
};
