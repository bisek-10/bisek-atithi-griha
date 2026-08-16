import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'

import Home from './pages/public/Home'
import Rooms from './pages/public/Rooms'
import Facilities from './pages/public/Facilities'
import Gallery from './pages/public/Gallery'
import Contact from './pages/public/Contact'
import Privacy from './pages/public/Privacy'
import PublicLayout from './components/PublicLayout'
import Book from './pages/public/Book'

import Login from './pages/admin/Login'
import AdminLayout from './components/AdminLayout'
import Overview from './pages/admin/Overview'
import Dashboard from './pages/admin/Dashboard'
import Customers from './pages/admin/Customers'
import Settings from './pages/admin/Settings'

export default function App() {
  return (
    <Routes>
      {/* Public marketing site */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/facilities" element={<Facilities />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/book" element={<Book />} />
      </Route>

      {/* Admin */}
      <Route path="/admin/login" element={<Login />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }>
        <Route index element={<Overview />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="customers" element={<Customers />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
