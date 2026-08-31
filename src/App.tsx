import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Clients } from './pages/Clients';
import { Pipeline } from './pages/Pipeline';
import { Inventory } from './pages/Inventory';
import { SpareParts } from './pages/SpareParts';
import { Maintenance } from './pages/Maintenance';
import { Bookings } from './pages/Bookings';
import { Payments } from './pages/Payments';
import { Messages } from './pages/Messages';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { Store } from './pages/Store';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { AppProvider } from './providers/AppProvider';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { ErrorBoundary } from './components/Common/ErrorBoundary';
import { InstallPrompt } from './components/Common/InstallPrompt';
import { OfflineBanner } from './components/Common/OfflineBanner';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <HashRouter>
          <OfflineBanner />
          <Routes>
            {/* متجر عام للزبائن — بدون تسجيل دخول */}
            <Route path="/store" element={<Store />} />

            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="clients" element={<Clients />} />
                <Route path="pipeline" element={<Pipeline />} />
                <Route path="inventory" element={<Inventory />} />
                <Route path="spare-parts" element={<SpareParts />} />
                <Route path="maintenance" element={<Maintenance />} />
                <Route path="bookings" element={<Bookings />} />
                <Route path="payments" element={<Payments />} />
                <Route path="messages" element={<Messages />} />
                <Route path="reports" element={<Reports />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/store" replace />} />
          </Routes>
          <InstallPrompt />
        </HashRouter>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
