import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../api/client';
import type { AdminUser } from '../../api/types';
import { clickable } from '../../lib/a11y';
import { useToast } from '../../state/ToastContext';
import { StatusChip, TableHead, cardStyle, rowStyle } from '../ui';

const COLS = '1.4fr 1.6fr 1fr .7fr .8fr .9fr';

function bookingCount(u: AdminUser): number {
  return u.bookingsCount ?? u.bookingCount ?? u.count ?? 0;
}

export default function Users() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [q, setQ] = useState('');

  useEffect(() => {
    api.adminUsers(q).then(setUsers).catch((e) => showToast(e instanceof Error ? e.message : t('common.error')));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  function roles(u: AdminUser): string {
    if (u.roles) return u.roles;
    const parts: string[] = [];
    if (u.isCustomer) parts.push(t('admin.users.roleCustomer'));
    if (u.isProvider) parts.push(t('admin.users.roleProvider'));
    if (u.isAdmin) parts.push(t('admin.users.roleAdmin'));
    return parts.join(' + ') || t('admin.users.roleCustomer');
  }

  const toggle = async (u: AdminUser) => {
    try {
      if (u.blocked) await api.adminUnblockUser(u.id);
      else await api.adminBlockUser(u.id);
      setUsers((list) => list.map((x) => (x.id === u.id ? { ...x, blocked: !x.blocked } : x)));
      showToast(u.blocked ? t('admin.users.unblockedToast', { name: u.name }) : t('admin.users.blockedToast', { name: u.name }));
    } catch (e) {
      showToast(e instanceof Error ? e.message : t('common.error'));
    }
  };

  const columns = t('admin.users.columns', { returnObjects: true }) as unknown as string[];

  return (
    <>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t('admin.users.searchPlaceholder') ?? ''}
          aria-label={t('admin.users.searchPlaceholder') ?? ''}
          style={{
            flex: 1,
            maxWidth: 340,
            borderRadius: 14,
            border: '1.5px solid var(--border)',
            background: 'var(--surface)',
            padding: '11px 14px',
            font: "600 13px 'Figtree', sans-serif",
            color: 'var(--text)',
            outline: 'none',
          }}
        />
        <span style={{ alignSelf: 'center', fontSize: 12.5, color: 'var(--muted)' }}>
          {t('admin.users.accountsCount', { count: users.length })}
        </span>
      </div>
      <div style={{ ...cardStyle, overflow: 'hidden' }}>
        <TableHead cols={COLS} columns={columns} />
        {users.map((u) => (
          <div key={u.id} style={rowStyle(COLS)}>
            <span style={{ fontWeight: 700 }}>{u.name}</span>
            <span style={{ color: 'var(--muted2)', fontSize: 12.5 }}>{u.email}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)' }}>{roles(u)}</span>
            <span style={{ color: 'var(--muted2)' }}>{bookingCount(u)}</span>
            <StatusChip bg={u.blocked ? 'var(--danger-bg)' : 'var(--ver-bg)'} fg={u.blocked ? '#d64550' : '#3e7a48'}>
              {u.blocked ? t('admin.users.statusBlocked') : t('admin.users.statusActive')}
            </StatusChip>
            <span
              {...clickable(() => void toggle(u))}
              style={{ fontSize: 12, fontWeight: 700, color: u.blocked ? '#3e7a48' : '#d64550', cursor: 'pointer', justifySelf: 'end' }}
            >
              {u.blocked ? t('admin.users.unblock') : t('admin.users.block')}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
