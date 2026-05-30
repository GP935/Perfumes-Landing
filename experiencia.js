/* ============================================================
   KAĒL — EXPERIENCIA · motor
   ============================================================ */
(function () {
  'use strict';
  var root = document.documentElement;
  var body = document.body;
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

  /* ---------- Split hero title into characters ---------- */
  var heroTitle = document.querySelector('.hero__title');
  if (heroTitle && !heroTitle.dataset.split) {
    heroTitle.dataset.split = '1';
    var txt = heroTitle.textContent.trim();
    heroTitle.textContent = '';
    txt.split('').forEach(function (c, i) {
      var s = document.createElement('span');
      s.className = 'ch';
      s.textContent = c;
      s.style.animationDelay = (0.15 + i * 0.07) + 's';
      heroTitle.appendChild(s);
    });
  }

  /* ---------- Split manifesto quote into words ---------- */
  document.querySelectorAll('[data-words]').forEach(function (el) {
    var html = el.innerHTML;
    // wrap text nodes' words while keeping <em> tags
    var temp = document.createElement('div');
    temp.innerHTML = html;
    var words = [];
    function walk(node, emph) {
      node.childNodes.forEach(function (n) {
        if (n.nodeType === 3) {
          n.textContent.split(/(\s+)/).forEach(function (tok) {
            if (tok.trim() === '') { words.push({ space: tok }); }
            else { words.push({ word: tok, em: emph }); }
          });
        } else if (n.nodeType === 1) {
          walk(n, emph || n.tagName === 'EM');
        }
      });
    }
    walk(temp, false);
    el.innerHTML = '';
    var count = words.filter(function (w) { return w.word; }).length;
    var idx = 0;
    words.forEach(function (w) {
      if (w.space !== undefined) { el.appendChild(document.createTextNode(' ')); return; }
      var span = document.createElement('span');
      span.className = 'w';
      if (w.em) { var e = document.createElement('em'); e.textContent = w.word; span.appendChild(e); }
      else { span.textContent = w.word; }
      span.dataset.wi = idx;
      span.dataset.wt = count;
      el.appendChild(span);
      idx++;
    });
  });
  var mWords = Array.prototype.slice.call(document.querySelectorAll('.manifesto__quote .w'));

  /* ---------- Scenes ---------- */
  var scenes = Array.prototype.slice.call(document.querySelectorAll('[data-scene]'));
  var railItems = Array.prototype.slice.call(document.querySelectorAll('.rail__item'));
  var nav = document.getElementById('nav');

  var sceneState = {};

  function frame() {
    var vh = window.innerHeight;
    var docH = document.documentElement.scrollHeight - vh;
    var y = window.scrollY || window.pageYOffset;
    root.style.setProperty('--scrollp', docH > 0 ? (y / docH).toFixed(4) : 0);

    var center = vh * 0.5;
    var active = null;

    scenes.forEach(function (s) {
      var r = s.getBoundingClientRect();
      var total = s.offsetHeight - vh;
      var p = total > 0 ? clamp(-r.top / total, 0, 1) : clamp((vh - r.top) / vh, 0, 1);
      s.style.setProperty('--p', p.toFixed(4));
      // active scene covers viewport center
      if (r.top <= center && r.bottom >= center) { active = s; }
    });

    if (active && active !== sceneState.active) {
      sceneState.active = active;
      // theme (light/dark) for nav/cursor blending
      var theme = active.getAttribute('data-theme') || 'dark';
      body.setAttribute('data-theme', theme);
      // accent override per scene (use its --c-ac so glow matches)
      var ac = getComputedStyle(active).getPropertyValue('--c-ac').trim();
      if (ac) root.style.setProperty('--c-ac', ac);
      // rail
      var name = active.getAttribute('data-name');
      railItems.forEach(function (it) {
        it.classList.toggle('active', it.getAttribute('data-for') === name);
      });
    }

    // manifesto words progressive reveal
    if (mWords.length) {
      var mScene = document.querySelector('.manifesto');
      var mp = parseFloat(mScene.style.getPropertyValue('--p')) || 0;
      var reveal = clamp((mp - 0.05) / 0.6, 0, 1);
      var lead = reveal * mWords.length;
      mWords.forEach(function (w, i) {
        var o = clamp(lead - i, 0, 1);
        w.style.opacity = (0.12 + o * 0.88).toFixed(3);
      });
    }

    nav.classList.toggle('scrolled', y > 40);
    ticking = false;
  }

  var ticking = false;
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  frame();
  window.addEventListener('load', frame);
  setTimeout(frame, 300);

  /* ---------- Mouse: parallax channels + custom cursor ---------- */
  var rx = window.innerWidth / 2, ry = window.innerHeight / 2;
  var tx = rx, ty = ry;
  var hasFine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;

  if (hasFine) {
    window.addEventListener('mousemove', function (e) {
      tx = e.clientX; ty = e.clientY;
      root.style.setProperty('--cx', tx + 'px');
      root.style.setProperty('--cy', ty + 'px');
      root.style.setProperty('--mx', ((tx / window.innerWidth) * 2 - 1).toFixed(3));
      root.style.setProperty('--my', ((ty / window.innerHeight) * 2 - 1).toFixed(3));
    }, { passive: true });

    // smooth trailing ring
    (function ringLoop() {
      rx += (tx - rx) * 0.16; ry += (ty - ry) * 0.16;
      root.style.setProperty('--rx', rx + 'px');
      root.style.setProperty('--ry', ry + 'px');
      requestAnimationFrame(ringLoop);
    })();

    // ring grows over interactive elements
    var ring = document.querySelector('.cursor-ring');
    document.querySelectorAll('a, button, .note, .pyr, .nav__cta').forEach(function (el) {
      el.addEventListener('mouseenter', function () { root.style.setProperty('--ring-s', '1.8'); });
      el.addEventListener('mouseleave', function () { root.style.setProperty('--ring-s', '1'); });
    });
  }

  /* ---------- Interactive notes: reveal descriptor ---------- */
  document.querySelectorAll('.chapter').forEach(function (ch) {
    var line = ch.querySelector('.chapter__reveal-line');
    var defaultTxt = line ? line.textContent : '';
    ch.querySelectorAll('.note').forEach(function (note) {
      note.addEventListener('mouseenter', function () {
        if (line) line.textContent = note.getAttribute('data-desc') || defaultTxt;
        note.classList.add('active');
      });
      note.addEventListener('mouseleave', function () {
        if (line) line.textContent = defaultTxt;
        note.classList.remove('active');
      });
    });
  });

  /* ---------- Smooth anchor scroll ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var t = document.querySelector(id);
      if (t) {
        e.preventDefault();
        var top = t.getBoundingClientRect().top + (window.scrollY || window.pageYOffset);
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });

  /* ---------- Newsletter ---------- */
  var form = document.getElementById('newsForm');
  if (form) {
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var box = form.closest('.news'); if (box) box.classList.add('done');
    });
  }

  /* ---------- Loader ---------- */
  (function () {
    var loader = document.getElementById('loader');
    if (!loader) return;
    var fill  = loader.querySelector('.loader__fill');
    var MIN   = 1600; /* ms mínimos de pantalla para que se vea la animación */
    var t0    = performance.now();
    var fired = false;

    function setFill(v) {
      fill.style.setProperty('--lp', v.toFixed(3));
    }

    /* progreso simulado: 0 → 40 % → 75 % mientras carga */
    setTimeout(function () { setFill(0.4);  }, 250);
    setTimeout(function () { setFill(0.75); }, 900);

    function dismiss() {
      if (fired) return;
      fired = true;
      var wait = Math.max(0, MIN - (performance.now() - t0));
      setTimeout(function () {
        setFill(1);
        setTimeout(function () {
          loader.classList.add('loader--out');
          loader.addEventListener('transitionend', function () {
            loader.remove();
          }, { once: true });
        }, 400); /* espera que la barra llegue al 100 % */
      }, wait);
    }

    /* disparo real: video del hero listo */
    var vid = document.querySelector('.hero__bg video');
    if (vid) {
      if (vid.readyState >= 3) { dismiss(); }
      else { vid.addEventListener('canplay', dismiss, { once: true }); }
    }
    /* fallbacks */
    window.addEventListener('load', dismiss);
    setTimeout(dismiss, 6000);
  })();

})();
