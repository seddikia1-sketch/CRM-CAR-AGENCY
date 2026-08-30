import React from 'react';
import { Search, Bell, Plus } from 'lucide-react';
import { Button } from '../UI/Button';
import './Header.css';

export const Header: React.FC = () => {
  return (
    <header className="header glass">
      <div className="header-search">
        <Search className="search-icon" size={18} />
        <input 
          type="text" 
          placeholder="بحث عن عملاء أو سيارات أو هاتف..." 
          className="search-input"
        />
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
        >
          عميل جديد
        </Button>
      </div>
    </header>
  );
};
