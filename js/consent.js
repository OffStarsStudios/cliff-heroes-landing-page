/* ============================================================
   Cliff Heroes — analytics consent

   Google Analytics sets cookies, so under ePrivacy it needs prior
   consent from visitors in the EEA, the UK and Switzerland. Everyone
   else is measured without a banner.

   How the gating works: index.html still defines the gtag() stub and
   pushes js/config into dataLayer. Those are array pushes — no network
   request, no cookie. Nothing is transmitted until gtag.js itself is
   injected, which only happens here once analytics is allowed. Because
   config is already queued in the right order, events fired before the
   decision are replayed correctly if consent is then granted.
   ============================================================ */
(function () {
  'use strict';

  var GA_ID      = 'G-0W4TVPYG7N';
  var CHOICE_KEY = 'ch-analytics-consent';   // 'granted' | 'denied'
  var REGION_KEY = 'ch-consent-region';      // 'required' | 'not-required'

  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function del(k) { try { localStorage.removeItem(k); } catch (e) {} }

  var loaded = false;
  function loadAnalytics() {
    if (loaded) return;
    loaded = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
  }

  /* ---------- banner ---------- */
  var banner = null;

  function build() {
    if (banner) return banner;

    banner = document.createElement('div');
    banner.className = 'consent';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Analytics consent');

    var text = document.createElement('p');
    text.className = 'consent__text';
    text.innerHTML = 'We use Google Analytics to see how many people visit and ' +
      'which parts of the page they read. It sets cookies, so we only turn it ' +
      'on if you say yes. Nothing here affects your wishlist signup. ' +
      '<a href="/privacy">Privacy Policy</a>.';

    var actions = document.createElement('div');
    actions.className = 'consent__actions';

    // Both buttons are the same size and equally reachable: burying "decline"
    // behind extra clicks or lower contrast is precisely what regulators
    // treat as invalid consent.
    var no = document.createElement('button');
    no.type = 'button';
    no.className = 'consent__btn consent__btn--ghost';
    no.textContent = 'DECLINE';
    no.addEventListener('click', function () { decide('denied'); });

    var yes = document.createElement('button');
    yes.type = 'button';
    yes.className = 'consent__btn consent__btn--accept';
    yes.textContent = 'ACCEPT';
    yes.addEventListener('click', function () { decide('granted'); });

    actions.appendChild(no);
    actions.appendChild(yes);
    banner.appendChild(text);
    banner.appendChild(actions);
    document.body.appendChild(banner);
    return banner;
  }

  function show() {
    var el = build();
    el.hidden = false;
    // Synchronous reflow to commit the off-screen start state, so the slide-in
    // has something to animate from. Deliberately not requestAnimationFrame:
    // that is paused in a background tab, which would leave the banner stuck
    // off-screen on a page that loaded unfocused.
    void el.offsetHeight;
    el.classList.add('is-open');
  }

  function hide() {
    if (!banner) return;
    banner.classList.remove('is-open');
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setTimeout(function () { if (banner) banner.hidden = true; }, reduced ? 0 : 300);
  }

  function decide(choice) {
    set(CHOICE_KEY, choice);
    hide();
    if (choice === 'granted') loadAnalytics();
  }

  /* ---------- decide what to do on this page load ---------- */
  var choice = get(CHOICE_KEY);

  if (choice === 'granted') {
    loadAnalytics();
  } else if (choice !== 'denied') {
    var region = get(REGION_KEY);

    if (region === 'not-required') {
      loadAnalytics();
    } else if (region === 'required') {
      show();
    } else {
      fetch('/api/geo')
        .then(function (r) {
          if (!r.ok) throw new Error('geo ' + r.status);
          return r.json();
        })
        .then(function (d) {
          var needed = !!d.eu;
          set(REGION_KEY, needed ? 'required' : 'not-required');
          if (needed) show(); else loadAnalytics();
        })
        .catch(function () {
          // Endpoint unreachable (offline, blocked, local dev). Fall back to
          // the browser's own timezone and err toward asking.
          var tz = '';
          try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) {}
          if (!tz || /^Europe\//.test(tz)) show(); else loadAnalytics();
        });
    }
  }

  /* ---------- letting people change their mind ----------
     Withdrawing consent has to be as easy as giving it, so any
     [data-consent-settings] control reopens the banner. */
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-consent-settings]');
    if (!t) return;
    e.preventDefault();
    del(CHOICE_KEY);
    show();
  });
})();
