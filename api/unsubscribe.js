/* ============================================================
   POST /api/unsubscribe — remove someone from the wishlist

   Brevo puts an unsubscribe link in every campaign automatically,
   but a person who confirms their address and then changes their
   mind before the first campaign goes out has nothing to click.
   This is the always-available route, linked from the confirmation
   email, the confirmation page, the footer and the privacy policy.

   Blacklists rather than deletes: the suppression record is what
   stops the address being re-added by a later import, and it is
   what the privacy policy says we keep. Erasure is a separate
   request to the contact address.

   Env vars: BREVO_API_KEY
   ============================================================ */

// Same rule as api/subscribe.js — if these drift, one endpoint accepts
// addresses the other rejects.
var EMAIL_RE = /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,}$/;

function redact(text) {
  return String(text).replace(/[^\s@"'<>]+@[^\s@"'<>]+\.[^\s@"',}<>]+/g, '<email redacted>');
}

var WINDOW_MS = 10 * 60 * 1000;
var MAX_PER_WINDOW = 10;
var hits = new Map();

function throttled(ip) {
  if (!ip) return false;
  var now = Date.now();
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
    return res.status(405).json({ ok: false });
  }

  if (throttled(clientIp(req))) {
    res.setHeader('Retry-After', '600');
    return res.status(429).json({ ok: false, error: 'Too many attempts' });
  }

  var email = String((req.body || {}).email || '').trim().toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return res.status(400).json({ ok: false, error: 'Invalid email' });
  }

  var key = (process.env.BREVO_API_KEY || '').trim();
  if (!key) {
    console.error('BREVO_API_KEY is not set');
    return res.status(502).json({ ok: false, error: 'Unsubscribe unavailable' });
  }

  try {
    var r = await fetch('https://api.brevo.com/v3/contacts/' + encodeURIComponent(email) +
                        '?identifierType=email_id', {
      method: 'PUT',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': key
      },
      body: JSON.stringify({ emailBlacklisted: true })
    });

    // 204 = updated. 404 = we never had them, which from the person's point of
    // view is the same outcome: they are not subscribed. Reporting the
    // difference would turn this form into a way to test who is on the list.
    if (r.status === 204 || r.status === 404) {
      return res.status(200).json({ ok: true });
    }

    var detail = await r.text();
    console.error('Brevo unsubscribe failed:', r.status, redact(detail.slice(0, 300)));
    return res.status(502).json({ ok: false, error: 'Unsubscribe failed' });
  } catch (err) {
    console.error('Brevo unsubscribe request failed:', err && err.message);
    return res.status(502).json({ ok: false, error: 'Unsubscribe failed' });
  }
};
