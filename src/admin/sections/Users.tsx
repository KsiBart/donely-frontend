import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAdminBlockUserMutation, useAdminUnblockUserMutation, useAdminUsersQuery } from '../../api/hooks';
import type { AdminUser } from '../../api/models';
import { clickable } from '../../lib/a11y';
import { useToast } from '../../state/ToastContext';
import { CARD_CLASS, StatusChip, TableHead, rowClass } from '../ui';

const COLS = '1.4fr 1.6fr 1fr .7fr .8fr .9fr';

function bookingCount(u: AdminUser): number {
  return u.bookingsCount ?? u.bookingCount ?? u.count ?? 0;
}

export default function Users() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [q, setQ] = useState('');
  const { data, error } = useAdminUsersQuery(q);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const blockUserMutation = useAdminBlockUserMutation();
  const unblockUserMutation = useAdminUnblockUserMutation();

  useEffect(() => {
    if (data) setUsers(data);
  }, [data]);

  useEffect(() => {
    if (error) showToast(error instanceof Error ? error.message : t('common.error'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

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
      if (u.blocked) await unblockUserMutation.mutateAsync(u.id);
      else await blockUserMutation.mutateAsync(u.id);
      setUsers((list) => list.map((x) => (x.id === u.id ? { ...x, blocked: !x.blocked } : x)));
      showToast(u.blocked ? t('admin.users.unblockedToast', { name: u.name }) : t('admin.users.blockedToast', { name: u.name }));
    } catch (e) {
      showToast(e instanceof Error ? e.message : t('common.error'));
    }
  };

  const columns = t('admin.users.columns', { returnObjects: true }) as unknown as string[];

  return (
    <>
      <div className="mb-4 flex gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t('admin.users.searchPlaceholder') ?? ''}
          aria-label={t('admin.users.searchPlaceholder') ?? ''}
          className="max-w-[340px] flex-1 rounded-2xl border-[1.5px] border-border bg-surface px-3.5 py-[11px] font-[Figtree,sans-serif] text-[13px] font-semibold text-text outline-none"
        />
        <span className="self-center text-[12.5px] text-muted">{t('admin.users.accountsCount', { count: users.length })}</span>
      </div>
      <div className={`${CARD_CLASS} overflow-hidden`}>
        <TableHead cols={COLS} columns={columns} />
        {users.map((u) => (
          <div
            key={u.id}
            className={rowClass()}
            // eslint-disable-next-line react/no-inline-styles -- dynamic: gridTemplateColumns is a runtime string constant, Tailwind JIT can't scan it
            style={{ gridTemplateColumns: COLS }}
          >
            <span className="font-bold">{u.name}</span>
            <span className="text-[12.5px] text-muted2">{u.email}</span>
            <span className="text-[11px] font-bold text-accent">{roles(u)}</span>
            <span className="text-muted2">{bookingCount(u)}</span>
            <StatusChip bg={u.blocked ? 'var(--danger-bg)' : 'var(--ver-bg)'} fg={u.blocked ? '#d64550' : '#3e7a48'}>
              {u.blocked ? t('admin.users.statusBlocked') : t('admin.users.statusActive')}
            </StatusChip>
            <span
              {...clickable(() => void toggle(u))}
              className={clsx('justify-self-end cursor-pointer text-[12px] font-bold', u.blocked ? 'text-[#3e7a48]' : 'text-[#d64550]')}
            >
              {u.blocked ? t('admin.users.unblock') : t('admin.users.block')}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
