/* ============================================================
   KAĒL — interactions + canvas frame sequences
   ============================================================ */
(function () {
  'use strict';

  /* ---- DOM refs ---- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  var sections  = Array.prototype.slice.call(document.querySelectorAll('[data-index]'));
  var nav       = document.getElementById('nav');
  var hero      = document.getElementById('top');
  var idxCur    = document.getElementById('idxCur');
  var idxName   = document.getElementById('idxName');

  /* ---- Canvas frame sequences ---- */
  var CFRAMES = 302, CSTART = 10;
  function cPad(n){ return String(n).padStart(4,'0'); }

  function initCanvasSeq(canvasId, folder){
    var cv = document.getElementById(canvasId); if(!cv) return null;
    var ctx = cv.getContext('2d');
    var article = cv.closest('.fragrance');

    function resize(){
      var w = cv.offsetWidth, h = cv.offsetHeight;
      if(w > 0 && h > 0){ cv.width = w; cv.height = h; }
    }
    resize();
    window.addEventListener('resize', resize);

    var imgs = [];
    for(var ci = 0; ci < CFRAMES; ci++){
      (function(im, n){
        im.onload = im.onerror = function(){};
        im.src = folder + '/frame_' + cPad(n) + '.webp';
      })(imgs[imgs.push(new Image())-1], CSTART + ci);
    }

    function draw(idx){
      var im = imgs[Math.max(0, Math.min(Math.round(idx), CFRAMES-1))];
      if(im && im.complete && im.naturalWidth){
        ctx.clearRect(0, 0, cv.width, cv.height);
        ctx.drawImage(im, 0, 0, cv.width, cv.height);
      }
    }

    return { draw: draw, article: article };
  }

  var canvasSeqs = [
    initCanvasSeq('canvas-noir',    'Noir'),
    initCanvasSeq('canvas-chaleur', 'Chaleur'),
    initCanvasSeq('canvas-voile',   'Voile')
  ];

  /* ---- Scroll engine ---- */
  var ticking = false;
  function onScroll(){
    if(ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  function update(){
    ticking = false;
    var vh = window.innerHeight;
    var y  = window.scrollY || window.pageYOffset;

    /* reveal on scroll */
    for(var i = revealEls.length - 1; i >= 0; i--){
      var el = revealEls[i];
      if(el.getBoundingClientRect().top < vh * 0.9){
        el.classList.add('in');
        revealEls.splice(i, 1);
      }
    }

    /* nav state */
    nav.classList.toggle('scrolled', y > 40);
    var heroBottom = hero ? hero.getBoundingClientRect().bottom : 0;
    nav.classList.toggle('hero-mode', heroBottom > 90);

    /* section index counter */
    if(idxCur){
      var center = vh * 0.5;
      var best = null, bestDist = Infinity;
      for(var s = 0; s < sections.length; s++){
        var rect = sections[s].getBoundingClientRect();
        if(rect.top <= center && rect.bottom >= center){ best = sections[s]; break; }
        var dist = Math.min(Math.abs(rect.top - center), Math.abs(rect.bottom - center));
        if(dist < bestDist){ bestDist = dist; best = sections[s]; }
      }
      if(best){
        idxCur.textContent = best.getAttribute('data-index');
        idxName.textContent = best.getAttribute('data-name');
      }
    }

    /* canvas frame scrubbing — progress maps article top→bottom through viewport */
    for(var ci = 0; ci < canvasSeqs.length; ci++){
      var seq = canvasSeqs[ci];
      if(!seq || !seq.article) continue;
      var r = seq.article.getBoundingClientRect();
      var progress = (vh - r.top) / (r.height + vh);
      seq.draw(Math.max(0, Math.min(1, progress)) * (CFRAMES - 1));
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
  window.addEventListener('load', update);
  setTimeout(update, 300);

  /* ---- Marquee: duplicate track for seamless loop ---- */
  var track = document.getElementById('marquee');
  if(track){ track.innerHTML = track.innerHTML + track.innerHTML; }

  /* ---- Newsletter ---- */
  var form = document.getElementById('newsForm');
  if(form){
    form.addEventListener('submit', function(ev){
      ev.preventDefault();
      form.closest('.news').classList.add('done');
    });
  }
})();
