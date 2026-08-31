import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, Filter, Settings, Car, LogOut,
  Package, BarChart3, Wrench, CalendarClock, Calendar, Wallet, MessageCircle,
} from 'lucide-react';
import { useAuth } from '../../auth/useAuth';
import './Sidebar.css';

interface SidebarProps {
  onNavigate?: () => void;
  mobileOpen?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ onNavigate }) => {
  const { user, signOut } = useAuth();

  const navItems = [
    { path: '/', label: 'لوحة التحكم', icon: <LayoutDashboard size={20} /> },
    { path: '/clients', label: 'العملاء', icon: <Users size={20} /> },
    { path: '/pipeline', label: 'مراحل المبيعات', icon: <Filter size={20} /> },
    { path: '/inventory', label: 'المخزون', icon: <Package size={20} /> },
    { path: '/spare-parts', label: 'قطع الغيار', icon: <Wrench size={20} /> },
    { path: '/maintenance', label: 'الصيانة الدورية', icon: <CalendarClock size={20} /> },
    { path: '/bookings', label: 'الحجوزات', icon: <Calendar size={20} /> },
    { path: '/payments', label: 'الدفعات', icon: <Wallet size={20} /> },
    { path: '/messages', label: 'رسائل واتساب', icon: <MessageCircle size={20} /> },
    { path: '/reports', label: 'تقارير الأرباح', icon: <BarChart3 size={20} /> },
    { path: '/settings', label: 'الإعدادات', icon: <Settings size={20} /> },
  ];

  return (
    <aside className="sidebar glass">
      <div className="sidebar-header">
        <div className="logo-container">
          <Car size={28} className="logo-icon" />
          <h1 className="logo-text">AutoCRM</h1>
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul className="nav-list">
          {navItems.map((item) => (
            <li key={item.path} className="nav-item">
              <NavLink
                to={item.path}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={() => onNavigate?.()}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar">
            {user?.email?.[0].toUpperCase() || 'U'}
          </div>
          <div className="user-info">
            <p className="user-name">{user?.email?.split('@')[0] || 'مستخدم'}</p>
            <p className="user-role">مكتب سيارات صينية</p>
          </div>
          <button
            className="logout-btn"
            onClick={() => signOut()}
            title="تسجيل الخروج"
            style={{
              marginLeft: 'auto',
              color: 'var(--text-secondary)',
              padding: 'var(--spacing-xs)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
};
