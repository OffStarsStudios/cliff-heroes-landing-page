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
    slug: 'introducing-cliff',
    accent: 'teal',
    category: 'ROSTER · NEW HERO',
    readTime: '2 MIN READ',
    byline: 'OFFSTARS STUDIOS',
    title: 'Introducing Cliff',
    shortTitle: 'INTRODUCING CLIFF',
    heroImage: '/assets/hero-cliff.webp',
    heroAlt: 'Cliff, a Speedster hero in a blue jacket',
    lede: 'Meet Cliff, a Speedster built around momentum. Trigger his hyper speed, then keep it alive by evading everything the climb throws at you.',
    content: [
      { type: 'p', text: 'Cliff is a Speedster, which means he trades safety for pace. He rewards players who read obstacles early and commit, rather than reacting late and bleeding momentum.' },
      { type: 'stats', items: [
        { label: 'CLASS', value: 'Speedster' },
        { label: 'RARITY', value: 'Rare', note: 'Rare · Epic · Legendary' }
      ] },
      { type: 'h', text: 'Special Ability' },
      { type: 'p', text: 'Cliff gains hyper speed for a limited time. Every obstacle he successfully evades while it is active adds extra time to the ability, so a clean run keeps him accelerating. String evasions together and it carries him a long way up the wall; miss them and the clock simply runs down.' },
      { type: 'h', text: 'Rarity' },
      { type: 'p', text: 'Cliff is a Rare hero. The current tiers are Rare, Epic and Legendary, and the roster will keep growing as we introduce more heroes here.' },
      { type: 'cta', label: 'JOIN THE WISHLIST', target: '#wishlist' }
    ]
  },
  {
    slug: 'new-climber-guy',
    accent: 'gold',
    category: 'ROSTER · NEW HERO',
    readTime: '2 MIN READ',
    byline: 'OFFSTARS STUDIOS',
    title: 'New Climber: Guy',
    shortTitle: 'NEW CLIMBER: GUY',
    heroImage: '/assets/hero-guy.webp',
    heroAlt: 'Guy, a Control hero wearing a visor',
    lede: 'Meet Guy, a Control hero who fights from above. His heat-seeking missile picks out the nearest opponent and takes health off them.',
    content: [
      { type: 'p', text: 'Where a Speedster wins by out-pacing everyone, Guy wins by making the climb harder for whoever is closest. He is built to pressure rivals rather than outrun them, which makes him a steady pick when the pack is tightly bunched.' },
      { type: 'stats', items: [
        { label: 'CLASS', value: 'Control' },
        { label: 'RARITY', value: 'Rare', note: 'Rare · Epic · Legendary' }
      ] },
      { type: 'h', text: 'Special Ability' },
      { type: 'p', text: 'Guy launches a heat-seeking missile. It tracks the nearest opponent from above and fires on them, and a hit takes 1 HP off that climber. Because it always chooses the closest target, where you sit in the pack decides who it goes after.' },
      { type: 'h', text: 'Rarity' },
      { type: 'p', text: 'Guy is a Rare hero. The current tiers are Rare, Epic and Legendary, and the roster will keep growing as we introduce more heroes here.' },
      { type: 'cta', label: 'JOIN THE WISHLIST', target: '#wishlist' }
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
