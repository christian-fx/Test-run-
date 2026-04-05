import React, { useState, useEffect } from 'react';
import { 
  X, 
  Settings, 
  Lock, 
  ShieldCheck, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';
import './AddShippingZoneModal.css'; // Reusing established modal layout
import { updatePartnerConfig } from '../api/shipping';

const ConfigurePartnerModal = ({ isOpen, onClose, partner = null }) => {
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    apiKey: '',
    secretKey: '',
    webhookUrl: '',
    testMode: true
  });

  useEffect(() => {
    if (!isOpen || !partner) return;

    if (partner.config) {
      setConfig({
        apiKey: partner.config.apiKey || '',
        secretKey: partner.config.secretKey || '',
        webhookUrl: partner.config.webhookUrl || '',
        testMode: partner.config.testMode !== undefined ? partner.config.testMode : true
      });
    }
  }, [isOpen, partner]);

  const handleSave = async () => {
    if (!config.apiKey) {
      alert("At least an API Key is required for configuration.");
      return;
    }

    setSaving(true);
    try {
      await updatePartnerConfig(partner.id, config);
      onClose();
    } catch (error) {
      console.error("Save failed:", error);
      alert("Failed to save carrier configuration.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !partner) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title font-bold flex items-center gap-2">
             <Settings size={20} className="text-primary" />
             Configure {partner.name}
          </div>
          <div className="modal-close" onClick={onClose}><X size={20} /></div>
        </div>

        <div className="modal-body">
           <div className="bg-secondary/5 border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center gap-4 text-center mb-4">
              <ShieldCheck size={32} className="text-primary" />
              <div>
                 <h3 className="font-bold">Integration Credentials</h3>
                 <p className="text-sm text-muted">Enter your {partner.name} API credentials below to enable live fulfillment.</p>
              </div>
           </div>

           <div className="section">
              <div className="section-panel flex flex-col gap-4">
                 <div className="form-group">
                    <div className="form-label flex items-center gap-2"><Lock size={12} /> Public API Key</div>
                    <div className="form-input">
                       <input 
                          type="password" 
                          placeholder="e.g. pk_live_..." 
                          value={config.apiKey}
                          onChange={e => setConfig({...config, apiKey: e.target.value})}
                       />
                    </div>
                 </div>
                 <div className="form-group">
                    <div className="form-label flex items-center gap-2"><Lock size={12} /> Secret API Key</div>
                    <div className="form-input">
                       <input 
                          type="password" 
                          placeholder="e.g. sk_live_..." 
                          value={config.secretKey}
                          onChange={e => setConfig({...config, secretKey: e.target.value})}
                       />
                    </div>
                 </div>
                 <div className="form-group">
                    <div className="form-label">Webhook Endpoint</div>
                    <div className="form-input">
                       <input 
                          type="text" 
                          placeholder="https://yourstore.com/api/webhooks/shipping" 
                          value={config.webhookUrl}
                          onChange={e => setConfig({...config, webhookUrl: e.target.value})}
                       />
                    </div>
                 </div>
                 
                 <div className="flex items-center justify-between p-4 bg-background border border-border rounded-md mt-2">
                    <div className="flex items-center gap-2">
                       <AlertCircle size={16} className={config.testMode ? "text-amber-500" : "text-success"} />
                       <span className="text-sm font-semibold">{config.testMode ? "Sandbox/Test Mode" : "Production (Live) Mode"}</span>
                    </div>
                    <button 
                       className={`w-12 h-6 rounded-full relative transition-colors ${config.testMode ? "bg-amber-500" : "bg-success"}`}
                       onClick={() => setConfig({...config, testMode: !config.testMode})}
                    >
                       <div className={`absolute top-1 bg-white w-4 h-4 rounded-full transition-all ${config.testMode ? "left-1" : "left-7"}`} />
                    </button>
                 </div>
              </div>
           </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? <><Loader2 className="animate-spin" size={16} /> Verifying...</> : "Save Integration"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfigurePartnerModal;
