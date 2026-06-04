/* ===========================================================================
   <pops-starfield> — Pop's Place starfield as a WIX CUSTOM ELEMENT.

   WHY THIS EXISTS (vs the HTML iframe embed):
   A Wix "HTML iframe" embed is a sandboxed iframe that Wix LAZY-LOADS on scroll
   — that's the pop-in you saw. A Wix CUSTOM ELEMENT instead renders DIRECTLY in
   the page DOM on the published site and runs connectedCallback() the moment
   it's attached, so it paints with the page. No iframe, no scroll pop-in.

   REQUIREMENTS (Wix side): site must have a CONNECTED DOMAIN and NO Wix ads
   (premium). Then: Add Elements > Embed & Social > Custom Element.

   HOW TO REGISTER IN WIX:
   1. Host this file over HTTPS — either:
        a) as a Velo public file (recommended), or
        b) on any external HTTPS server, then use "Server URL".
   2. In the Custom Element settings: Choose Source > point to this file's URL.
   3. Tag Name:  pops-starfield   (must be two words with a dash — this matches
      the customElements.define() call at the bottom).
   4. Size/dock the element to FILL the section, send it to the BACK.

   ATTRIBUTES you can set on the element (optional, all have sane defaults):
     mode="hero"   -> top violet glow + flat dark bottom (Section 1 / hero).
     mode="wedge"  -> flat dark + a diagonal clip at the bottom (grey-section
                      transition). Use cut-left / cut-right to set the slant.
     mode="flat"   -> flat dark canvas, no glow, no clip (generic background).
     density="..." -> star multiplier (1 = default, 1.6 = fuller, 0.7 = sparser).
     cut-left="64%"  cut-right="14%"   (only used when mode="wedge")

   It uses Shadow DOM so its CSS can't leak into / be broken by Wix's styles.
   Brand: canvas #0B0710 · violet #8A4FFF · glow #B57BFF · gold #F5C542 ·
   periwinkle #BFC4F0.
   =========================================================================== */
