import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { clickable } from '../lib/a11y';
import { CAT_GRADIENTS } from './palette';
import { SiteFooter, SiteHeader } from './SiteChrome';
import { useSiteTheme } from '../state/SiteThemeContext';

interface CardItem {
  icon: string;
  t: string;
  d: string;
}
interface ListItem {
  t: string;
  meta: string;
  tag: string;
}
interface PostItem {
  t: string;
  meta: string;
  d: string;
  hue?: number;
}
interface FaqItem {
  q: string;
  a: string;
}
interface DocItem {
  h: string;
  p: string;
}
type Block =
  | { type: 'cards'; items: CardItem[] }
  | { type: 'list'; action: string; items: ListItem[] }
  | { type: 'posts'; items: PostItem[] }
  | { type: 'faq'; items: FaqItem[] }
  | { type: 'doc'; items: DocItem[] }
  | { type: 'form' };
interface PageData {
  title: string;
  sub: string;
  blocks: Block[];
}

/**
 * Generic subpage renderer (donely-landing.dc.html `isPage` branch) — one component drives all 9
 * marketing subpages, content-driven from `landing.pages.<key>` (i18n, both langs, identical
 * shape). Shares the same header/footer as the landing page (CLAUDE.md build brief §1) and stays
 * viewable whether the visitor is logged in or out (mounted as a top-level route in App.tsx, not
 * nested inside the authenticated app shell).
 */
export default function Subpage({ pageKey }: { pageKey: string }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { dark } = useSiteTheme();
  const page = t(`landing.pages.${pageKey}`, { returnObjects: true }) as PageData;

  useEffect(() => {
    const se = document.scrollingElement || document.documentElement;
    if (se) se.scrollTop = 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageKey, i18n.language]);

  return (
    <div className="dt min-h-screen flex flex-col bg-[var(--bgGrad)]" data-dk={dark ? '1' : '0'}>
      <SiteHeader />

      <section className="bg-[var(--tint)] border-b border-border">
        <div className="max-w-[920px] mx-auto p-[clamp(36px,5vw,64px)_22px]">
          <span
            {...clickable(() => navigate('/'))}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--acc)] cursor-pointer"
          >
            <span aria-hidden="true">‹</span> {t('landing.backHome')}
          </span>
          <h1 className="font-['Bricolage_Grotesque',sans-serif] text-[clamp(34px,5vw,52px)] font-extrabold text-[var(--ink)] m-[14px_0_0] tracking-[-0.01em]">
            {page.title}
          </h1>
          <p className="text-[16.5px] text-muted m-[12px_0_0] max-w-[640px] leading-[1.55]">{page.sub}</p>
        </div>
      </section>

      <section className="max-w-[920px] mx-auto w-full box-border p-[clamp(30px,4vw,48px)_22px_80px] flex flex-col gap-10 flex-1">
        {page.blocks.map((block, i) => (
          <BlockRenderer key={i} block={block} />
        ))}
      </section>

      <SiteFooter />
    </div>
  );
}

function BlockRenderer({ block }: { block: Block }) {
  switch (block.type) {
    case 'cards':
      return <CardsBlock items={block.items} />;
    case 'list':
      return <ListBlock action={block.action} items={block.items} />;
    case 'posts':
      return <PostsBlock items={block.items} />;
    case 'faq':
      return <FaqBlock items={block.items} />;
    case 'doc':
      return <DocBlock items={block.items} />;
    case 'form':
      return <ContactForm />;
    default:
      return null;
  }
}

function CardsBlock({ items }: { items: CardItem[] }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
      {items.map((it) => (
        <div key={it.t} className="bg-surface border border-border rounded-[20px] p-6">
          <div aria-hidden="true" className="w-[46px] h-[46px] rounded-[13px] bg-[var(--tint)] text-[var(--acc)] flex items-center justify-center text-[22px]">
            {it.icon}
          </div>
          <div className="font-['Bricolage_Grotesque',sans-serif] text-lg font-bold text-[var(--ink)] mt-[14px]">{it.t}</div>
          <div className="text-sm text-muted leading-[1.55] mt-1.5">{it.d}</div>
        </div>
      ))}
    </div>
  );
}

function ListBlock({ action, items }: { action: string; items: ListItem[] }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-[10px]">
      {items.map((it) => (
        <div
          key={it.t}
          className="flex items-center gap-[14px] flex-wrap bg-surface border border-border rounded-[18px] p-[16px_18px]"
        >
          <div className="flex-1 min-w-[200px]">
            <div className="text-[15.5px] font-extrabold text-[var(--ink)]">{it.t}</div>
            <div className="text-[13px] text-muted2 mt-[3px]">{it.meta}</div>
          </div>
          <span className="bg-[var(--tint)] text-[var(--accInk)] rounded-[10px] p-[5px_10px] text-[11.5px] font-extrabold">{it.tag}</span>
          <a href={`mailto:${t('landing.applyEmail')}`} className="bg-[var(--acc)] text-[var(--onacc)] rounded-xl p-[9px_16px] text-[13px] font-extrabold">
            {action}
          </a>
        </div>
      ))}
    </div>
  );
}

