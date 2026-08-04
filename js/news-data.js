/* ============================================================
   Cliff Heroes — news article records
   Single source for the article overlay. The news cards in
   index.html are the pre-rendered card view of these same
   records (kept static so they stay indexable without JS).

   `content` is an ordered list of blocks so each article can
   place its article-specific block wherever it belongs:
     { type: 'p',     text }
     { type: 'quote', text }
     { type: 'label', text }
     { type: 'notes', items: [text] }
     { type: 'waves', items: [{ label, region, count }] }
     { type: 'cta',   label, target }
     { type: 'kit',   portrait, abilities: [{ label, name, desc }] }
   ============================================================ */
window.CLIFF_HEROES_NEWS = [
  {
    slug: 'dev-log-07-spire-reworked',
    accent: 'primary',
    category: 'PATCH 0.7 · JUN 18',
    readTime: '4 MIN READ',
    byline: 'ASCENDER STUDIOS',
    title: 'Dev Log #07 — The Spire, Reworked',
    shortTitle: 'DEV LOG #07',
    heroLabel: 'ARTICLE HERO — 1600 × 900',
    lede: "New grip physics, a taller spire and near-instant match resets land in this week's build — here is everything that changed on the wall.",
    content: [
      { type: 'p', text: 'The Spire has been our most-played map since the first playtest, and also the one you complained about most. Holds were too forgiving near the top, so every match collapsed into the same three routes. We rebuilt the upper third from scratch: 40 metres taller, three viable finishes, and a wind band that pushes climbers off the obvious line.' },
      { type: 'p', text: 'Grip is now a continuous value instead of a binary state. Hold too long and your fingers fatigue, forcing a re-grip that costs momentum — which means saboteurs finally have a window that rewards patience over spam.' },
      { type: 'quote', text: "“If two climbers reach the summit the same way twice, the map still isn't finished.”" },
      { type: 'label', text: '// PATCH NOTES' },
      { type: 'notes', items: [
        'Spire height increased to 180 m; three new summit approaches.',
        'Grip fatigue replaces hold-timers — re-grip costs 0.4 s of momentum.',
        'Match reset trimmed from 11 s to 3 s between rounds.',
        'Smoke bomb radius −15%; trap arm time −0.2 s.'
      ] }
    ]
  },
  {
    slug: 'season-0-closed-beta',
    accent: 'teal',
    category: 'ANNOUNCEMENT · JUN 04',
    readTime: '3 MIN READ',
    byline: 'ASCENDER STUDIOS',
    title: 'Season 0 Closed Beta Opens',
    shortTitle: 'SEASON 0 CLOSED BETA',
    heroLabel: 'ARTICLE HERO — 1600 × 900',
    lede: 'Wishlist members get the first keys. Invites roll out region by region through July, and every wave doubles in size.',
    content: [
      { type: 'p', text: 'Season 0 is a real season, not a stress test: ranked ladders, the full 12-climber roster, and a battle pass that carries into launch. We are starting small so matchmaking stays tight — expect queues under 30 seconds in every active region.' },
      { type: 'p', text: 'Keys arrive by email, tied to the address on your wishlist. No streamer embargo, no NDA — record it, clip it, tell us what breaks.' },
      { type: 'waves', items: [
        { label: 'WAVE 01 · JUN 12', region: 'EU + UK', count: '5,000 keys' },
        { label: 'WAVE 02 · JUN 26', region: 'NA + LATAM', count: '12,000 keys' },
        { label: 'WAVE 03 · JUL 10', region: 'APAC + OCE', count: 'Open cap' }
      ] },
      { type: 'cta', label: 'JOIN THE WISHLIST', target: '#wishlist' }
    ]
  },
  {
    slug: 'pedro-the-alchemist',
    accent: 'gold',
    category: 'ROSTER · MAY 22',
    readTime: '5 MIN READ',
    byline: 'ASCENDER STUDIOS',
    title: 'New Climber: Pedro the Alchemist',
    shortTitle: 'NEW CLIMBER: PEDRO',
    heroLabel: 'CLIMBER KEY ART — 1600 × 900',
    lede: 'A support-saboteur who turns the whole wall into a smoke-screen. Here is the kit, and how to play against it.',
    content: [
      { type: 'kit', portrait: 'CLIMBER\nPORTRAIT', abilities: [
        { label: 'PASSIVE · REAGENTS', name: 'Brews a charge every 12 m climbed', desc: 'Height is his ammo — camping the base leaves him empty.' },
        { label: 'Q · SMOKE FLASK', name: 'Blinds a 6 m column for 4 seconds', desc: 'Hides holds, not climbers — audio still gives you away.' },
        { label: 'R · TRANSMUTE', name: 'Turns one hold into a slick surface', desc: 'One-shot per round and it marks him on the minimap.' }
      ] },
      { type: 'p', text: 'Pedro is the first climber built around denial rather than speed. In testing, teams that ran him won 8% more matches on The Spire and 4% fewer on open faces — he needs walls to work with. Counterplay: rush the first 40 m before he has charges, or bring a climber who can re-route.' }
    ]
  }
];
