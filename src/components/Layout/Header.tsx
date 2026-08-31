import React from 'react';
import { Search, Bell, Plus, Menu } from 'lucide-react';
import { Button } from '../UI/Button';
import './Header.css';

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  return (
    <header className="header glass">
      <div className="header-left">
        <button
          type="button"
          className="menu-toggle"
          onClick={onMenuClick}
          aria-label="فتح القائمة"
        >
          <Menu size={22} />
        </button>

        <div className="header-search">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="بحث عن عملاء أو سيارات..."
            className="search-input"
          />
        </div>
      </div>

      <div className="header-actions">
        <button className="notification-btn" aria-label="الإشعارات">
          <Bell size={20} />
          <span className="notification-badge">3</span>
        </button>

        <Button
          variant="primary"
          leftIcon={<Plus size={18} />}
          onClick={() => {
            document.dispatchEvent(new CustomEvent('open-add-client-modal'));
          }}
          className="header-add-btn"
        >
          <span className="btn-text-full">عميل جديد</span>
          <span className="btn-text-short">جديد</span>
        </Button>
      </div>
    </header>
  );
};
