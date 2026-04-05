import React, { useState, useEffect } from 'react';
import { Bell, ShoppingCart, Package, Users, Mail, Monitor, Loader2, Save, CreditCard } from 'lucide-react';
import { getSettings, updateSettings } from '../../../api/settings';

// Components
import ConfirmModal from '../../../components/ConfirmModal';

const Notifications = () => {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    email_order_alerts: true,
    email_low_stock: true,
    email_customer_signup: true,
    email_billing_updates: true,
    in_app_order_alerts: true,
    in_app_low_stock: true,
    in_app_customer_signup: true,
    push_browser_alerts: true
  });
  const [draftSettings, setDraftSettings] = useState({ ...settings });
  const [modal, setModal] = useState({ isOpen: false, onConfirm: () => {}, title: '', message: '' });
  const [isSaving, setIsSaving] = useState(false);

  // --- Initial Fetch ---
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await getSettings('notification_settings');
        setSettings(data);
        setDraftSettings(data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to load notification settings:", error);
      }
    };
    fetchSettings();
  }, []);

  const handleToggle = (key) => {
    setDraftSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveRequested = () => {
    setModal({
      isOpen: true,
      title: 'Update Notification Preferences?',
      message: 'These settings will apply instantly and affect how you receive all business-critical dashboard alerts.',
      onConfirm: async () => {
        setIsSaving(true);
        try {
          await updateSettings('notification_settings', draftSettings);
          setSettings(draftSettings);
          setModal(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
          console.error("Failed to save notifications:", error);
        } finally {
          setIsSaving(false);
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="settings-content flex items-center justify-center" style={{ minHeight: '400px' }}>
         <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  const preferenceMatrix = [
    { 
      title: 'Order Tracking', 
      desc: 'New orders and status updates.', 
      icon: ShoppingCart,
      channels: [
        { key: 'in_app_order_alerts', label: 'In-App' },
        { key: 'email_order_alerts', label: 'Email' }
      ]
    },
    { 
      title: 'Inventory Health', 
      desc: 'Low stock and availability alerts.', 
      icon: Package,
      channels: [
        { key: 'in_app_low_stock', label: 'In-App' },
        { key: 'email_low_stock', label: 'Email' }
      ]
    },
    { 
      title: 'Customer Growth', 
      desc: 'New registrations and signups.', 
      icon: Users,
      channels: [
        { key: 'in_app_customer_signup', label: 'In-App' },
        { key: 'email_customer_signup', label: 'Email' }
      ]
    },
    { 
      title: 'Billing & Payments', 
      desc: 'Monthly reports and invoices.', 
      icon: CreditCard,
      channels: [
        { key: 'email_billing_updates', label: 'Email Only' }
      ]
    }
  ];

  return (
    <div className="settings-content">
      <div className="form-card">
        <div className="form-card-header">
           <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-4">
                <div className="icon-badge primary">
                  <Bell size={20} />
                </div>
                <div>
                  <div className="form-card-title">System Alert Preferences</div>
                  <div className="form-card-desc">Control how and when you receive business-critical updates.</div>
                </div>
              </div>
              <button 
                className="btn btn-primary flex items-center gap-2" 
                onClick={handleSaveRequested}
                disabled={JSON.stringify(settings) === JSON.stringify(draftSettings)}
              >
                <Save size={16} /> Save Changes
              </button>
           </div>
        </div>
        <div className="form-card-body" style={{ padding: 0 }}>
           <div className="table-responsive-container">
              <table className="table-w full-width">
                 <thead>
                    <tr>
                       <th style={{ paddingLeft: '24px' }}>Notification Category</th>
                       <th style={{ textAlign: 'center' }}>In-App Alert</th>
                       <th style={{ textAlign: 'center' }}>Email Notification</th>
                    </tr>
                 </thead>
                 <tbody>
                    {preferenceMatrix.map((item, idx) => (
                       <tr key={idx}>
                          <td style={{ paddingLeft: '24px' }}>
                             <div className="flex items-center gap-3">
                                <div className="text-primary"><item.icon size={18} /></div>
                                <div>
                                   <div className="font-medium text-sm">{item.title}</div>
                                   <div className="text-xs text-muted">{item.desc}</div>
                                </div>
                             </div>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                             {item.channels.some(c => c.key.includes('in_app')) ? (
                                <div className="flex items-center justify-center">
                                   <input 
                                     type="checkbox" 
                                     className="checkbox"
                                     checked={draftSettings[item.channels.find(c => c.key.includes('in_app')).key]}
                                     onChange={() => handleToggle(item.channels.find(c => c.key.includes('in_app')).key)}
                                   />
                                </div>
                             ) : <span className="text-[10px] text-muted">N/A</span>}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                             {item.channels.some(c => c.key.includes('email')) ? (
                                <div className="flex items-center justify-center">
                                   <input 
                                     type="checkbox" 
                                     className="checkbox"
                                     checked={draftSettings[item.channels.find(c => c.key.includes('email')).key]}
                                     onChange={() => handleToggle(item.channels.find(c => c.key.includes('email')).key)}
                                   />
                                </div>
                             ) : <span className="text-[10px] text-muted">N/A</span>}
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>

            <div className="p-6 bg-secondary/10 border-t items-center flex justify-between w-full">
               <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-background rounded-xl border">
                    <Monitor size={20} className="text-primary" />
                  </div>
                  <div>
                    <div className="font-bold text-sm">Browser Push Notifications</div>
                    <div className="text-xs text-muted">Receive desktop alerts even when the dashboard is closed.</div>
                  </div>
               </div>
               <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={draftSettings.push_browser_alerts}
                    onChange={() => handleToggle('push_browser_alerts')}
                  />
                  <span className="slider"></span>
               </label>
            </div>
        </div>
      </div>

      <ConfirmModal 
        isOpen={modal.isOpen}
        onClose={() => setModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={modal.onConfirm}
        title={modal.title}
        message={modal.message}
        isLoading={isSaving}
      />
    </div>
  );
};

export default Notifications;
