/* ===========================================================================
   <pops-why-a-hit> — Pop's Place "WHY WE'RE A HIT" five-reason row as a WIX
   CUSTOM ELEMENT (not an HTML iframe embed).

   WHY THIS EXISTS:
   A Wix "HTML iframe" embed is a sandboxed iframe Wix LAZY-LOADS on scroll —
   that's the pop-in. A Wix CUSTOM ELEMENT renders directly in the page DOM and
   runs connectedCallback() the moment it attaches, so it paints with the page.

   REQUIREMENTS (Wix side): site must have a CONNECTED DOMAIN and NO Wix ads
   (premium). Then: Add Elements > Embed & Social > Custom Element.

   HOW TO REGISTER IN WIX:
   1. Host this file over HTTPS (Velo public file, or an external Server URL /
      jsDelivr).
   2. Custom Element settings > Choose Source > point at this file's URL.
   3. Tag Name:  pops-why-a-hit   (must match the customElements.define() below).
   4. Size/dock the element to FILL the section, send it to the BACK if you want
      the starfield behind other content (it already keeps its own cards on top).

   ATTRIBUTES (all optional):
     bg="black"   -> flat #000 behind the cards (default — streaks pop hardest).
     bg="violet"  -> top violet glow like the hero, then dark.
     density="1"  -> star multiplier (1 default, 1.6 fuller, 0.7 sparser).

   The five reasons / copy / icons are baked in (same as the original embed).
   Header is intentionally omitted — the owner adds their own Impact-font title
   in Wix above this element.

   Shadow DOM isolates the CSS from Wix. Brand: canvas #0B0710 · violet #8A4FFF ·
   glow #B57BFF · gold #F5C542 · periwinkle #BFC4F0 · text #F4F1FA.
   =========================================================================== */
