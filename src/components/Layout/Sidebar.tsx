import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, Filter, Settings, Car, LogOut,
  Package, BarChart3, Wrench, CalendarClock, Calendar, Wallet, MessageCircle, Store, Droplets,
  ShoppingCart,
} from 'lucide-react';
import { useAuth } from '../../auth/useAuth';
import './Sidebar.css';

interface SidebarProps {
  onNavigate?: () => void;
  mobileOpen?: boolean;
}

type NavItem = { path: string; label: string; icon: React.ReactNode; external?: boolean };

const groups: { title: string; items: NavItem[] }[] = [
  {
    title: 'اليوم',
    items: [
      { path: '/', label: 'لوحة التحكم', icon: <LayoutDashboard size={18} /> },
      { path: '/bookings', label: 'الحجوزات', icon: <Calendar size={18} /> },
      { path: '/messages', label: 'واتساب', icon: <MessageCircle size={18} /> },
    ],
  },
  {
    title: 'المبيعات',
    items: [
      { path: '/clients', label: 'العملاء', icon: <Users size={18} /> },
      { path: '/pipeline', label: 'مراحل المبيعات', icon: <Filter size={18} /> },
      { path: '/inventory', label: 'المخزون', icon: <Package size={18} /> },
      { path: '/payments', label: 'الدفعات', icon: <Wallet size={18} /> },
    ],
  },
  {
    title: 'التوريد والخدمة',
    items: [
      { path: '/purchases', label: 'المشتريات', icon: <ShoppingCart size={18} /> },
      { path: '/spare-parts', label: 'قطع الغيار', icon: <Wrench size={18} /> },
      { path: '/oil-filters', label: 'الزيت والفلاتر', icon: <Droplets size={18} /> },
      { path: '/maintenance', label: 'الصيانة', icon: <CalendarClock size={18} /> },
    ],
  },
  {
    title: 'إدارة',
    items: [
      { path: '/reports', label: 'تقارير الأرباح', icon: <BarChart3 size={18} /> },
      { path: '/settings', label: 'الإعدادات', icon: <Settings size={18} /> },
    ],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ onNavigate }) => {
  const { user, signOut } = useAuth();
  const storeUrl = `${window.location.pathname}#/store`;

  return (
    <aside className="sidebar glass">
      <div className="sidebar-header">
        <div className="logo-container">
          <div className="logo-badge">
            <Car size={22} />
          </div>
          <div className="logo-text-wrap">
            <h1 className="logo-text">مكتب السيارات</h1>
            <p className="logo-sub">استيراد · بيع · صيانة</p>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {groups.map((group) => (
          <div key={group.title} className="nav-group">
            <div className="nav-group-label">{group.title}</div>
            <ul className="nav-list">
              {group.items.map((item) => (
                <li key={item.path} className="nav-item">
                  <NavLink
                    to={item.path}
                    end={item.path === '/'}
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    onClick={() => onNavigate?.()}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-label">{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="nav-group">
          <div className="nav-group-label">واجهة الزبائن</div>
          <ul className="nav-list">
            <li className="nav-item">
              <a
                href={storeUrl}
                target="_blank"
                rel="noreferrer"
                className="nav-link"
                onClick={() => onNavigate?.()}
              >
                <span className="nav-icon"><Store size={18} /></span>
                <span className="nav-label">المتجر العام</span>
              </a>
            </li>
          </ul>
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar">{user?.email?.[0]?.toUpperCase() || 'م'}</div>
          <div className="user-info">
            <p className="user-name">{user?.email?.split('@')[0] || 'المكتب'}</p>
            <p className="user-role">تندوف · سيارات صينية</p>
          </div>
          <button
            className="logout-btn"
            onClick={() => signOut()}
            title="تسجيل الخروج"
            type="button"
          >
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </aside>
  );
};
