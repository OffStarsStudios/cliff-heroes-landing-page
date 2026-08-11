/* ============================================================
   GET /api/geo — is this visitor in a region that requires
   prior consent before analytics cookies may be set?

   Vercel resolves the client IP to a country at the edge and
   passes it as x-vercel-ip-country. We return only a boolean
   plus the country code; no IP is read, logged or stored.

   MUST NOT be cached: the answer differs per visitor, and a
   shared cache would hand one country's verdict to everyone.
   ============================================================ */

// EU 27 + the three non-EU EEA states + the UK. Switzerland is included
// too: its revised FADP tracks the GDPR closely enough that treating Swiss
// visitors as consent-required costs nothing and avoids a judgement call.
var CONSENT_REQUIRED = [
  'AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IE',
  'IT','LV','LT','LU','MT','NL','PL','PT','RO','SK','SI','ES','SE',
  'IS','LI','NO',
  'GB',
  'CH'
];

module.exports = function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ eu: true });
  }

  res.setHeader('Cache-Control', 'no-store');

  var country = String(req.headers['x-vercel-ip-country'] || '').toUpperCase();

  // No country header means local dev or an unresolvable IP. Default to
  // requiring consent — showing a banner to someone who did not need one is
  // harmless; skipping it for someone who did is not.
  var eu = !country || CONSENT_REQUIRED.indexOf(country) !== -1;

  return res.status(200).json({ eu: eu, country: country || null });
};
