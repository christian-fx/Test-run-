import { Routes, Route, NavLink } from 'react-router-dom';
import './Settings.css';

// Sub-pages
import General from './General/General';
import Account from './Account/Account';
import Notifications from './Notifications/Notifications';
import Team from './Team/Team';
import Payments from './Payments/Payments';
import Integrations from './Integrations/Integrations';
import API from './API/API';

const Settings = () => {

  const navItems = [
    { label: 'General', id: 'General' },
    { label: 'Account', id: 'Account' },
    { label: 'Notifications', id: 'Notifications' },
    { label: 'Team & Permissions', id: 'Team' },
    { label: 'Payments', id: 'Payments' },
    { label: 'Integrations', id: 'Integrations' },
  ];


  return (
    <div className="settings-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold flex items-center gap-3" style={{ fontSize: '24px' }}>
            Settings
          </h1>
          <p className="text-muted">Manage your store preferences and administrative settings.</p>
        </div>
      </div>

      <div className="settings-layout">
        <div className="settings-nav">
          {navItems.map((item) => (
            <NavLink 
              key={item.id} 
              to={`/settings/${item.id.toLowerCase() === 'team' ? 'team' : item.id.toLowerCase()}`}
              className={({ isActive }) => `settings-nav-item ${isActive ? 'active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
        
        <div className="settings-content-wrapper">
          <Routes>
            <Route path="general" element={<General />} />
            <Route path="account" element={<Account />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="team" element={<Team />} />
            <Route path="payments" element={<Payments />} />
            <Route path="integrations" element={<Integrations />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default Settings;
