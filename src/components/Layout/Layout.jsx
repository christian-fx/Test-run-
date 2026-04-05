import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  Zap,
  LayoutDashboard,
  ShoppingCart,
  Smartphone,
  FolderTree,
  Users,
  Settings,
  Search,
  LogOut,
  Loader2,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  Home,
  User,
  Bell,
  CreditCard,
  Link as LinkIcon,
  Sun,
  Moon,
  Package,
  Star,
  Banknote,
  Ticket,
  Image as ImageIcon,
  Truck
} from 'lucide-react';
import './Layout.css';
import { useTheme } from '../../hooks/useTheme';

// API
import { logout } from '../../api/auth';
import { useAuth } from '../../context/useAuth';
import NotificationBell from '../NotificationBell';
import GlobalSearch from '../GlobalSearch';
import { subscribeToSettings } from '../../api/settings';

const Sidebar = ({ isOpen, onClose }) => {
  const [storeName, setStoreName] = useState('Go Gadget');
  const [settingsExpanded, setSettingsExpanded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = subscribeToSettings('store_settings', (data) => {
      if (data?.store_name) setStoreName(data.store_name);
    });
    return () => unsubscribe();
  }, []);

  const navGroups = [
    {
      title: 'Navigation',
      items: [
        { label: 'Dashboard', path: '/', icon: LayoutDashboard },
      ]
    },
    {
      title: 'Management',
      items: [
        { label: 'Orders', path: '/orders', icon: ShoppingCart },
        { label: 'Products', path: '/products', icon: Smartphone },
        { label: 'Categories', path: '/categories', icon: FolderTree },
        { label: 'Inventory', path: '/inventory', icon: Package },
      ]
    },
    {
      title: 'Customers',
      items: [
        { label: 'Customers', path: '/customers', icon: Users },
        { label: 'Reviews', path: '/customers/reviews', icon: Star },
      ]
    },
    {
      title: 'Finance',
      items: [
        { label: 'Transactions', path: '/finance/transactions', icon: Banknote },
      ]
    },
    {
      title: 'Marketing',
      items: [
        { label: 'Discounts', path: '/marketing/discounts', icon: Ticket },
        { label: 'Promotions', path: '/marketing/promotions', icon: ImageIcon },
      ]
    },
    {
      title: 'Logistics',
      items: [
        { label: 'Shipping', path: '/logistics/shipping', icon: Truck },
      ]
    },
    {
      title: 'System',
      items: [
        {
          label: 'Settings',
          path: '/settings',
          icon: Settings,
          hasChildren: true,
          isExpanded: settingsExpanded,
          onToggle: () => setSettingsExpanded(!settingsExpanded),
          children: [
            { label: 'General', path: '/settings/general', icon: Home },
            { label: 'Account', path: '/settings/account', icon: User },
            { label: 'Notifications', path: '/settings/notifications', icon: Bell },
            { label: 'Team', path: '/settings/team', icon: Users },
            { label: 'Payments', path: '/settings/payments', icon: CreditCard },
            { label: 'Integrations', path: '/settings/integrations', icon: LinkIcon }
          ]
        },
      ]
    }
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}

      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-top">
          <Link to="/" className="sidebar-logo" onClick={onClose}>
            <div className="logo-icon">
              <Zap size={20} />
            </div>
            {storeName}
          </Link>
          <button className="sidebar-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navGroups.map((group, idx) => (
            <div key={idx} className="nav-section">
              <div className="nav-section-title">{group.title}</div>
              <div className="nav-list">
                {group.items.map((item) => {
                  const isSettings = item.label === 'Settings';
                  return (
                    <div key={item.path} className={`nav-item-container ${item.isExpanded ? 'is-expanded' : ''}`}>
                      <NavLink
                        to={item.path}
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        onClick={(e) => {
                          const isMobile = window.innerWidth <= 1024;
                          if (isSettings && isMobile) {
                            e.preventDefault();
                            item.onToggle();
                            if (!settingsExpanded) {
                              navigate('/settings/general');
                            }
                          } else {
                            onClose();
                          }
                        }}
                      >
                        <div className="icon-wrapper">
                          <item.icon size={20} />
                        </div>
                        <span style={{ flex: 1 }}>{item.label}</span>
                        {item.hasChildren && (
                          <div className="chevron-wrapper">
                            {item.isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          </div>
                        )}
                      </NavLink>

                      {item.hasChildren && item.isExpanded && (
                        <div className="nav-sub-list">
                          {item.children.map(child => (
                            <NavLink
                              key={child.path}
                              to={child.path}
                              className={({ isActive }) => `nav-sub-item ${isActive ? 'active' : ''}`}
                              onClick={onClose}
                            >
                              <div className="icon-wrapper">
                                <child.icon size={16} />
                              </div>
                              {child.label}
                            </NavLink>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item logout-btn" onClick={logout}>
            <div className="icon-wrapper">
              <LogOut size={20} />
            </div>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

const Header = ({ onMenuToggle }) => {
  const { user, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const profileImg = user?.profile?.avatar || (user?.email ? `https://ui-avatars.com/api/?name=${user.email}&background=random` : null);

  if (loading) {
    return (
      <header className="header">
        <div className="flex items-center justify-center w-full">
          <Loader2 size={16} className="animate-spin text-muted" />
        </div>
      </header>
    );
  }

  return (
    <header className="header">
      <button className="mobile-menu-btn" onClick={onMenuToggle}>
        <Menu size={22} />
      </button>
      <GlobalSearch />
      <div className="header-actions">
        <div className="system-actions">
          <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <NotificationBell />
          <img src={profileImg || null} alt="User Avatar" className="avatar" />
        </div>
      </div>
    </header>
  );
};

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-container">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="main-content">
        <Header onMenuToggle={() => setSidebarOpen(prev => !prev)} />
        <div className="page-content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