(function () {
  if (customElements.get('pops-starfield')) return; // guard against double-define

  class PopsStarfield extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this._built = false;
    }

    static get observedAttributes() {
      return ['mode', 'density', 'cut-left', 'cut-right'];
    }

    connectedCallback() {
      // Runs immediately on attach to the live DOM — this is the no-pop-in win.
      if (!this._built) this._build();
    }

    attributeChangedCallback() {
      if (this._built) this._build(); // rebuild if Wix changes an attribute
    }

    _build() {
      this._built = true;
      var mode   = (this.getAttribute('mode') || 'hero').toLowerCase();
      var dens   = parseFloat(this.getAttribute('density') || '1') || 1;
      var cutL   = this.getAttribute('cut-left')  || '64%';
      var cutR   = this.getAttribute('cut-right') || '14%';
      var reduce = window.matchMedia &&
                   window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // ---- background per mode -------------------------------------------
      var bg, clip = 'none';
      if (mode === 'hero') {
        // top violet glow, flat dark bottom (matches the live hero embed)
        bg = 'radial-gradient(120% 80% at 50% -10%, rgba(138,79,255,0.18) 0%, rgba(11,7,16,0) 50%), #0B0710';
      } else if (mode === 'wedge') {
        bg = '#0B0710'; // flat — it's the BOTTOM/continuation of the hero sky
        clip = 'polygon(0 0, 100% 0, 100% ' + cutR + ', 0 ' + cutL + ')';
      } else { // 'flat'
        bg = '#0B0710';
      }

      // ---- shadow DOM markup + scoped styles ------------------------------
      this.shadowRoot.innerHTML =
        '<style>' +
        // :host is a positioning context so .scene's inset:0 resolves; height:100%
        // fills the Wix box, and min-height is a fallback so it never collapses to
        // 0px (which would render invisible) if Wix gives the host an auto height.
        ':host{display:block;position:relative;width:100%;height:100%;min-height:120px;}' +
        '.scene{position:absolute;inset:0;pointer-events:none;overflow:hidden;' +
          'background:' + bg + ';' +
          '-webkit-clip-path:' + clip + ';clip-path:' + clip + ';}' +
        '.star{position:absolute;width:2px;height:2px;border-radius:50%;' +
          'background:#BFC4F0;opacity:0;box-shadow:0 0 6px 1px rgba(181,123,255,.55);' +
          'animation:twk var(--tdur,4s) ease-in-out infinite;animation-delay:var(--tdel,0s);}' +
        '.star.gold{background:#F5C542;box-shadow:0 0 6px 1px rgba(245,197,66,.65);}' +
        '@keyframes twk{0%,100%{opacity:0;transform:scale(.6);}50%{opacity:.5;transform:scale(1);}}' +
        '.shoot{position:absolute;left:var(--sx);top:var(--sy);' +
          'width:var(--len,120px);height:1.6px;border-radius:2px;opacity:0;' +
          'background:linear-gradient(90deg,rgba(181,123,255,0) 0%,rgba(181,123,255,0) 42%,' +
            'rgba(181,123,255,.5) 86%,rgba(244,241,250,.95) 100%);' +
          'filter:drop-shadow(0 0 4px rgba(181,123,255,.55));' +
          'animation:shoot var(--sdur,8s) linear infinite;animation-delay:var(--sdel,0s);' +
          'will-change:transform,opacity;}' +
        '.shoot.gold{background:linear-gradient(90deg,rgba(245,197,66,0) 0%,rgba(245,197,66,0) 42%,' +
            'rgba(245,197,66,.5) 86%,#fff 100%);filter:drop-shadow(0 0 5px rgba(245,197,66,.7));}' +
        '@keyframes shoot{0%{opacity:0;transform:rotate(var(--ang,20deg)) translateX(-20px) scaleX(.5);}' +
          '4%{opacity:.85;}7%{transform:rotate(var(--ang,20deg)) translateX(30px) scaleX(1);}' +
          '14%{opacity:0;transform:rotate(var(--ang,20deg)) translateX(var(--travel,460px)) scaleX(1);}' +
          '100%{opacity:0;transform:rotate(var(--ang,20deg)) translateX(var(--travel,460px)) scaleX(1);}}' +
        '@media (prefers-reduced-motion: reduce){.shoot{display:none;}.star{animation:none;opacity:.35;}}' +
        '</style>' +
        '<div class="scene"><div class="sky"></div></div>';

      var sky = this.shadowRoot.querySelector('.sky');
      var rnd = function (a, b) { return a + Math.random() * (b - a); };

      // Scale star count to the element's on-screen area, then by `density`.
      var w = this.clientWidth || window.innerWidth;
      var h = this.clientHeight || 560;
      var area = Math.max(1, (w * h) / (1200 * 560));
      var TWINKLES = Math.round(26 * dens * Math.min(2.4, Math.max(0.8, area)));

      for (var i = 0; i < TWINKLES; i++) {
        var s = document.createElement('div');
        s.className = 'star' + (Math.random() < 0.18 ? ' gold' : '');
        s.style.left = rnd(2, 98) + '%';
        s.style.top  = rnd(2, mode === 'wedge' ? 90 : 98) + '%';
        s.style.setProperty('--tdur', rnd(3, 6).toFixed(1) + 's');
        s.style.setProperty('--tdel', (-rnd(0, 6)).toFixed(1) + 's');
        sky.appendChild(s);
      }

      if (!reduce) {
        var SHOOTERS = Math.round(5 * dens * Math.min(2.2, Math.max(0.8, area)));
        for (var j = 0; j < SHOOTERS; j++) {
          var sh = document.createElement('div');
          var gold = Math.random() < 0.22;
          sh.className = 'shoot' + (gold ? ' gold' : '');
          sh.style.setProperty('--sx', rnd(-6, 80) + '%');
          sh.style.setProperty('--sy', rnd(2, mode === 'wedge' ? 60 : 80) + '%');
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

  customElements.define('pops-starfield', PopsStarfield);
})();
