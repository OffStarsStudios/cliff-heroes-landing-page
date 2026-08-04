/* ============================================================
   Cliff Heroes — article records

   Two collections, both rendered by the same overlay:
     CLIFF_HEROES_NEWS     dark panel,  /news/<slug>
     CLIFF_HEROES_FEATURES light panel, /game/<slug>
   The cards in index.html are the pre-rendered card view of
   these records (kept static so they stay indexable without JS).

   `content` is an ordered list of blocks so each article can
   place its article-specific block wherever it belongs:
     { type: 'p',     text }
     { type: 'h',     text }   subheading
     { type: 'quote', text }
     { type: 'label', text }
     { type: 'notes', items: [text] }
     { type: 'waves', items: [{ label, region, count }] }
     { type: 'cta',   label, target }
     { type: 'kit',   portrait, abilities: [{ label, name, desc }] }
   ============================================================ */
window.CLIFF_HEROES_NEWS = [
  {
    slug: 'coming-soon',
    accent: 'primary',
    category: 'ANNOUNCEMENT · COMING SOON',
    readTime: '2 MIN READ',
    byline: 'OFFSTARS STUDIOS',
    title: 'Cliff Heroes Is Coming Soon',
    shortTitle: 'COMING SOON',
    heroImage: '/assets/news-coming-soon.webp',
    heroAlt: 'Pedro the Alchemist with the Cliff Heroes logo and a coming soon banner',
    lede: 'Four climbers, one shifting wall, and a race to the summit. Cliff Heroes is in development for mobile, and the wishlist is open.',
    content: [
      { type: 'p', text: 'Cliff Heroes is a real-time PvP climbing game. Four players take on the same procedurally-shifting ascent at once, reading the wall and chaining grips to reach the peak first. Every climber carries a kit, so the fastest route is rarely the safest one.' },
      { type: 'p', text: 'We are still building, and we would rather show it when it is genuinely ready than ship a rushed first impression. In the meantime the roster, the abilities and the maps are all taking shape, and we will post here as pieces land.' },
      { type: 'p', text: 'Wishlist members get early access first, straight to their inbox. No spam, and you can unsubscribe any time.' },
      { type: 'cta', label: 'JOIN THE WISHLIST', target: '#wishlist' }
    ]
  },
  {
    slug: 'season-0-closed-beta',
    accent: 'teal',
    category: 'ANNOUNCEMENT · JUN 04',
    readTime: '3 MIN READ',
    byline: 'OFFSTARS STUDIOS',
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
    byline: 'OFFSTARS STUDIOS',
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

/* ---------- Feature articles (light panel, /game/<slug>) ---------- */
window.CLIFF_HEROES_FEATURES = [
  {
    slug: 'race-to-the-summit',
    accent: 'teal',
    category: 'REAL-TIME PVP',
    readTime: '2 MIN READ',
    byline: 'OFFSTARS STUDIOS',
    title: 'Race to the Summit',
    shortTitle: 'RACE TO THE SUMMIT',
    heroImage: '/assets/feature-climber.webp',
    heroAlt: 'A climber scaling the wall',
    lede: 'Cliff Heroes is a fast-paced multiplayer climbing game where heroes race up dangerous cliffs filled with obstacles, traps and rival climbers.',
    content: [
      { type: 'p', text: 'Swipe between lanes, jump over hazards and react quickly as the climb becomes faster and more challenging. Reach the top before your opponents, or be the last hero still climbing.' },
      { type: 'h', text: 'Choose Your Hero' },
      { type: 'p', text: 'Every hero has a different personality, playstyle and special ability. Some heroes can protect themselves from obstacles, while others gain speed, disrupt opponents or create opportunities to take the lead.' },
      { type: 'p', text: 'As you play, you can unlock new heroes, upgrade them and discover the ability that best fits your strategy.' },
      { type: 'h', text: 'Explore New Arenas' },
      { type: 'p', text: 'Progress through a collection of unique arenas, each featuring a different environment, visual style and set of challenges. Higher arenas introduce tougher climbs, better rewards and new obstacles to master.' },
      { type: 'cta', label: 'JOIN THE WISHLIST', target: '#wishlist' }
    ]
  },
  {
    slug: 'heroes-and-abilities',
    accent: 'primary',
    category: 'ABILITIES',
    readTime: '2 MIN READ',
    byline: 'OFFSTARS STUDIOS',
    title: 'Heroes & Abilities',
    shortTitle: 'HEROES & ABILITIES',
    heroImage: '/assets/feature-saboteur.webp',
    heroAlt: 'A hero deploying an ability on the climb',
    lede: 'Every hero brings a different ability to the wall, and knowing when to spend it is often what decides the climb.',
    content: [
      { type: 'p', text: 'No two heroes play the same way. Some are built to protect themselves and shrug off obstacles that would stop anyone else. Others trade safety for raw speed, disrupt the climbers around them, or open up a window to take the lead at exactly the right moment.' },
      { type: 'h', text: 'Build Your Roster' },
      { type: 'p', text: 'Unlock new heroes as you play, upgrade the ones you like, and work out which ability actually fits the way you climb. A hero that feels unbeatable in one arena can be the wrong pick in the next.' },
      { type: 'p', text: 'The roster is still growing, and we will introduce heroes here as they are ready.' },
      { type: 'cta', label: 'JOIN THE WISHLIST', target: '#wishlist' }
    ]
  }
];
