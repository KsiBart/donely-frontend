import type { MouseEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/** Anchor sections live only on `/` (hero id="top", #how, #cats, #pros, #app). From a subpage,
 * "jump" there by navigating home first and letting `Landing` pick up `location.state.scrollTo`
 * (see Landing.tsx's own effect) — matches donely-landing.dc.html's `goNav()` (which always reset
 * to the landing view, then set `location.hash`). */
export function useAnchorNav() {
  const navigate = useNavigate();
  const location = useLocation();
  return (anchor: string) => (e?: MouseEvent) => {
    e?.preventDefault();
    if (location.pathname === '/') {
      document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/', { state: { scrollTo: anchor } });
    }
  };
}
