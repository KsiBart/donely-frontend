import { ddmm } from '../../../lib/format';

export interface WizardDay {
  label: string;
  sub: string;
  date: Date;
}

export function buildDays(t: (k: string) => string, dowFull: string[], dowShort: string[]): WizardDay[] {
  const out: WizardDay[] = [];
  for (let i = 0; i < 3; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    d.setHours(0, 0, 0, 0);
    const label = i === 0 ? t('booking.dayToday') : i === 1 ? t('booking.dayTomorrow') : dowFull[d.getDay()];
    const sub = i === 2 ? ddmm(d) : `${dowShort[d.getDay()]} ${ddmm(d)}`;
    out.push({ label, sub, date: d });
  }
  return out;
}
