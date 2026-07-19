import { Navigate, Route, Routes } from 'react-router-dom';
import ProfileTab from '../screens/Profile';
import ProDashboard from './screens/ProDashboard';
import ProRequests from './screens/ProRequests';
import ProCalendar from './screens/ProCalendar';
import ProPayouts from './screens/ProPayouts';

/**
 * Pro-mode route content (mirrors the customer `<Routes>` block in `MobileApp.tsx`, just for the
 * `/pro/*` section). Mounted by `MobileApp` in place of the customer routes whenever
 * `isPro && mode === 'pro'` — see the `proMode` branch there for the actual gating/guard logic;
 * this component assumes the caller already checked that. `/pro/profile` reuses the exact same
 * `ProfileTab` as the customer `/profile` route (it already renders the pro-mode switch card), so
 * there's no separate pro Profile screen to maintain.
 */
export default function ProApp() {
  return (
    <Routes>
      <Route path="/pro" element={<ProDashboard />} />
      <Route path="/pro/requests" element={<ProRequests />} />
      <Route path="/pro/calendar" element={<ProCalendar />} />
      <Route path="/pro/payouts" element={<ProPayouts />} />
      <Route path="/pro/profile" element={<ProfileTab />} />
      <Route path="*" element={<Navigate to="/pro" replace />} />
    </Routes>
  );
}