function PostsBlock({ items }: { items: PostItem[] }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
      {items.map((it, i) => {
        const [sA, sB] = CAT_GRADIENTS[(it.hue ?? i) % CAT_GRADIENTS.length];
        return (
          <div key={it.t} className="dt-post-card bg-surface border border-border rounded-[20px] overflow-hidden cursor-pointer transition-shadow duration-[250ms]">
            <div
              className="h-[110px] relative overflow-hidden"
              // eslint-disable-next-line react/no-inline-styles -- dynamic: per-post gradient stops (CAT_GRADIENTS[hue])
              style={{ background: `linear-gradient(135deg,${sA},${sB})` }}
            >
              <div className="absolute inset-0 opacity-[.12] bg-[repeating-linear-gradient(45deg,#fff,#fff_6px,transparent_6px,transparent_14px)]" />
            </div>
            <div className="p-[14px_18px_18px]">
              <div className="text-xs text-[var(--soft)] font-semibold">{it.meta}</div>
              <div className="font-['Bricolage_Grotesque',sans-serif] text-[17px] font-bold text-[var(--ink)] mt-1.5 leading-[1.25]">{it.t}</div>
              <div className="text-[13.5px] text-muted leading-[1.5] mt-[7px]">{it.d}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function FaqBlock({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="flex flex-col gap-[10px]">
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={it.q} className="bg-surface border border-border rounded-2xl overflow-hidden">
            <div
              {...clickable(() => setOpen(isOpen ? null : i), { expanded: isOpen })}
              id={`faq-q-${i}`}
              aria-controls={`faq-a-${i}`}
              className="flex items-center gap-3 p-[15px_18px] cursor-pointer"
            >
              <span className="flex-1 text-[15px] font-bold text-[var(--ink)]">{it.q}</span>
              <span aria-hidden="true" className="text-[var(--acc)] text-[18px] font-extrabold w-5 text-center">{isOpen ? '−' : '+'}</span>
            </div>
            {isOpen && (
              <div id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`} className="p-[0_18px_16px] text-sm text-muted leading-[1.6] animate-[dfade_0.25s_ease]">
                {it.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function DocBlock({ items }: { items: DocItem[] }) {
  return (
    <div className="flex flex-col gap-6">
      {items.map((it) => (
        <div key={it.h}>
          <div className="font-['Bricolage_Grotesque',sans-serif] text-[19px] font-bold text-[var(--ink)]">{it.h}</div>
          <div className="text-[14.5px] text-muted leading-[1.65] mt-2 max-w-[720px]">{it.p}</div>
        </div>
      ))}
    </div>
  );
}

/** Contact form (kontakt/contact page) — client-only per CLAUDE.md build brief §3: no backend
 * endpoint exists for this, so submitting just flips local `sent` state (matches design's
 * `formSent` behavior 1:1 — no persistence, no API call). */
function ContactForm() {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [sent, setSent] = useState(false);

  const ok = email.trim().length > 2 && msg.trim().length > 2;

  if (sent) {
    return (
      <div className="flex items-center gap-[10px] bg-[var(--okbg)] text-[var(--okfg)] rounded-2xl p-[16px_18px] text-[14.5px] font-bold max-w-[560px]">
        <span aria-hidden="true">✓</span> {t('landing.form.thanks')}
      </div>
    );
  }

  const fieldBase =
    "w-full box-border rounded-[14px] border-[1.5px] border-border bg-bg text-[var(--ink)] p-[13px_14px] font-['Figtree',sans-serif] text-sm outline-none";
  const inputClass = clsx(fieldBase, 'font-semibold');
  const textareaClass = clsx(fieldBase, 'font-medium h-[110px] resize-none');

  return (
    <div className="bg-surface border border-border rounded-[20px] p-6 max-w-[560px] flex flex-col gap-3">
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('landing.form.name')} aria-label={t('landing.form.name')} className={inputClass} />
      <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder={t('landing.form.email')} aria-label={t('landing.form.email')} className={inputClass} />
      <textarea
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
        placeholder={t('landing.form.msg')}
        aria-label={t('landing.form.msg')}
        className={textareaClass}
      />
      <div
        {...clickable(() => setSent(true), { disabled: !ok })}
        className="text-center rounded-[14px] p-[13px] text-[14.5px] font-extrabold cursor-pointer"
        // eslint-disable-next-line react/no-inline-styles -- dynamic: enabled/disabled visual state depends on form validity
        style={{ background: ok ? 'var(--acc)' : 'var(--surface2)', color: ok ? 'var(--onacc)' : 'var(--soft)' }}
      >
        {t('landing.form.send')}
      </div>
    </div>
  );
}
