import { useEffect } from 'react';

/**
 * Scroll-reveal for `[data-reveal]` elements — React port of donely-landing.dc.html's
 * componentDidMount `arm()`/`reveal()` loop (which used a rAF loop over getBoundingClientRect).
 * An IntersectionObserver is the idiomatic React equivalent: same visual effect (fade + slide/scale,
 * direction set by `data-reveal="up|left|right|scale"`), cheaper than polling every frame. The
 * reveal is REVERSIBLE — elements re-hide (animation plays in reverse) when scrolled out of view and
 * re-reveal on the next pass. Respects `prefers-reduced-motion` by revealing everything immediately
 * without observing.
 */
export function useScrollReveal(deps: readonly unknown[] = []): void {
  useEffect(() => {
    const root = document;
    const els = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'));
    if (els.length === 0) return;

    const reduceMotion = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      els.forEach((el) => el.classList.add('is-revealed'));
      return;
    }

    els.forEach((el, i) => {
      el.style.transitionDelay = `${(i % 3) * 90}ms`;
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Reversible reveal: every `[data-reveal]` element animates BOTH ways — it slides/fades in
          // when it enters the viewport and reverses (slides/fades back out) when it leaves, so the
          // effect re-plays on every scroll pass. Never unobserve, so it keeps toggling.
          entry.target.classList.toggle('is-revealed', entry.isIntersecting);
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -10% 0px' },
    );
    els.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/**
 * Subtle parallax on `[data-plx="<factor>"]` elements (hero blobs) — sets a `--plx` custom
 * property consumed by `transform: translate3d(0, var(--plx,0px), 0)` in the element's own style,
 * matching the design's `plx()` rAF loop 1:1.
 */
export function useParallax(): void {
  useEffect(() => {
    const reduceMotion = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    let raf = 0;
    const tick = () => {
      const y = (document.scrollingElement || document.documentElement)?.scrollTop || window.pageYOffset || 0;
      document.querySelectorAll<HTMLElement>('[data-plx]').forEach((el) => {
        const factor = parseFloat(el.getAttribute('data-plx') || '0') || 0;
        el.style.setProperty('--plx', `${(y * factor).toFixed(1)}px`);
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
}
