import { useEffect, useRef, useState } from 'react';
import { AVATAR_COLORS } from '../palette';

export interface ScenarioPro {
  init: string;
  name: string;
  cat: string;
  meta: string;
  slot: string;
  verified: boolean;
}
export interface Scenario {
  q: string;
  kw: string[];
  pros: ScenarioPro[];
}

/**
 * Hero search/scenario-cycling state (extracted 1:1 from Landing.tsx). Cycles through
 * `landing.scenarios` every 3.8s while the search box is empty; typing a query matches a
 * scenario by keyword instead. Returns the derived "matched by AI" card data.
 */
export function useHeroSearch(scenarios: Scenario[]) {
  const [query, setQuery] = useState('');
  const [scene, setScene] = useState(0);
  const queryRef = useRef(query);
  useEffect(() => {
    queryRef.current = query;
  }, [query]);
  useEffect(() => {
    const id = window.setInterval(() => {
      if (!queryRef.current.trim()) setScene((s) => s + 1);
    }, 3800);
    return () => window.clearInterval(id);
  }, []);

  const qraw = query.trim().toLowerCase();
  let idx = qraw ? scenarios.findIndex((sc) => sc.kw.some((k) => qraw.includes(k))) : -1;
  if (idx < 0) idx = ((scene % scenarios.length) + scenarios.length) % scenarios.length;
  const activeScenario = scenarios[idx];
  const heroMatched = activeScenario.pros.map((p, i) => ({ ...p, bg: AVATAR_COLORS[i % AVATAR_COLORS.length], delay: i * 90 }));
  const heroQueryShown = query.trim() || activeScenario.q;
  const sceneKey = `sc${idx}${qraw ? '-q' : '-c'}`;

  return { query, setQuery, heroMatched, heroQueryShown, sceneKey };
}
