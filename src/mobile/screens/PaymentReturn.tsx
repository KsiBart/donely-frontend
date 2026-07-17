import { useEffect, useRef, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../../api/client';
import { Logo } from '../../components/ui';
import { useToast } from '../../state/ToastContext';

/**
 * Landing page for the payment gateway's `urlReturn` / `cancel_url`
 * (docs/payments-research.md §1.3, §1.6, §2.2 — the gateway does a plain browser redirect here
 * with `?paymentId=<Payment.id>`). The webhook remains the actual source of truth for HELD, but
 * without this route the redirect fell through to the wildcard route and silently landed on
 * Home with no status check — an abandoned/failed checkout looked identical to a successful one
 * and had no way to retry. We check `GET /api/payments/:id`, toast the outcome, and always send
 * the customer to Bookings, where a PENDING/FAILED payment on a `paymentRequired` booking shows
 * the "Pay now" picker again (see Bookings.tsx `needsPayment`).
 */
export default function PaymentReturn() {
  const location = useLocation();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [done, setDone] = useState(false);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const isCancel = location.pathname.endsWith('/cancel');
    if (isCancel) {
      showToast(t('payments.returnCancelled'));
      setDone(true);
      return;
    }

    const paymentId = Number(new URLSearchParams(location.search).get('paymentId'));
    if (!paymentId || Number.isNaN(paymentId)) {
      setDone(true);
      return;
    }

    api
      .payment(paymentId)
      .then((p) => {
        if (p.status === 'HELD' || p.status === 'CAPTURED' || p.status === 'RELEASED') {
          showToast(t('payments.returnHeld'));
        } else if (p.status === 'FAILED') {
          showToast(t('payments.returnFailed'));
        } else {
          showToast(t('payments.returnPending'));
        }
      })
      .catch(() => showToast(t('common.error')))
      .finally(() => setDone(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!done) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ animation: 'ptpulse 1.6s infinite' }}>
          <Logo size={54} />
        </span>
      </div>
    );
  }

  return <Navigate to="/bookings" replace />;
}
