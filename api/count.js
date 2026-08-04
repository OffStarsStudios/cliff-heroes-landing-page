/* ============================================================
   GET /api/count — live wishlist size from Brevo
   Returns { count } for the configured list, or { count: null }
   if it cannot be determined. Never exposes the API key.

   Cached at Vercel's edge so the page never waits on Brevo and
   we stay well inside Brevo's rate limits.
   ============================================================ */

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ count: null });
  }

  // Serve from the edge for 5 min; keep serving stale for a day on error.
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=86400');

  var key = (process.env.BREVO_API_KEY || '').trim();
  var listId = parseInt(process.env.BREVO_LIST_ID, 10);
  if (!key || isNaN(listId)) return res.status(200).json({ count: null });

  try {
    var r = await fetch('https://api.brevo.com/v3/contacts/lists/' + listId, {
      headers: { 'accept': 'application/json', 'api-key': key }
    });
    if (!r.ok) {
      console.error('Brevo list lookup failed:', r.status);
      return res.status(200).json({ count: null });
    }
    var data = await r.json();
    var count = typeof data.uniqueSubscribers === 'number'
      ? data.uniqueSubscribers
      : data.totalSubscribers;
    return res.status(200).json({ count: typeof count === 'number' ? count : null });
  } catch (err) {
    console.error('Brevo list lookup error:', err);
    return res.status(200).json({ count: null });
  }
};
