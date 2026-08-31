import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ClientModal } from '../Clients/ClientModal';
import { useClients } from '../../hooks/useClients';
import './Layout.css';

export const Layout: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const { addClient } = useClients();

  React.useEffect(() => {
    const handleOpenModal = () => setIsModalOpen(true);
    document.addEventListener('open-add-client-modal', handleOpenModal);
    return () => document.removeEventListener('open-add-client-modal', handleOpenModal);
  }, []);

  // إغلاق القائمة عند تغيير حجم الشاشة للكمبيوتر
  React.useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 900) setSidebarOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div className={`layout ${sidebarOpen ? 'sidebar-open' : ''}`}>
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}
      <Sidebar onNavigate={() => setSidebarOpen(false)} mobileOpen={sidebarOpen} />
      <div className="layout-content">
        <Header onMenuClick={() => setSidebarOpen((v) => !v)} />
        <main className="main-content">
          <Outlet />
        </main>
      </div>

      <ClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={addClient}
      />
    </div>
  );
};
