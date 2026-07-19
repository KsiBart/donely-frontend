import { Navigate, Route, Routes } from 'react-router-dom';
import Dashboard from './sections/Dashboard';
import Users from './sections/Users';
import Providers from './sections/Providers';
import Bookings from './sections/Bookings';
import Calendars from './sections/Calendars';
import Categories from './sections/Categories';
import Billing from './sections/Billing';

/** The `/admin/*` section route table — split out of AdminApp so the shell stays focused on
 * layout/auth-gating. */
export default function AdminRoutes() {
  return (
    <Routes>
      <Route index element={<Dashboard />} />
      <Route path="users" element={<Users />} />
      <Route path="providers" element={<Providers />} />
      <Route path="bookings" element={<Bookings />} />
      <Route path="calendars" element={<Calendars />} />
      <Route path="categories" element={<Categories />} />
      <Route path="billing" element={<Billing />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}
