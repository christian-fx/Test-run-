import React, { useState } from 'react';
import { Key, Plus, Trash2, RefreshCw, ShieldAlert, History, Copy, AlertTriangle } from 'lucide-react';

// Components
import ConfirmModal from '../../../components/ConfirmModal';

const API = () => {
  const [modal, setModal] = useState({ isOpen: false, type: 'primary', onConfirm: () => {}, title: '', message: '' });

  const apiKeys = [
    { id: 1, name: 'Production Storefront', key: 'ck_live_9012...8902', status: 'Active', lastUsed: '2 mins ago', permissions: 'Read-only' },
    { id: 2, name: 'Mobile App Integration', key: 'ck_live_5634...1245', status: 'Active', lastUsed: '3 hours ago', permissions: 'Full access' },
    { id: 3, name: 'Testing Key', key: 'ck_test_1122...3344', status: 'Revoked', lastUsed: 'Never', permissions: 'Read/Write' }
  ];

  const handleRevokeRequested = (key) => {
    setModal({
      isOpen: true,
      type: 'destructive',
      title: 'Revoke API Key?',
      message: `Are you sure you want to revoke the "${key.name}" API key? Any applications or services currently using this key will lose access immediately.`,
      onConfirm: () => {
        setModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleCreateKey = () => {
     // Local logic for key creation
  };

  return (
    <div className="settings-content">
      {/* Security Warning Banner */}
      <div className="form-card" style={{ borderColor: 'var(--amber-500)', background: 'color-mix(in srgb, var(--amber-500) 5%, transparent)' }}>
         <div className="form-card-body" style={{ padding: '16px 24px' }}>
            <div className="flex items-center gap-3">
               <div style={{ color: 'var(--amber-600)' }}>
                  <AlertTriangle size={24} />
               </div>
               <div>
                  <div className="font-bold text-sm" style={{ color: 'var(--amber-700)' }}>Developer Security Notice</div>
                  <div className="text-xs" style={{ color: 'var(--amber-600)', opacity: 0.9 }}>
                     API keys grant full administrative access to your store's private data. Never share them or commit them to source control.
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* API Key Management */}
      <div className="form-card">
        <div className="form-card-header">
           <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-4">
                <div className="icon-badge primary">
                  <Key size={20} />
                </div>
                <div>
                  <div className="form-card-title">Manage API Keys</div>
                  <div className="form-card-desc">Access keys for your custom storefronts and backend integrations.</div>
                </div>
              </div>
              <button className="btn btn-primary flex items-center gap-2" onClick={handleCreateKey}>
                <Plus size={16} /> Create New Key
              </button>
           </div>
        </div>
        <div className="form-card-body" style={{ padding: 0 }}>
           <table className="table-w full-width">
              <thead>
                 <tr>
                    <th style={{ paddingLeft: '24px' }}>Key Name</th>
                    <th>Permissions</th>
                    <th>Last Used</th>
                    <th style={{ textAlign: 'center' }}>Key Status</th>
                    <th style={{ textAlign: 'right', paddingRight: '24px' }}>Actions</th>
                 </tr>
              </thead>
              <tbody>
                 {apiKeys.map((key) => (
                    <tr key={key.id}>
                       <td style={{ paddingLeft: '24px' }}>
                          <div className="font-bold text-sm">{key.name}</div>
                          <div className="font-mono text-[10px] text-muted flex items-center gap-1.5 mt-0.5">
                             {key.key} <button className="cursor-pointer hover:text-primary"><Copy size={10} /></button>
                          </div>
                       </td>
                       <td className="text-xs font-medium">{key.permissions}</td>
                       <td className="text-xs text-muted"><div className="flex items-center gap-1.5"><History size={12} /> {key.lastUsed}</div></td>
                       <td style={{ textAlign: 'center' }}>
                          <span className={`badge badge-${key.status === 'Active' ? 'success' : 'destructive'}`}>
                             {key.status}
                          </span>
                       </td>
                       <td style={{ textAlign: 'right', paddingRight: '24px' }}>
                          <div className="flex items-center justify-end gap-2">
                             <button className="icon-btn sm hover:text-primary" title="Regenerate"><RefreshCw size={14} /></button>
                             <button className="icon-btn sm hover:text-destructive" onClick={() => handleRevokeRequested(key)} title="Revoke"><Trash2 size={14} /></button>
                          </div>
                       </td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
      </div>

      {/* Integration Logs / Troubleshooting */}
      <div className="form-card">
         <div className="form-card-header">
            <div className="flex items-center gap-3">
               <div className="icon-badge primary">
                  <ShieldAlert size={18} />
               </div>
               <div>
                  <div className="form-card-title">Access & Error Logs</div>
                  <div className="form-card-desc">Review recent API calls and webhook failures.</div>
               </div>
            </div>
         </div>
         <div className="form-card-body">
            <div className="flex items-center justify-center p-12 border-2 border-dashed rounded-xl border-secondary/30">
               <div className="text-center">
                  <div className="text-muted mb-2">No critical API errors in the last 24 hours.</div>
                  <button className="text-sm text-primary underline">Download full access logs (.csv)</button>
               </div>
            </div>
         </div>
      </div>

      <ConfirmModal 
        isOpen={modal.isOpen}
        onClose={() => setModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={modal.onConfirm}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />
    </div>
  );
};

export default API;
