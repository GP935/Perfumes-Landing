/* ============================================================
   KAĒL — scroll-reel
   Reproduce la secuencia de frames webp a medida que el
   usuario hace scroll. Un Reel por sección.
   ============================================================ */
(function () {
  'use strict';

  var BASE = 'media/';

  /* qué video va en cada sección.
     frames    : número total de frames en esa carpeta.
     fromEntry : true  → progreso arranca cuando la sección entra
                         por abajo del viewport (animación ya en marcha
                         cuando el stage se vuelve visible).
                 false → progreso arranca cuando section-top = viewport-top
                         (útil para el hero que siempre inicia en pantalla). */
  var CONFIGS = [
    { sel: '.manifesto',          folder: 'flores y tinta fps', frames: 183, veil: true,  fromEntry: true  },
    { sel: '[data-fr="noir"]',    folder: 'noir smoke fps',    frames: 183, veil: true,  fromEntry: true  },
    { sel: '[data-fr="chaleur"]', folder: 'ambar calido fps',  frames: 183, veil: true,  fromEntry: true  },
    { sel: '[data-fr="blanc"]',   folder: 'white lilac fps',   frames: 183, veil: true,  fromEntry: true  },
  ];

  /* ── helpers ────────────────────────────────────────────── */
  function pad(n)        { return ('00000' + n).slice(-5); }
  function frameSrc(f,i) { return BASE + encodeURIComponent(f) + '/frame_' + pad(i+1) + '.webp'; }
  function clamp(v,lo,hi){ return v < lo ? lo : v > hi ? hi : v; }

  /* ── Reel ───────────────────────────────────────────────── */
  function Reel(el, cfg) {
    this.el        = el;
    this.folder    = cfg.folder;
    this.total     = cfg.frames;
    this.fromEntry = cfg.fromEntry;
    this.imgs   = new Array(this.total).fill(null);
    this.state  = new Uint8Array(this.total); /* 0=sin cargar 1=cargando 2=lista */
    this.curIdx = -1;

    var img = document.createElement('img');
    img.className = 'reel-frame';
    img.alt = '';
    img.setAttribute('aria-hidden', 'true');
    this.display = img;

    this._inject(el, img, cfg.veil);

    /* arranca la precarga cuando la sección se acerca al viewport */
    var self = this;
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (e) {
        if (e[0].isIntersecting) { self._load(0, 50); io.disconnect(); }
      }, { rootMargin: '500px' });
      io.observe(el);
    } else {
      this._load(0, 50);
    }
  }

  Reel.prototype._inject = function (el, img, addVeil) {
    /* hero: directo en hero__bg */
    var bg = el.querySelector('.hero__bg');
    if (bg) {
      bg.insertBefore(img, bg.firstChild);
      return;
    }
    /* resto: primer hijo del stage, antes del contenido */
    var stage = el.querySelector('.stage');
    var ref   = stage || el;
    ref.insertBefore(img, ref.firstChild);

    if (addVeil && stage) {
      var v = document.createElement('div');
      v.className = 'reel-veil';
      stage.insertBefore(v, img.nextSibling);
    }
  };

  Reel.prototype._load = function (start, count) {
    var end  = Math.min(start + count, this.total);
    var self = this;
    for (var i = start; i < end; i++) {
      if (this.state[i]) continue;
      this.state[i] = 1;
      (function (idx) {
        var im = new Image();
        im.onload = function () { self.imgs[idx] = im; self.state[idx] = 2; };
        im.src = frameSrc(self.folder, idx);
      })(i);
    }
  };

  Reel.prototype.update = function (p) {
    var target = Math.round(clamp(p, 0, 1) * (this.total - 1));

    /* precarga una ventana de 40 frames alrededor del frame actual */
    this._load(Math.max(0, target - 8), 40);

    if (target === this.curIdx) return;
    this.curIdx = target;

    /* busca el frame más cercano que ya esté decodificado */
    var best = -1;
    if (this.state[target] === 2) {
      best = target;
    } else {
      for (var d = 1; d < this.total; d++) {
        var lo = target - d, hi = target + d;
        if (lo >= 0 && this.state[lo] === 2)         { best = lo; break; }
        if (hi < this.total && this.state[hi] === 2) { best = hi; break; }
        if (lo < 0 && hi >= this.total) break;
      }
    }

    var next = best >= 0
      ? this.imgs[best].src
      : frameSrc(this.folder, target); /* carga directa si ninguno está listo */

    if (this.display.getAttribute('data-src') !== next) {
      this.display.src = next;
      this.display.setAttribute('data-src', next);
    }
  };

  /* ── loop de scroll ─────────────────────────────────────── */
  var instances = [];

  function tick() {
    var vh = window.innerHeight;
    for (var k = 0; k < instances.length; k++) {
      var inst = instances[k];
      var r    = inst.el.getBoundingClientRect();
      var h    = inst.el.offsetHeight;
      var p;
      if (inst.fromEntry) {
        /* arranca cuando la sección aparece por abajo del viewport:
           p=0 → section-bottom toca viewport-bottom
           p=1 → sección completamente desaparecida por arriba */
        p = clamp((vh - r.top) / (vh + h), 0, 1);
      } else {
        /* hero: arranca cuando section-top = viewport-top */
        p = clamp(-r.top / h, 0, 1);
      }
      inst.update(p);
    }
  }

  var raf = false;
  function onScroll() {
    if (!raf) { raf = true; requestAnimationFrame(function () { tick(); raf = false; }); }
  }

  /* ── init ───────────────────────────────────────────────── */
  function init() {
    CONFIGS.forEach(function (cfg) {
      var el = document.querySelector(cfg.sel);
      if (el) instances.push(new Reel(el, cfg));
    });
    tick();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    window.addEventListener('load',   tick);
    setTimeout(tick, 400);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
