import { useTranslation } from 'react-i18next';
import { useConfigQuery } from '../../../api/hooks';
import { paymentMethodLabel } from '../../../lib/format';

export default function PaymentsPanelBody() {
  const { t } = useTranslation();
  const { data } = useConfigQuery();
  const methods = data?.paymentMethods ?? [];
  return (
    <div>
      <div className="text-[12.5px] text-muted mb-3.5">{t('profile.paymentsPanel.note')}</div>
      {methods.length === 0 && <div className="text-[12.5px] text-muted">{t('profile.paymentsPanel.empty')}</div>}
      {methods.length > 0 && (
        <div className="flex flex-col gap-2">
          {methods.map((m) => (
            <div key={m} className="flex items-center bg-surface2 rounded-[14px] py-3 px-3.5 font-bold text-[13.5px]">
              {paymentMethodLabel(m, t)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
