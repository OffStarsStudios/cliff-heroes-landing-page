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

/* Brevo echoes the submitted address back in some error bodies. These logs
   land in Vercel's platform logs, whose retention we do not control, so
   anything email-shaped is masked before it gets there. */
function redact(text) {
  return String(text).replace(/[^\s@"'<>]+@[^\s@"'<>]+\.[^\s@"',}<>]+/g, '<email redacted>');
}

/* Second line of defence behind the Vercel WAF rate-limit rule, which is the
   real one: this counter lives in a single warm instance's memory, so it is
   reset by cold starts and not shared across instances or regions. It still
   blunts the common case — one script hammering one endpoint — at no cost.
   The cap is deliberately loose so shared office/CGNAT addresses are not
   caught out by a handful of genuine signups. */
var WINDOW_MS = 10 * 60 * 1000;
var MAX_PER_WINDOW = 10;
var hits = new Map();

function throttled(ip) {
  if (!ip) return false;
  var now = Date.now();

  // Prune expired entries so the map cannot grow without bound on a
  // long-lived instance.
  if (hits.size > 5000) {
    hits.forEach(function (v, k) { if (now - v.start > WINDOW_MS) hits.delete(k); });
  }

  var rec = hits.get(ip);
  if (!rec || now - rec.start > WINDOW_MS) {
    hits.set(ip, { start: now, count: 1 });
    return false;
  }
  rec.count += 1;
  return rec.count > MAX_PER_WINDOW;
}

function clientIp(req) {
  var fwd = String(req.headers['x-forwarded-for'] || '');
  return fwd.split(',')[0].trim() || String(req.headers['x-real-ip'] || '') || '';
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  if (throttled(clientIp(req))) {
    res.setHeader('Retry-After', '600');
    return res.status(429).json({ ok: false, error: 'Too many attempts' });
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

  var attributes = {
    SOURCE: clean(body.source) || 'website',
    SIGNUP_PAGE: clean(body.page) || '/',
    SIGNUP_DATE: new Date().toISOString().slice(0, 10),
    UTM_SOURCE: clean(utm.source),
    UTM_MEDIUM: clean(utm.medium),
    UTM_CAMPAIGN: clean(utm.campaign)
  };

  var listId = parseInt(process.env.BREVO_LIST_ID, 10);
  var doiTemplate = parseInt(process.env.BREVO_DOI_TEMPLATE_ID, 10);

  /* Double opt-in turns on by itself once BREVO_DOI_TEMPLATE_ID is set.
     Brevo requires includeListIds for the DOI flow, so a list id is needed
     too; without both we stay on single opt-in rather than half-applying it.
     Until then behaviour is exactly as before. */
  var useDoi = !isNaN(doiTemplate) && !isNaN(listId);

  // Fixed rather than derived from the Host header: this URL is baked into an
  // email, and a spoofed Host would turn the confirmation link into an open
  // redirect pointing wherever the caller liked.
  var site = (process.env.SITE_URL || 'https://cliffheroes.com').replace(/\/$/, '');

  var endpoint, payload, bare;
  if (useDoi) {
    endpoint = 'https://api.brevo.com/v3/contacts/doubleOptinConfirmation';
    payload = {
      email: email,
      includeListIds: [listId],
      templateId: doiTemplate,
      redirectionUrl: site + '/confirmed',
      attributes: attributes
    };
    bare = {
      email: email,
      includeListIds: [listId],
      templateId: doiTemplate,
      redirectionUrl: site + '/confirmed'
    };
  } else {
    endpoint = 'https://api.brevo.com/v3/contacts';
    payload = {
      email: email,
      updateEnabled: true, // re-subscribing the same email updates instead of failing
      attributes: attributes
    };
    bare = { email: email, updateEnabled: true };
    if (!isNaN(listId)) {
      payload.listIds = [listId];
      bare.listIds = [listId];
    }
  }

  function send(body) {
    return fetch(endpoint, {
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

  // 201 = created (and the DOI flow's only success code), 204 = updated
  var ok = function (s) { return s === 201 || s === 204; };

  try {
    var brevo = await send(payload);
    if (ok(brevo.status)) return res.status(200).json({ ok: true, doi: useDoi });

    var detail = await brevo.text();

    // Brevo rejects attributes that have not been defined in the account.
    // Losing a signup over a missing custom field would be the worst
    // outcome, so retry once with just the email + list membership.
    if (brevo.status === 400 && /attribut/i.test(detail)) {
      console.warn('Brevo rejected attributes, retrying bare:', redact(detail.slice(0, 200)));
      var retry = await send(bare);
      if (ok(retry.status)) return res.status(200).json({ ok: true, doi: useDoi, degraded: true });
      detail = await retry.text();
    }

    console.error('Brevo rejected signup:', brevo.status, redact(detail.slice(0, 300)));
    return res.status(502).json({ ok: false, error: 'Subscription failed' });
  } catch (err) {
    console.error('Brevo request failed:', err);
    return res.status(502).json({ ok: false, error: 'Subscription failed' });
  }
};
