(function () {
  'use strict';

  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }

  function initMobileNav() {
    var btn = qs('[data-nav-toggle]');
    var nav = qs('[data-nav]');
    if (!btn || !nav) return;

    btn.addEventListener('click', function () {
      nav.classList.toggle('mobile-open');
      var expanded = nav.classList.contains('mobile-open');
      btn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    });

    qsa('a', nav).forEach(function (a) {
      a.addEventListener('click', function () {
        if (nav.classList.contains('mobile-open')) {
          nav.classList.remove('mobile-open');
          btn.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

  function initDemoWidget() {
    var widget = qs('[data-demo]');
    if (!widget) return;

    var change = qs('[data-change]', widget);
    var pop = qs('[data-popularity]', widget);
    var changeVal = qs('[data-change-val]', widget);
    var popVal = qs('[data-popularity-val]', widget);

    var decisionEl = qs('[data-decision]', widget);
    var explainEl = qs('[data-explain]', widget);

    function clamp(n, lo, hi) {
      return Math.max(lo, Math.min(hi, n));
    }

    function formatNumber(n) {
      return n.toLocaleString('en-US');
    }

    function labelChange(v) {
      if (v <= 20) return 'mostly reads';
      if (v <= 50) return 'mixed';
      if (v <= 80) return 'write-heavy';
      return 'mostly writes';
    }

    // Paper-inspired defaults
    var AVG_DEGREE = 32;
    var BLOCK_SIZE = 4096;
    var ID_SIZE = 8;
    var SIZE_RATIO = 10;
    var LEVELS = 4;

    function computeThreshold(writePct) {
      var lookupRatio = Math.max(1 - writePct / 100, 0.01);
      var updateRatio = Math.max(writePct / 100, 0.01);

      var mt1 = SIZE_RATIO * LEVELS + 1;

      var raw =
        (lookupRatio * AVG_DEGREE * BLOCK_SIZE) /
          (updateRatio * ID_SIZE * (SIZE_RATIO - 1) * mt1) -
        (2 * BLOCK_SIZE) / (ID_SIZE * mt1) -
        1 / mt1;

      return Math.max(Math.ceil(raw), 0);
    }

    function computeDecision(changeRate, degree) {
      var threshold = computeThreshold(changeRate);

      if (degree >= threshold) {
        return {
          mode: 'delta',
          title: 'only add updated edges',
          subtitle:
            'Aster keeps the whole node untouched and only stores the latest changed edges.',
          threshold: threshold
        };
      }

      return {
        mode: 'pivot',
        title: 'rewrite the whole node',
        subtitle:
          'Aster rewrites the full neighbor list so future lookups can stay cleaner and faster.',
        threshold: threshold
      };
    }

    function render() {
      var c = clamp(parseInt(change.value, 10) || 0, 0, 100);
      var p = clamp(parseInt(pop.value, 10) || 0, 0, 1000);

      changeVal.textContent = c + '% (' + labelChange(c) + ')';
      popVal.textContent = formatNumber(p) + ' neighbors';

      var d = computeDecision(c, p);

      decisionEl.innerHTML =
        'Aster would <span class="accent">' + d.title + '</span>.';

      explainEl.textContent =
        'Switch point: around ' +
        formatNumber(d.threshold) +
        ' neighbors. ' +
        d.subtitle;

      widget.setAttribute('data-mode', d.mode);
    }

    change.addEventListener('input', render);
    pop.addEventListener('input', render);
    render();
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileNav();
    initDemoWidget();
  });
})();