(function () {
  if (customElements.get('pops-why-a-hit')) return; // guard against double-define

  class PopsWhyAHit extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this._built = false;
    }

    static get observedAttributes() {
      return ['bg', 'density'];
    }

    connectedCallback() {
      if (!this._built) this._build();

      // Fill the box on first paint and keep re-checking for a few frames — Wix
      // lays the section height out a beat AFTER attach, so the parent is often
      // 0/auto on the first tick. Same robust sizing as <pops-starfield>.
      this._sizeHost();
      this._retrySizing();

      if (window.ResizeObserver && !this._ro) {
        this._ro = new ResizeObserver(function(){ this._sizeHost(); }.bind(this));
        try { this._ro.observe(this); } catch(e){}
        var a = this.parentElement, depth = 0;
        while (a && depth < 4) { try { this._ro.observe(a); } catch(e){} a = a.parentElement; depth++; }
      }
      window.addEventListener('resize', this._onResize = function(){ this._sizeHost(); }.bind(this));
      window.addEventListener('load', this._onLoad = function(){ this._sizeHost(); }.bind(this));

      this._wireIgnite();
    }

    disconnectedCallback() {
      if (this._ro) { try { this._ro.disconnect(); } catch(e){} this._ro = null; }
      if (this._onResize) window.removeEventListener('resize', this._onResize);
      if (this._onLoad) window.removeEventListener('load', this._onLoad);
      if (this._raf) cancelAnimationFrame(this._raf);
      if (this._io) { try { this._io.disconnect(); } catch(e){} this._io = null; }
    }

    attributeChangedCallback() {
      if (this._built) { this._built = false; this._build(); this._sizeHost(); this._wireIgnite(); }
    }

    // Re-run _sizeHost over several frames so we catch the moment Wix gives the
    // section a real height. Stops once we lock onto a solid box.
    _retrySizing() {
      var self = this, tries = 0;
      var tick = function () {
        tries++;
        var solid = self._sizeHost();
        if (!solid && tries < 30) self._raf = requestAnimationFrame(tick);
      };
      self._raf = requestAnimationFrame(tick);
    }

    // Find the real SECTION box and pin the host to it. Collapse to 0 first so an
    // auto-height wrapper parent can't feed our own min-height back; take the
    // largest bounded ancestor BELOW body/html (never the whole page).
    _sizeHost() {
      this.style.height = '0px';
      var h = 0, node = this.parentElement, depth = 0;
      while (node && depth < 8) {
        var tag = node.tagName;
        if (tag === 'BODY' || tag === 'HTML') break;
        var hh = node.getBoundingClientRect().height;
        if (hh > h) h = hh;
        node = node.parentElement; depth++;
      }
      if (h >= 40) { this.style.height = Math.round(h) + 'px'; return true; }
      this.style.height = '100vh';
      return false;
    }

    // IntersectionObserver: light the cards (neon-flicker marquee) when scrolled
    // into view. Falls back to a timeout so it always ignites.
    _wireIgnite() {
      var row = this.shadowRoot.getElementById('row');
      if (!row) return;
      var lit = false;
      var light = function(){ if (lit) return; lit = true; row.classList.add('lit'); };
      if (this._io) { try { this._io.disconnect(); } catch(e){} this._io = null; }
      if ('IntersectionObserver' in window) {
        this._io = new IntersectionObserver(function (es) {
          for (var i = 0; i < es.length; i++) {
            if (es[i].isIntersecting && es[i].intersectionRatio >= 0.2) { light(); this._io.disconnect(); break; }
          }
        }.bind(this), { threshold: [0, 0.2, 0.5] });
        // observe the HOST (the shadow root's content isn't directly observable
        // for viewport intersection the same way; the host's position is what
        // matters for "scrolled into view").
        this._io.observe(this);
      }
      setTimeout(light, 1400);
    }

    _build() {
      this._built = true;
      var bg   = (this.getAttribute('bg') || 'black').toLowerCase();
      var dens = parseFloat(this.getAttribute('density') || '1') || 1;

      var wrapBg = (bg === 'violet')
        ? 'radial-gradient(120% 80% at 50% -10%, rgba(138,79,255,0.18) 0%, rgba(11,7,16,0) 50%), #0B0710'
        : '#000';

      this.shadowRoot.innerHTML =
        '<style>' +
        // NO @import here. A render-blocking @import to fonts.googleapis.com inside
        // the shadow CSS stalls the element's first paint for seconds on Wix's busy
        // live page (that was the 4s "slow load"). Poppins is already loaded by the
        // Wix site itself; because a custom element renders in the PAGE DOM (not an
        // iframe), we can just reference it by name — with a system fallback so text
        // is never invisible while the page-level font is still warming up.
        ':host{display:block;position:relative;width:100%;height:100%;min-height:220px;' +
          '--canvas:#0B0710;--violet:#8A4FFF;--glow:#B57BFF;--gold:#F5C542;' +
          '--peri:#BFC4F0;--text:#F4F1FA;--card-line:rgba(181,123,255,0.22);}' +
        '*{margin:0;padding:0;box-sizing:border-box;}' +

        '.wrap{min-height:100%;height:100%;display:flex;flex-direction:column;justify-content:center;' +
          "font-family:'Poppins',system-ui,sans-serif;color:var(--text);" +
          'background:' + wrapBg + ';' +
          'padding:clamp(40px,6vw,72px) clamp(16px,4vw,48px);overflow:hidden;position:relative;}' +
        '.wrap::after{content:"";position:absolute;inset:0;pointer-events:none;' +
          'background:repeating-linear-gradient(0deg, rgba(255,255,255,0.012) 0 1px, transparent 1px 3px);' +
          'mix-blend-mode:overlay;z-index:0;}' +

        '.sky{position:absolute;inset:0;z-index:0;pointer-events:none;overflow:hidden;}' +
        '.star{position:absolute;width:2px;height:2px;border-radius:50%;background:var(--peri);opacity:0;' +
          'box-shadow:0 0 6px 1px rgba(181,123,255,0.55);' +
          'animation:twk var(--tdur,4s) ease-in-out infinite;animation-delay:var(--tdel,0s);}' +
        '.star.gold{background:var(--gold);box-shadow:0 0 6px 1px rgba(245,197,66,0.65);}' +
        '@keyframes twk{0%,100%{opacity:0;transform:scale(.6);}50%{opacity:.5;transform:scale(1);}}' +
        '.shoot{position:absolute;left:var(--sx);top:var(--sy);width:var(--len,120px);height:1.6px;border-radius:2px;' +
          'background:linear-gradient(90deg,rgba(181,123,255,0) 0%,rgba(181,123,255,0) 42%,' +
            'rgba(181,123,255,.5) 86%,rgba(244,241,250,.95) 100%);opacity:0;' +
          'filter:drop-shadow(0 0 4px rgba(181,123,255,.55));' +
          'animation:shoot var(--sdur,8s) linear infinite;animation-delay:var(--sdel,0s);will-change:transform,opacity;}' +
        '.shoot.gold{background:linear-gradient(90deg,rgba(245,197,66,0) 0%,rgba(245,197,66,0) 42%,' +
            'rgba(245,197,66,.5) 86%,#fff 100%);filter:drop-shadow(0 0 5px rgba(245,197,66,.7));}' +
        '@keyframes shoot{0%{opacity:0;transform:rotate(var(--ang,20deg)) translateX(-20px) scaleX(.5);}' +
          '4%{opacity:.85;}7%{transform:rotate(var(--ang,20deg)) translateX(30px) scaleX(1);}' +
          '14%{opacity:0;transform:rotate(var(--ang,20deg)) translateX(var(--travel,460px)) scaleX(1);}' +
          '100%{opacity:0;transform:rotate(var(--ang,20deg)) translateX(var(--travel,460px)) scaleX(1);}}' +

        '.row{display:grid;grid-template-columns:repeat(5,1fr);gap:clamp(12px,1.4vw,20px);' +
          'max-width:1240px;margin:0 auto;position:relative;z-index:1;width:100%;}' +
        '.card{position:relative;border-radius:18px;padding:26px 20px 24px;' +
          'background:linear-gradient(180deg, rgba(191,196,240,0.10), rgba(191,196,240,0.03));' +
          'border:1px solid var(--card-line);backdrop-filter:blur(3px);overflow:hidden;isolation:isolate;' +
          'opacity:0.06;transition:border-color .35s ease, box-shadow .45s ease, transform .4s ease;}' +

        '@keyframes ignite{0%{opacity:.06;}8%{opacity:.55;}12%{opacity:.10;}20%{opacity:.80;}' +
          '24%{opacity:.20;}32%{opacity:1;}38%{opacity:.55;}100%{opacity:1;}}' +
        '@keyframes igniteGlow{0%,24%{box-shadow:none;border-color:var(--card-line);}' +
          '32%{box-shadow:0 0 0 1px rgba(181,123,255,.25), 0 14px 40px -20px rgba(138,79,255,.5);}' +
          '100%{box-shadow:none;border-color:var(--card-line);}}' +
        '.row.lit .card{animation:ignite .9s steps(1,end) both, igniteGlow .9s ease-out both;}' +
        '.row.lit .card:nth-child(1){animation-delay:.00s,.00s;}' +
        '.row.lit .card:nth-child(2){animation-delay:.18s,.18s;}' +
        '.row.lit .card:nth-child(3){animation-delay:.36s,.36s;}' +
        '.row.lit .card:nth-child(4){animation-delay:.54s,.54s;}' +
        '.row.lit .card:nth-child(5){animation-delay:.72s,.72s;}' +

        '@keyframes edgeIgnite{0%{opacity:0;}8%{opacity:.6;}12%{opacity:.1;}20%{opacity:.9;}' +
          '24%{opacity:.2;}32%{opacity:.55;}100%{opacity:.5;}}' +
        '.row.lit .card::before{animation:edgeIgnite .9s steps(1,end) both;}' +
        '.row.lit .card:nth-child(1)::before{animation-delay:.00s;}' +
        '.row.lit .card:nth-child(2)::before{animation-delay:.18s;}' +
        '.row.lit .card:nth-child(3)::before{animation-delay:.36s;}' +
        '.row.lit .card:nth-child(4)::before{animation-delay:.54s;}' +
        '.row.lit .card:nth-child(5)::before{animation-delay:.72s;}' +

        '.card .icon{opacity:0;}' +
        '.row.lit .card .icon{animation:iconOn .5s ease-out both;}' +
        '@keyframes iconOn{from{opacity:0;transform:scale(.9);}to{opacity:1;transform:none;}}' +
        '.row.lit .card:nth-child(1) .icon{animation-delay:.30s;}' +
        '.row.lit .card:nth-child(2) .icon{animation-delay:.48s;}' +
        '.row.lit .card:nth-child(3) .icon{animation-delay:.66s;}' +
        '.row.lit .card:nth-child(4) .icon{animation-delay:.84s;}' +
        '.row.lit .card:nth-child(5) .icon{animation-delay:1.02s;}' +

        '.card::before{content:"";position:absolute;left:18px;right:18px;top:0;height:2px;border-radius:2px;' +
          'background:linear-gradient(90deg,transparent,var(--glow),transparent);' +
          'opacity:.5;transition:opacity .4s ease, box-shadow .4s ease;z-index:2;}' +
        '.card:hover{border-color:rgba(181,123,255,0.6);' +
          'box-shadow:0 0 0 1px rgba(181,123,255,0.25), 0 18px 50px -18px rgba(138,79,255,0.6),' +
            'inset 0 0 30px rgba(138,79,255,0.10);transform:translateY(-6px);}' +
        '.card:hover::before{opacity:1;box-shadow:0 0 14px 1px var(--glow);}' +

        '.num{font-weight:600;font-size:12px;letter-spacing:0.25em;color:var(--peri);opacity:0.55;margin-bottom:18px;}' +
        '.icon{width:46px;height:46px;margin-bottom:18px;display:block;overflow:visible;color:var(--glow);' +
          'filter:drop-shadow(0 0 10px rgba(138,79,255,0.55));transition:transform .4s ease, color .4s ease;}' +
        '.card:hover .icon{transform:scale(1.08) rotate(-3deg);}' +
        '.icon .spark{color:var(--gold);}' +

        '.steam{opacity:0;transform-origin:center;}' +
        '.row.lit .steam{animation:steam 3.2s ease-in-out infinite;}' +
        '.steam.s2{animation-delay:.6s !important;}.steam.s3{animation-delay:1.2s !important;}' +
        '@keyframes steam{0%{opacity:0;transform:translateY(2px) scaleY(.7);}35%{opacity:.9;}' +
          '100%{opacity:0;transform:translateY(-6px) scaleY(1.1);}}' +
        '.row.lit .shimmer{animation:shimmer 2.6s ease-in-out infinite;transform-origin:center bottom;}' +
        '@keyframes shimmer{0%,100%{transform:translateX(0);opacity:.7;}50%{transform:translateX(1.2px);opacity:1;}}' +
        '.row.lit .vibe{animation:vibePulse 3.4s ease-in-out infinite;}' +
        '@keyframes vibePulse{0%,100%{filter:drop-shadow(0 0 6px rgba(245,197,66,.5));}' +
          '50%{filter:drop-shadow(0 0 8px rgba(124,180,255,.65));}}' +
        '.row.lit .twinkle{animation:twinkle 2.8s ease-in-out infinite;transform-origin:center;transform-box:fill-box;}' +
        '@keyframes twinkle{0%,100%{transform:scale(.92);opacity:.8;}50%{transform:scale(1.06);opacity:1;}}' +
        '.row.lit .beat{animation:beat 2.4s ease-in-out infinite;transform-origin:center;transform-box:fill-box;}' +
        '@keyframes beat{0%,100%{transform:scale(1);}14%{transform:scale(1.14);}28%{transform:scale(1);}42%{transform:scale(1.08);}}' +

        '.ctitle{font-weight:600;font-size:clamp(15px,1.5vw,19px);line-height:1.18;margin-bottom:9px;' +
          'letter-spacing:0.005em;color:var(--text);}' +
        '.cbody{font-weight:200;font-size:clamp(12.5px,1vw,13.5px);line-height:1.55;color:var(--peri);opacity:0.82;}' +

        '@media (max-width:900px){.row{grid-template-columns:repeat(2,1fr);gap:14px;}' +
          '.row .card:nth-child(5){grid-column:1 / -1;}}' +
        '@media (max-width:520px){.row{grid-template-columns:1fr;}.row .card:nth-child(5){grid-column:auto;}}' +

        '@media (prefers-reduced-motion: reduce){' +
          '.card,.card::before,.icon,.steam,.shimmer,.vibe,.twinkle,.beat{animation:none!important;transition:none!important;}' +
          '.card{opacity:1!important;transform:none!important;}.card::before{opacity:.5!important;}' +
          '.card .icon{opacity:1!important;transform:none!important;}.steam{opacity:.85!important;}' +
          '.card:hover{transform:none;}.shoot{display:none;}.star{animation:none;opacity:.35;}}' +
        '</style>' +

        '<div class="wrap">' +
          '<div class="sky" id="sky" aria-hidden="true"></div>' +
          '<div class="row" id="row">' +

            '<article class="card"><div class="num">01</div>' +
              '<svg class="icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                '<path d="M14 20h18a4 4 0 0 1 0 8h-2"/>' +
                '<path d="M14 20v6a8 8 0 0 0 8 8h2a8 8 0 0 0 8-8v-6z"/>' +
                '<path class="spark steam s1" d="M18 12c-1 1.5-1 3 0 4" stroke-width="2.2"/>' +
                '<path class="spark steam s2" d="M24 11c-1 1.5-1 3 0 4" stroke-width="2.2"/>' +
                '<path class="spark steam s3" d="M30 12c-1 1.5-1 3 0 4" stroke-width="2.2"/>' +
              '</svg>' +
              '<h3 class="ctitle">Signature Brews</h3>' +
              '<p class="cbody">Coffees you won’t find anywhere else — named like nowhere else.</p>' +
            '</article>' +

            '<article class="card"><div class="num">02</div>' +
              '<svg class="icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                '<path d="M12 30c0-7 5-12 12-12s12 5 12 12"/>' +
                '<path d="M9 30h30"/>' +
                '<path class="spark shimmer" d="M16 18l3-5M24 17l1-6M32 18l-3-5"/>' +
                '<circle cx="24" cy="35" r="1.6" fill="currentColor" stroke="none"/>' +
              '</svg>' +
              '<h3 class="ctitle">Real Caribbean Kitchen</h3>' +
              '<p class="cbody">Jerk, oxtail, festival, plantain — nyamins done right.</p>' +
            '</article>' +

            '<article class="card"><div class="num">03</div>' +
              '<svg class="icon vibe" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                '<path class="spark" d="M17 14c-2 2-2 4 0 6M24 13c-2 2-2 4 0 6M31 14c-2 2-2 4 0 6"/>' +
                '<rect x="13" y="22" width="22" height="14" rx="3"/>' +
                '<path d="M35 25h3a3 3 0 0 1 0 6h-3"/>' +
              '</svg>' +
              '<h3 class="ctitle">Pick Your Vibe</h3>' +
              '<p class="cbody">Every drink your way — Smoke if it’s hot, Iced Out if it’s cold.</p>' +
            '</article>' +

            '<article class="card"><div class="num">04</div>' +
              '<svg class="icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                '<path class="twinkle" fill="currentColor" fill-opacity="0.16" stroke-width="2" ' +
                  'd="M24 11 L26.95 19.05 L35.36 19.42 L28.74 24.58 L31.05 32.68 L24 27.8 L16.95 32.68 L19.26 24.58 L12.64 19.42 L21.05 19.05 Z"/>' +
                '<path class="spark twinkle" stroke-width="2.2" d="M35.5 13.5l0 3M37 15l-3 0"/>' +
                '<path class="spark twinkle" stroke-width="2" d="M12.5 31l0 2.4M13.7 32.2l-2.4 0"/>' +
              '</svg>' +
              '<h3 class="ctitle">More Than a Café</h3>' +
              '<p class="cbody">A late-night spot for good food and better conversation.</p>' +
            '</article>' +

            '<article class="card"><div class="num">05</div>' +
              '<svg class="icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                '<path class="beat" d="M24 34s-9-5.5-9-12a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6.5-9 12-9 12z"/>' +
                '<path class="spark" d="M11 20c1-1 2-1 3 0M34 20c1-1 2-1 3 0"/>' +
              '</svg>' +
              '<h3 class="ctitle">Family-Owned</h3>' +
              '<p class="cbody">Not a chain. This is family — and you’re part of it.</p>' +
            '</article>' +

          '</div>' +
        '</div>';

      this._spawnSky(dens);
    }

    _spawnSky(dens) {
      var sky = this.shadowRoot.getElementById('sky');
      if (!sky) return;
      var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var rnd = function (a, b) { return a + Math.random() * (b - a); };

      var TWINKLES = Math.round(26 * dens);
      for (var i = 0; i < TWINKLES; i++) {
        var s = document.createElement('div');
        s.className = 'star' + (Math.random() < 0.18 ? ' gold' : '');
        s.style.left = rnd(2, 98) + '%';
        s.style.top  = rnd(4, 92) + '%';
        s.style.setProperty('--tdur', rnd(3, 6).toFixed(1) + 's');
        s.style.setProperty('--tdel', (-rnd(0, 6)).toFixed(1) + 's');
        sky.appendChild(s);
      }

      if (!reduce) {
        var SHOOTERS = Math.round(5 * dens);
        for (var j = 0; j < SHOOTERS; j++) {
          var sh = document.createElement('div');
          var gold = Math.random() < 0.22;
          sh.className = 'shoot' + (gold ? ' gold' : '');
          sh.style.setProperty('--sx', rnd(-6, 70) + '%');
          sh.style.setProperty('--sy', rnd(2, 55) + '%');
          sh.style.setProperty('--ang', rnd(14, 26).toFixed(1) + 'deg');
          sh.style.setProperty('--len', rnd(90, 170).toFixed(0) + 'px');
          sh.style.setProperty('--travel', rnd(380, 620).toFixed(0) + 'px');
          var dur = rnd(7, 12);
          sh.style.setProperty('--sdur', dur.toFixed(1) + 's');
          sh.style.setProperty('--sdel', (-rnd(0, dur)).toFixed(1) + 's');
          sky.appendChild(sh);
        }
      }
    }
  }

  customElements.define('pops-why-a-hit', PopsWhyAHit);
})();
