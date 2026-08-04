/* ============================================================
   The Ascenders — interactions
   Ported from the design prototype's DC logic.
   ============================================================ */
(function () {
  'use strict';

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* GA4 event helper — no-ops when gtag is absent (local dev, blockers). */
  function track(event, params) {
    if (typeof window.gtag === 'function') window.gtag('event', event, params || {});
  }

  // Hero CTA click (anchor scroll to the wishlist band).
  document.querySelectorAll('.hero__cta-buttons .btn--primary').forEach(function (a) {
    a.addEventListener('click', function () { track('cta_click', { location: 'hero' }); });
  });

  /* ---------- 1. Ambient hero background video ----------
     The clip is a pre-baked "boomerang" (forward frames + reversed frames in
     one file). Slowed right down so it reads as a gentle animation rather
     than a video. Instead of looping continuously, it plays one full cycle,
     rests on its starting pose for a few seconds, then plays again.
     (Tweak HERO_SPEED: 1 = normal, lower = slower. HERO_PAUSE_MS = rest.) */
  var HERO_SPEED = 0.9;
  var HERO_PAUSE_MS = 3000;
  document.querySelectorAll('.hero__video').forEach(function (v) {
    v.muted = true;
    v.loop = false; // we drive the repeat ourselves so we can pause between cycles
    var applySpeed = function () { v.playbackRate = HERO_SPEED; };
    applySpeed();
    // Some browsers reset playbackRate when the source (re)loads.
    v.addEventListener('loadedmetadata', applySpeed);
    v.addEventListener('play', applySpeed);
    // After a full cycle, wait, then rewind and play again.
    v.addEventListener('ended', function () {
      setTimeout(function () {
        try { v.currentTime = 0; } catch (e) {}
        var q = v.play();
        if (q && q.catch) q.catch(function () {});
      }, HERO_PAUSE_MS);
    });
    var p = v.play();
    if (p && p.catch) p.catch(function () {});
  });

  /* ---------- 2. Feature card videos ----------
     Desktop (hover-capable): play on hover, fade back to the still on
     leave / when the clip ends.
     Touch / no-hover: play once ~60% of the card is in view, reset once
     it scrolls out of view.                                            */
  document.querySelectorAll('[data-pvp-card]').forEach(function (card) {
    var v = card.querySelector('[data-pvp-video]');
    if (!v) return;
    v.muted = true;
    v.loop = false;

    function show() {
      v.style.opacity = '1';
      var p = v.play();
      if (p && p.catch) p.catch(function () {});
    }
    function hide(reset) {
      v.pause();
      v.style.opacity = '0';
      if (reset) { try { v.currentTime = 0; } catch (e) {} }
    }
    // When the clip finishes, fade back to the still image.
    v.addEventListener('ended', function () { v.style.opacity = '0'; });

    if (canHover) {
      var enter = function () { try { v.currentTime = 0; } catch (e) {} show(); };
      var leave = function () { hide(false); };
      card.addEventListener('mouseenter', enter);
      card.addEventListener('mouseleave', leave);
      card.addEventListener('pointerenter', enter);
      card.addEventListener('pointerleave', leave);
    } else {
      var playing = false;
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.intersectionRatio >= 0.6 && !playing) {
            playing = true;
            try { v.currentTime = 0; } catch (err) {}
            show();
          } else if (e.intersectionRatio <= 0.05 && playing) {
            playing = false;
            hide(true);
          }
        });
      }, { threshold: [0, 0.05, 0.6, 1] });
      io.observe(card);
    }
  });

  /* ---------- 3. Wishlist band video ----------
     Lazy-loaded: buffering starts only as the band approaches the
     viewport. Plays once the section is 60% in view; rewinds when fully
     out of view. The CTA button hue tracks playback (pink -> teal).
     When the clip finishes, it hands off to a tiny pre-baked boomerang of
     its final ~0.2s ("wishlist-tail.mp4") which loops seamlessly as a
     gentle shimmer for as long as the band stays in view.                */
  (function setupWishlist() {
    var section = document.querySelector('[data-wishlist-section]');
    if (!section) return;
    var v = section.querySelector('[data-wishlist-video]');
    var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-wishlist-btn]'));
    if (!v) return;
    v.muted = true;
    v.loop = false;

    // Looping tail element, stacked over the main clip in the same box.
    // Its first frame == the main clip's last frame, so the hand-off is
    // seamless. (Tweak TAIL_SPEED: 1 = normal, lower = gentler shimmer.)
    var TAIL_SPEED = 0.65;
    var tail = document.createElement('video');
    tail.className = v.className;
    tail.src = '/assets/wishlist-tail.mp4';
    tail.muted = true;
    tail.loop = true;
    tail.playsInline = true;
    tail.setAttribute('playsinline', '');
    tail.preload = 'auto';
    tail.style.opacity = '0';
    tail.style.transition = 'opacity .2s ease';
    tail.style.pointerEvents = 'none';
    v.insertAdjacentElement('afterend', tail);

    function showTail() {
      tail.playbackRate = TAIL_SPEED;
      tail.style.opacity = '1';
      var p = tail.play();
      if (p && p.catch) p.catch(function () {});
    }
    function hideTail() {
      tail.pause();
      tail.style.opacity = '0';
      try { tail.currentTime = 0; } catch (e) {}
    }
    // Main clip finished a pass -> start the looping tail shimmer.
    v.addEventListener('ended', showTail);

    // The band's CTA sweeps from hot pink to the logo's yellow/orange gradient
    // as the clip plays, landing exactly on the site's standard button fill.
    var BTN_START_TOP = [255, 45, 110];   // #ff2d6e  hot pink
    var BTN_START_BOT = [199, 20, 70];    // #c71446  deeper rose
    var BTN_END_TOP   = [253, 209, 1];    // #fdd101  == --primary-top
    var BTN_END_BOT   = [242, 92, 1];     // #f25c01  == --primary-bot
    function lerp(a, b, t) { return Math.round(a + (b - a) * t); }
    function mix(from, to, t) {
      return [lerp(from[0], to[0], t), lerp(from[1], to[1], t), lerp(from[2], to[2], t)];
    }
    function rgb(c) { return 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')'; }
    function applyButtonColor(progress) {
      var t = Math.max(0, Math.min(1, progress));
      var top = mix(BTN_START_TOP, BTN_END_TOP, t);
      var bot = mix(BTN_START_BOT, BTN_END_BOT, t);
      var glow = mix(top, bot, .5);
      buttons.forEach(function (btn) {
        // background-image, not the `background` shorthand, so the CSS
        // background-origin: border-box survives (keeps edges on-gradient).
        btn.style.backgroundImage = 'linear-gradient(180deg, ' + rgb(top) + ', ' + rgb(bot) + ')';
        btn.style.boxShadow = '0 0 28px rgba(' + glow[0] + ',' + glow[1] + ',' + glow[2] + ',.55)';
      });
    }

    // Warm the buffer as the band nears the viewport.
    var warmObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          v.preload = 'auto';
          try { v.load(); } catch (err) {}
          warmObserver.disconnect();
        }
      });
    }, { rootMargin: '500px 0px' });
    warmObserver.observe(section);

    var playing = false;
    var raf = null;
    function tick() {
      if (!v.paused && v.duration) applyButtonColor(v.currentTime / v.duration);
      raf = requestAnimationFrame(tick);
    }
    function startTick() { if (raf == null && !prefersReduced) raf = requestAnimationFrame(tick); }
    function stopTick() { if (raf != null) { cancelAnimationFrame(raf); raf = null; } }

    var playObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.intersectionRatio >= 0.6) {
          if (!playing) {
            playing = true;
            var p = v.play();
            if (p && p.catch) p.catch(function () {});
            startTick();
          }
        } else if (e.intersectionRatio <= 0.02) {
          if (playing || v.currentTime > 0 || tail.style.opacity === '1') {
            playing = false;
            v.pause();
            try { v.currentTime = 0; } catch (err) {}
            hideTail();          // reset the shimmer back to its first frame
            stopTick();
            applyButtonColor(0);
          }
        }
      });
    }, { threshold: [0, 0.02, 0.6, 1] });
    playObserver.observe(section);
  })();

  /* ---------- 4. Mobile menu ---------- */
  (function setupMenu() {
    var burger = document.querySelector('.nav__burger');
    var menu = document.getElementById('mobile-menu');
    if (!burger || !menu) return;
    function close() {
      menu.hidden = true;
      burger.setAttribute('aria-expanded', 'false');
    }
    burger.addEventListener('click', function () {
      var open = menu.hidden;
      menu.hidden = !open;
      burger.setAttribute('aria-expanded', String(open));
    });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', close);
    });
  })();

  /* ---------- 5. Wishlist form ---------- */
  (function setupForm() {
    var form = document.querySelector('.wishlist__form');
    if (!form) return;
    var input = form.querySelector('.wishlist__input');
    var hp = form.querySelector('.wishlist__hp');
    var submit = form.querySelector('.wishlist__submit');
    var note = document.querySelector('.wishlist__note');
    var defaultNote = note ? note.textContent : '';
    var noteTimer = null;

    // UTM params captured at load; sent along so campaigns are attributable.
    var params = new URLSearchParams(window.location.search);
    var utm = {
      source: params.get('utm_source') || '',
      medium: params.get('utm_medium') || '',
      campaign: params.get('utm_campaign') || ''
    };

    function setNote(text, cls) {
      if (!note) return;
      clearTimeout(noteTimer);
      note.classList.remove('wishlist__note--ok', 'wishlist__note--err');
      note.textContent = text;
      if (cls) note.classList.add(cls);
    }
    function resetNoteLater() {
      noteTimer = setTimeout(function () { setNote(defaultNote); }, 6000);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var value = (input.value || '').trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        setNote('Enter a valid email to get notified.', 'wishlist__note--err');
        input.focus();
        return;
      }
      if (submit.disabled) return;   // ignore double submits while pending

      submit.disabled = true;
      var restLabel = submit.textContent;
      submit.textContent = 'SENDING…';

      fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email: value,
          hp: hp ? hp.value : '',
          source: 'wishlist-band',
          page: window.location.pathname,
          utm: utm
        })
      }).then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (data) {
          return { ok: r.ok && data.ok };
        });
      }).catch(function () {
        return { ok: false };
      }).then(function (result) {
        submit.disabled = false;
        submit.textContent = restLabel;
        if (result.ok) {
          setNote("You're on the list — watch your inbox for beta keys.", 'wishlist__note--ok');
          form.reset();
          track('wishlist_submit', { source: 'wishlist-band' });
        } else {
          setNote("Something went wrong — please try again.", 'wishlist__note--err');
        }
        resetNoteLater();
      });
    });
  })();

  /* ---------- 6. Heart pop ----------
     A small heart floats up from the pointer whenever a primary CTA
     (JOIN THE WISHLIST / NOTIFY ME) is clicked. Purely decorative, so it is
     aria-hidden and skipped entirely under reduced motion.               */
  (function setupHeartPop() {
    if (prefersReduced) return;

    function pop(x, y) {
      var heart = document.createElement('img');
      heart.className = 'heart-pop';
      heart.src = '/assets/heart.png';
      heart.alt = '';
      heart.setAttribute('aria-hidden', 'true');
      heart.style.left = x + 'px';
      heart.style.top = y + 'px';
      heart.style.setProperty('--drift', (Math.random() * 44 - 22).toFixed(0) + 'px');
      document.body.appendChild(heart);

      var done = false;
      var remove = function () {
        if (done) return;
        done = true;
        if (heart.parentNode) heart.parentNode.removeChild(heart);
      };
      heart.addEventListener('animationend', remove);
      setTimeout(remove, 1400);   // backstop if animationend never fires
    }

    document.addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('.btn--primary') : null;
      if (!btn) return;
      var x = e.clientX, y = e.clientY;
      if (!x && !y) {             // keyboard activation has no pointer position
        var r = btn.getBoundingClientRect();
        x = r.left + r.width / 2;
        y = r.top + r.height / 2;
      }
      pop(x, y);
    });
  })();

  /* ---------- 7. Article overlay ----------
     Clicking a news card opens the full article in a modal on the same page.
     Structure/spacing/motion follow the design handoff; the palette is mapped
     onto this site's tokens. Adds what the prototype lacked: dialog semantics,
     focus trap + restore, 44px close target, reduced-motion, and /news/<slug>
     history sync so Back closes the overlay.                                */
  (function setupArticleOverlay() {
    var articles = window.CLIFF_HEROES_NEWS;
    var triggers = document.querySelectorAll('.news-card__link[data-article]');
    if (!articles || !articles.length || !triggers.length) return;

    // TODO: swap for the real community invite (the footer DISCORD link too).
    var DISCORD_INVITE = 'https://discord.com/invite/cliffheroes';

    var bySlug = {};
    articles.forEach(function (a, i) { a._index = i; bySlug[a.slug] = a; });

    var scrim = null, panel = null;
    var currentSlug = null;
    var lastFocused = null;
    var closeTimer = null;
    var scrimPressed = false;
    // True only when THIS overlay session pushed a history entry (card click).
    // Deep-link/popstate opens have no site entry beneath them, so closing
    // those must replaceState to '/' instead of history.back() — otherwise
    // close would navigate the visitor off the site entirely.
    var openedViaPush = false;

    /* ---- helpers ---- */
    function el(tag, cls, text) {
      var n = document.createElement(tag);
      if (cls) n.className = cls;
      if (text != null) n.textContent = text;
      return n;
    }
    function chip(label, onClick) {
      var b = el('button', 'article__chip', label);
      b.type = 'button';
      b.setAttribute('data-hover-btn', '');
      b.addEventListener('click', onClick);
      return b;
    }
    function slugFromPath(p) {
      var m = /^\/news\/([^\/?#]+)/.exec(p || '');
      return m ? decodeURIComponent(m[1]) : null;
    }
    function articleUrl(slug) { return window.location.origin + '/news/' + slug; }

    /* ---- scroll lock (compensates for the scrollbar so nothing shifts) ---- */
    function lockScroll() {
      var sw = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      if (sw > 0) document.body.style.paddingRight = sw + 'px';
    }
    function unlockScroll() {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    /* ---- shell, built once ---- */
    function buildShell() {
      scrim = el('div', 'article-scrim');
      scrim.hidden = true;

      panel = el('div', 'article');
      panel.setAttribute('role', 'dialog');
      panel.setAttribute('aria-modal', 'true');
      panel.setAttribute('aria-labelledby', 'article-title');
      panel.tabIndex = -1;

      scrim.appendChild(panel);
      document.body.appendChild(scrim);

      // Only close on a press that both started and ended on the scrim, so
      // dragging a text selection out of the panel never closes it.
      scrim.addEventListener('mousedown', function (e) { scrimPressed = (e.target === scrim); });
      scrim.addEventListener('click', function (e) {
        if (e.target === scrim && scrimPressed) close();
        scrimPressed = false;
      });
    }

    /* ---- content blocks ---- */
    function renderBlock(b) {
      if (b.type === 'p')     return el('p', 'article__p', b.text);
      if (b.type === 'quote') return el('div', 'article__quote', b.text);
      if (b.type === 'label') return el('div', 'article__label', b.text);

      if (b.type === 'notes') {
        var notes = el('div', 'article__notes');
        b.items.forEach(function (t) { notes.appendChild(el('div', 'article__note', t)); });
        return notes;
      }
      if (b.type === 'waves') {
        var grid = el('div', 'article__waves');
        b.items.forEach(function (w) {
          var cell = el('div', 'article__wave');
          cell.appendChild(el('div', 'article__wave-label', w.label));
          cell.appendChild(el('div', 'article__wave-region', w.region));
          cell.appendChild(el('div', 'article__wave-count', w.count));
          grid.appendChild(cell);
        });
        return grid;
      }
      if (b.type === 'cta') {
        var cta = el('button', 'btn btn--primary article__cta', b.label);
        cta.type = 'button';
        cta.setAttribute('data-hover-btn', '');
        cta.addEventListener('click', function () {
          track('cta_click', { location: 'article-overlay' });
          goToWishlist(b.target);
        });
        return cta;
      }
      if (b.type === 'kit') {
        var kit = el('div', 'article__kit');
        kit.appendChild(el('div', 'article__portrait', b.portrait));
        var list = el('div', 'article__abilities');
        b.abilities.forEach(function (ab) {
          var item = el('div');
          item.appendChild(el('div', 'article__ability-label', ab.label));
          item.appendChild(el('div', 'article__ability-name', ab.name));
          item.appendChild(el('p', 'article__ability-desc', ab.desc));
          list.appendChild(item);
        });
        kit.appendChild(list);
        return kit;
      }
      return document.createComment('unknown block');
    }

    function renderFooter(article) {
      var footer = el('div', 'article__footer');
      var share = el('div', 'article__share');
      var url = articleUrl(article.slug);

      share.appendChild(chip('SHARE ON X', function () {
        track('share_click', { method: 'x', slug: article.slug });
        window.open('https://twitter.com/intent/tweet?url=' + encodeURIComponent(url) +
          '&text=' + encodeURIComponent(article.title), '_blank', 'noopener');
      }));
      share.appendChild(chip('DISCORD', function () {
        track('share_click', { method: 'discord', slug: article.slug });
        window.open(DISCORD_INVITE, '_blank', 'noopener');
      }));

      var copy = chip('COPY LINK', function () {
        track('share_click', { method: 'copy', slug: article.slug });
        copyLink(url, copy);
      });
      share.appendChild(copy);
      footer.appendChild(share);

      var next = articles[(article._index + 1) % articles.length];
      var nextBtn = el('button', 'article__next', 'NEXT · ' + next.shortTitle + ' →');
      nextBtn.type = 'button';
      nextBtn.setAttribute('data-hover-btn', '');
      nextBtn.addEventListener('click', function () { show(next.slug, 'replace'); });
      footer.appendChild(nextBtn);

      return footer;
    }

    function copyLink(url, btn) {
      var done = function () {
        btn.textContent = 'COPIED';
        setTimeout(function () { btn.textContent = 'COPY LINK'; }, 2000);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(done, function () { fallbackCopy(url, done); });
      } else {
        fallbackCopy(url, done);
      }
    }
    function fallbackCopy(text, done) {
      var ta = el('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); done(); } catch (e) {}
      document.body.removeChild(ta);
    }

    function render(article) {
      panel.setAttribute('data-accent', article.accent);
      while (panel.firstChild) panel.removeChild(panel.firstChild);

      // Bare ✕ (no circle chrome); hover/focus styling lives on the glyph,
      // so it deliberately does not use the rectangular [data-hover-btn].
      var closeBtn = el('button', 'article__close', '✕');
      closeBtn.type = 'button';
      closeBtn.setAttribute('aria-label', 'Close article');
      closeBtn.addEventListener('click', function () { close(); });
      panel.appendChild(closeBtn);

      panel.appendChild(el('div', 'article__hero', article.heroLabel));

      var body = el('div', 'article__body');

      var meta = el('div', 'article__meta');
      meta.appendChild(document.createTextNode(article.category));
      meta.appendChild(el('span', null, article.readTime));
      meta.appendChild(el('span', null, article.byline));
      body.appendChild(meta);

      var title = el('h2', 'article__title', article.title);
      title.id = 'article-title';
      body.appendChild(title);

      body.appendChild(el('p', 'article__lede', article.lede));
      article.content.forEach(function (b) { body.appendChild(renderBlock(b)); });
      body.appendChild(renderFooter(article));

      panel.appendChild(body);
    }

    /* ---- open / swap ---- */
    function show(slug, history_) {
      var article = bySlug[slug];
      if (!article) return;
      if (!scrim) buildShell();

      var wasClosed = currentSlug === null;
      currentSlug = slug;
      render(article);
      track('article_open', { slug: slug });

      if (wasClosed) {
        lockScroll();
        scrim.hidden = false;
        scrim.classList.remove('is-closing');
        clearTimeout(closeTimer);
      } else if (!prefersReduced) {
        // re-run just the panel entrance; the scrim stays mounted
        panel.style.animation = 'none';
        void panel.offsetWidth;
        panel.style.animation = '';
      }

      panel.scrollTop = 0;
      panel.focus();

      var path = '/news/' + slug;
      if (history_ === 'replace') {
        history.replaceState({ article: slug }, '', path);
      } else if (history_ === 'push') {
        history.pushState({ article: slug }, '', path);
        openedViaPush = true;
      } else {
        // deep link or popstate: the URL is already correct; no entry of ours
        openedViaPush = false;
      }
    }

    /* ---- close ---- */
    function close(fromPopstate) {
      if (currentSlug === null) return;
      currentSlug = null;

      var finish = function () {
        scrim.hidden = true;
        scrim.classList.remove('is-closing');
        unlockScroll();
        if (lastFocused && document.contains(lastFocused)) lastFocused.focus();
        lastFocused = null;
      };

      if (prefersReduced) {
        finish();
      } else {
        scrim.classList.add('is-closing');
        clearTimeout(closeTimer);
        closeTimer = setTimeout(finish, 150);
      }

      // Card-click opens pushed an entry -> pop it so Back stays in sync.
      // Deep-link opens have no site entry beneath -> rewrite to home instead
      // (history.back() there would leave the site).
      if (!fromPopstate) {
        if (openedViaPush) history.back();
        else history.replaceState({}, '', '/');
      }
      openedViaPush = false;
    }

    function goToWishlist(target) {
      close();
      setTimeout(function () {
        var section = document.querySelector(target || '#wishlist');
        if (!section) return;
        section.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'center' });
        var input = section.querySelector('.wishlist__input');
        if (input) setTimeout(function () { input.focus(); }, prefersReduced ? 0 : 600);
      }, prefersReduced ? 0 : 170);
    }

    /* ---- focus trap + Escape ---- */
    function focusables() {
      return Array.prototype.filter.call(
        panel.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'),
        function (n) { return !n.disabled && n.offsetParent !== null; }
      );
    }
    document.addEventListener('keydown', function (e) {
      if (currentSlug === null) return;
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key !== 'Tab') return;

      var f = focusables();
      if (!f.length) { e.preventDefault(); panel.focus(); return; }
      var first = f[0], last = f[f.length - 1], active = document.activeElement;

      if (e.shiftKey) {
        if (active === first || active === panel || !panel.contains(active)) {
          e.preventDefault(); last.focus();
        }
      } else if (active === last) {
        e.preventDefault(); first.focus();
      }
    });

    /* ---- triggers ---- */
    triggers.forEach(function (btn) {
      btn.addEventListener('click', function () {
        lastFocused = btn;
        show(btn.getAttribute('data-article'), 'push');
      });
    });

    /* ---- history sync ---- */
    window.addEventListener('popstate', function () {
      var slug = slugFromPath(window.location.pathname);
      if (slug && bySlug[slug]) show(slug, null);
      else if (currentSlug !== null) close(true);
    });

    // Deep link: /news/<slug> on first load opens that article.
    var initial = slugFromPath(window.location.pathname);
    if (initial && bySlug[initial]) show(initial, null);
  })();

})();
