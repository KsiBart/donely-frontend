import { Route, Routes } from 'react-router-dom';
import AdminApp from './admin/AdminApp';
import MobileApp from './mobile/MobileApp';
import AuthPage from './landing/AuthPage';
import Subpage from './landing/Subpage';
import { SUBPAGES } from './landing/pages';

export default function App() {
  return (
    <Routes>
      <Route path="/admin/*" element={<AdminApp />} />
      {/* Unified passwordless auth (split-panel + 8-box OTP) — replaces the old in-app AuthFlow. */}
      <Route path="/login" element={<AuthPage />} />
      {/* 9 marketing subpages — public, viewable logged-in or out, shared header/footer chrome. */}
      {SUBPAGES.map(({ path, key }) => (
        <Route key={path} path={path} element={<Subpage pageKey={key} />} />
      ))}
      {/* `/` (landing when logged out) + the rest of the authenticated app — untouched routing,
          see mobile/MobileApp.tsx for the logged-out/logged-in branch logic. */}
      <Route path="/*" element={<MobileApp />} />
    </Routes>
  );
}
