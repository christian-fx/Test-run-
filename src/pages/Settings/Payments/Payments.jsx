import React, { useState, useEffect } from 'react';
import { CreditCard, Landmark, Receipt, History, Shield, Loader2, Save, Eye, EyeOff, ExternalLink } from 'lucide-react';
import { getSettings, updateSettings } from '../../../api/settings';
import { subscribeToOrders } from '../../../api/orders';

// Components
import ConfirmModal from '../../../components/ConfirmModal';

const Payments = () => {
  const [loading, setLoading] = useState(true);
  const [showSecret, setShowSecret] = useState(false);
  const [settings, setSettings] = useState({
    paystack_public_key: '',
    paystack_secret_key: '',
    is_test_mode: true
  });
  const [draftSettings, setDraftSettings] = useState({ ...settings });
  const [transactions, setTransactions] = useState([]);
  
  const [isSaving, setIsSaving] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, type: 'primary', onConfirm: () => {}, title: '', message: '' });

  // --- Initial Fetch ---
  useEffect(() => {
    const fetchSettingsData = async () => {
      try {
        const paymentData = await getSettings('payment_settings');
        setSettings(paymentData);
        setDraftSettings(paymentData);
      } catch (err) {
        console.error("Failed to load payment settings:", err);
      }
    };
    fetchSettingsData();

    // Real-time Orders
    const unsubscribe = subscribeToOrders((orderData) => {
      // Take latest 10 orders as transactions
      const recentTxns = orderData
        .sort((a, b) => new Date(b.order_date) - new Date(a.order_date))
        .slice(0, 10);
      setTransactions(recentTxns);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSaveRequested = () => {
    setModal({
      isOpen: true,
      type: 'primary',
      title: 'Update Payment Configuration?',
      message: 'Are you sure you want to update your Paystack keys? Incorrect keys will disable checkout for your customers.',
      onConfirm: async () => {
        setIsSaving(true);
        try {
          await updateSettings('payment_settings', draftSettings);
          setSettings(draftSettings);
          setModal(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
          console.error("Failed to save payment settings:", error);
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

  return (
    <div className="settings-content">
      {/* Paystack Configuration */}
      <div className="form-card">
        <div className="form-card-header">
           <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-4">
                <div className="icon-badge primary">
                  <CreditCard size={20} />
                </div>
                <div>
                  <div className="form-card-title">Paystack Gateway Configuration</div>
                  <div className="form-card-desc">Configure your Paystack API keys for secure transaction processing.</div>
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
        <div className="form-card-body">
           <div className="grid-2">
              <div className="form-group">
                 <label className="form-label">Paystack Public Key</label>
                 <div className="form-input-wrapper">
                    <input 
                      type="text" 
                      placeholder="pk_test_..."
                      value={draftSettings.paystack_public_key} 
                      onChange={e => setDraftSettings({...draftSettings, paystack_public_key: e.target.value})}
                    />
                 </div>
              </div>
              <div className="form-group">
                 <label className="form-label">Paystack Secret Key</label>
                 <div className="form-input-wrapper relative">
                    <input 
                      type={showSecret ? "text" : "password"} 
                      placeholder="sk_test_..."
                      value={draftSettings.paystack_secret_key} 
                      onChange={e => setDraftSettings({...draftSettings, paystack_secret_key: e.target.value})}
                    />
                    <button 
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted" 
                      onClick={() => setShowSecret(!showSecret)}
                    >
                      {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                 </div>
              </div>
           </div>
           
           <div className="mt-6 p-4 border rounded-lg bg-secondary/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <Shield size={20} className={draftSettings.is_test_mode ? 'text-amber-500' : 'text-success'} />
                 <div>
                    <div className="font-bold text-sm">Mode: {draftSettings.is_test_mode ? 'Test Mode' : 'Live Mode'}</div>
                    <div className="text-xs text-muted">
                       {draftSettings.is_test_mode 
                         ? 'Transactions will be processed using Paystack test environment.' 
                         : 'Live transactions are active. Ensure your Live keys are set above.'}
                    </div>
                 </div>
              </div>
              <button 
                className={`btn btn-sm ${draftSettings.is_test_mode ? 'btn-outline' : 'btn-primary'}`}
                onClick={() => setDraftSettings({...draftSettings, is_test_mode: !draftSettings.is_test_mode})}
              >
                 Switch to {draftSettings.is_test_mode ? 'Live' : 'Test'}
              </button>
           </div>
        </div>
      </div>

      {/* Finance Settings */}
      <div className="form-card">
        <div className="form-card-header">
           <div className="flex items-center gap-3">
              <div className="icon-badge primary">
                 <Landmark size={20} />
              </div>
              <div className="form-card-title">Payout & Settlement Settings</div>
           </div>
        </div>
        <div className="form-card-body">
           <div className="grid-2 opacity-50 pointer-events-none">
              <div className="form-group">
                 <label className="form-label">Default Settlement Account</label>
                 <div className="form-input static">Managed via Paystack Dashboard</div>
              </div>
              <div className="form-group">
                 <label className="form-label">Payout Schedule</label>
                 <div className="form-input static">T+1 Automated Settlements</div>
              </div>
           </div>
        </div>
      </div>

      {/* Transaction Records */}
      <div className="form-card">
        <div className="form-card-header">
           <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                 <div className="icon-badge primary">
                    <Receipt size={20} />
                 </div>
                 <div className="form-card-title">Recent Transactions</div>
              </div>
              <button className="btn btn-subtle flex items-center gap-2">
                 <History size={16} /> View History
              </button>
           </div>
        </div>
        <div className="form-card-body" style={{ padding: 0 }}>
           <table className="table-w full-width">
              <thead>
                 <tr>
                    <th style={{ paddingLeft: '24px' }}>Date</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th style={{ textAlign: 'right', paddingRight: '24px' }}>Status</th>
                 </tr>
              </thead>
              <tbody>
                 {transactions.length === 0 ? (
                    <tr>
                       <td colSpan="4" className="text-center py-12 text-muted text-sm">No transactions found.</td>
                    </tr>
                 ) : (
                    transactions.map((txn) => (
                      <tr key={txn.id}>
                         <td style={{ paddingLeft: '24px' }} className="text-sm">
                            {new Date(txn.order_date).toLocaleDateString()}
                         </td>
                         <td>
                            <div className="text-sm font-medium">{txn.customer_name}</div>
                            <div className="text-[10px] text-muted uppercase tracking-wider">{txn.id.slice(0,8)}</div>
                         </td>
                         <td className="font-bold">₦{Number(txn.total_amount).toLocaleString()}</td>
                         <td style={{ textAlign: 'right', paddingRight: '24px' }}>
                            <span className={`badge badge-${txn.payment_status === 'Paid' ? 'success' : 'destructive'}`}>
                               {txn.payment_status}
                            </span>
                         </td>
                      </tr>
                    ))
                 )}
              </tbody>
           </table>
        </div>
      </div>

      <ConfirmModal 
        isOpen={modal.isOpen}
        onClose={() => setModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={modal.onConfirm}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        isLoading={isSaving}
      />
    </div>
  );
};

export default Payments;
