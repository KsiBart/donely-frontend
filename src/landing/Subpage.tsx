import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { BRICO } from '../lib/format';
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
    <div className="dt" data-dk={dark ? '1' : '0'} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bgGrad)' }}>
      <SiteHeader />

      <section style={{ background: 'var(--tint)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 920, margin: '0 auto', padding: 'clamp(36px,5vw,64px) 22px' }}>
          <span
            {...clickable(() => navigate('/'))}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 700, color: 'var(--acc)', cursor: 'pointer' }}
          >
            <span aria-hidden="true">‹</span> {t('landing.backHome')}
          </span>
          <h1 style={{ fontFamily: BRICO, fontSize: 'clamp(34px,5vw,52px)', fontWeight: 800, color: 'var(--ink)', margin: '14px 0 0', letterSpacing: '-.01em' }}>
            {page.title}
          </h1>
          <p style={{ fontSize: 16.5, color: 'var(--muted)', margin: '12px 0 0', maxWidth: 640, lineHeight: 1.55 }}>{page.sub}</p>
        </div>
      </section>

      <section style={{ maxWidth: 920, margin: '0 auto', width: '100%', boxSizing: 'border-box', padding: 'clamp(30px,4vw,48px) 22px 80px', display: 'flex', flexDirection: 'column', gap: 40, flex: 1 }}>
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
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 16 }}>
      {items.map((it) => (
        <div key={it.t} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 24 }}>
          <div aria-hidden="true" style={{ width: 46, height: 46, borderRadius: 13, background: 'var(--tint)', color: 'var(--acc)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
            {it.icon}
          </div>
          <div style={{ fontFamily: BRICO, fontSize: 18, fontWeight: 700, color: 'var(--ink)', marginTop: 14 }}>{it.t}</div>
          <div style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.55, marginTop: 6 }}>{it.d}</div>
        </div>
      ))}
    </div>
  );
}

function ListBlock({ action, items }: { action: string; items: ListItem[] }) {
  const { t } = useTranslation();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {items.map((it) => (
        <div
          key={it.t}
          style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: '16px 18px' }}
        >
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 15.5, fontWeight: 800, color: 'var(--ink)' }}>{it.t}</div>
            <div style={{ fontSize: 13, color: 'var(--muted2)', marginTop: 3 }}>{it.meta}</div>
          </div>
          <span style={{ background: 'var(--tint)', color: 'var(--accInk)', borderRadius: 10, padding: '5px 10px', fontSize: 11.5, fontWeight: 800 }}>{it.tag}</span>
          <a href={`mailto:${t('landing.applyEmail')}`} style={{ background: 'var(--acc)', color: 'var(--onacc)', borderRadius: 12, padding: '9px 16px', fontSize: 13, fontWeight: 800 }}>
            {action}
          </a>
        </div>
      ))}
    </div>
  );
}

function PostsBlock({ items }: { items: PostItem[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))', gap: 16 }}>
      {items.map((it, i) => {
        const [sA, sB] = CAT_GRADIENTS[(it.hue ?? i) % CAT_GRADIENTS.length];
        return (
          <div key={it.t} className="dt-post-card" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden', cursor: 'pointer', transition: 'box-shadow .25s' }}>
            <div style={{ height: 110, position: 'relative', overflow: 'hidden', background: `linear-gradient(135deg,${sA},${sB})` }}>
              <div style={{ position: 'absolute', inset: 0, opacity: 0.12, background: 'repeating-linear-gradient(45deg,#fff,#fff 6px,transparent 6px,transparent 14px)' }} />
            </div>
            <div style={{ padding: '14px 18px 18px' }}>
              <div style={{ fontSize: 12, color: 'var(--soft)', fontWeight: 600 }}>{it.meta}</div>
              <div style={{ fontFamily: BRICO, fontSize: 17, fontWeight: 700, color: 'var(--ink)', marginTop: 6, lineHeight: 1.25 }}>{it.t}</div>
              <div style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.5, marginTop: 7 }}>{it.d}</div>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={it.q} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
            <div
              {...clickable(() => setOpen(isOpen ? null : i), { expanded: isOpen })}
              id={`faq-q-${i}`}
              aria-controls={`faq-a-${i}`}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '15px 18px', cursor: 'pointer' }}
            >
              <span style={{ flex: 1, fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>{it.q}</span>
              <span aria-hidden="true" style={{ color: 'var(--acc)', fontSize: 18, fontWeight: 800, width: 20, textAlign: 'center' }}>{isOpen ? '−' : '+'}</span>
            </div>
            {isOpen && (
              <div id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`} style={{ padding: '0 18px 16px', fontSize: 14, color: 'var(--muted)', lineHeight: 1.6, animation: 'dfade .25s ease' }}>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {items.map((it) => (
        <div key={it.h}>
          <div style={{ fontFamily: BRICO, fontSize: 19, fontWeight: 700, color: 'var(--ink)' }}>{it.h}</div>
          <div style={{ fontSize: 14.5, color: 'var(--muted)', lineHeight: 1.65, marginTop: 8, maxWidth: 720 }}>{it.p}</div>
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--okbg)', color: 'var(--okfg)', borderRadius: 16, padding: '16px 18px', fontSize: 14.5, fontWeight: 700, maxWidth: 560 }}>
        <span aria-hidden="true">✓</span> {t('landing.form.thanks')}
      </div>
    );
  }

  const inputStyle = {
    width: '100%',
    boxSizing: 'border-box' as const,
    borderRadius: 14,
    border: '1.5px solid var(--border)',
    background: 'var(--bg)',
    color: 'var(--ink)',
    padding: '13px 14px',
    font: "600 14px 'Figtree', sans-serif",
    outline: 'none',
  };

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 24, maxWidth: 560, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('landing.form.name')} aria-label={t('landing.form.name')} style={inputStyle} />
      <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder={t('landing.form.email')} aria-label={t('landing.form.email')} style={inputStyle} />
      <textarea
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
        placeholder={t('landing.form.msg')}
        aria-label={t('landing.form.msg')}
        style={{ ...inputStyle, height: 110, resize: 'none', font: "500 14px 'Figtree', sans-serif" }}
      />
      <div
        {...clickable(() => setSent(true), { disabled: !ok })}
        style={{
          textAlign: 'center',
          background: ok ? 'var(--acc)' : 'var(--surface2)',
          color: ok ? 'var(--onacc)' : 'var(--soft)',
          borderRadius: 14,
          padding: 13,
          fontSize: 14.5,
          fontWeight: 800,
          cursor: 'pointer',
        }}
      >
        {t('landing.form.send')}
      </div>
    </div>
  );
}
