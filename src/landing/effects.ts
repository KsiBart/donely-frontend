import { useEffect } from 'react';

/**
 * Scroll-reveal for `[data-reveal]` elements — React port of donely-landing.dc.html's
 * componentDidMount `arm()`/`reveal()` loop (which used a rAF loop over getBoundingClientRect).
 * An IntersectionObserver is the idiomatic React equivalent: same visual effect (fade + slide/scale
 * in once, direction set by `data-reveal="up|left|right|scale"`), cheaper than polling every frame.
 * Respects `prefers-reduced-motion` by revealing everything immediately without observing.
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
          // `data-reveal-repeat` elements (e.g. the category cards) animate BOTH ways: they slide in
          // when they enter and slide back out (reverse) when they leave the viewport, so scrolling
          // up un-reveals them. Everything else reveals once and is unobserved.
          const repeat = entry.target.hasAttribute('data-reveal-repeat');
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            if (!repeat) observer.unobserve(entry.target);
          } else if (repeat) {
            entry.target.classList.remove('is-revealed');
          }
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
