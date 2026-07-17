import { Route, Routes } from 'react-router-dom';
import AdminApp from './admin/AdminApp';
import MobileApp from './mobile/MobileApp';

export default function App() {
  return (
    <Routes>
      <Route path="/admin/*" element={<AdminApp />} />
      <Route path="/*" element={<MobileApp />} />
    </Routes>
  );
}
