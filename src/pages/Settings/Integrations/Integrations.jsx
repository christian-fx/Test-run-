import React, { useState, useEffect } from 'react';
import { Loader2, Save, Cloud, Eye, EyeOff } from 'lucide-react';
import { getSettings, updateSettings } from '../../../api/settings';

// Components
import ConfirmModal from '../../../components/ConfirmModal';

const Integrations = () => {
  const [loading, setLoading] = useState(true);
  const [showCloudinaryKey, setShowCloudinaryKey] = useState(false);
  const [settings, setSettings] = useState({
    cloudinary_cloud_name: '',
    cloudinary_api_key: '',
    cloudinary_upload_preset: ''
  });
  const [draftSettings, setDraftSettings] = useState({ ...settings });
  
  const [isSaving, setIsSaving] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, onConfirm: () => {}, title: '', message: '' });

  // --- Initial Fetch ---
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await getSettings('integrations_settings');
        setSettings(data);
        setDraftSettings(data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to load integrations:", error);
      }
    };
    fetchSettings();
  }, []);

  const handleSaveRequested = () => {
    setModal({
      isOpen: true,
      title: 'Update Integrations?',
      message: 'These third-party service settings will be applied immediately. Ensure your keys are correct to avoid service disruption.',
      onConfirm: async () => {
        setIsSaving(true);
        try {
          await updateSettings('integrations_settings', draftSettings);
          setSettings(draftSettings);
          setModal(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
          console.error("Failed to save integrations:", error);
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
      {/* Cloudinary Integration */}
      <div className="form-card">
        <div className="form-card-header">
           <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-4">
                <div className="icon-badge primary">
                  <Cloud size={20} />
                </div>
                <div>
                  <div className="form-card-title">Cloudinary Media Storage</div>
                  <div className="form-card-desc">Configure your cloud media settings for product image uploads.</div>
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
                 <label className="form-label">Cloud Name</label>
                 <div className="form-input-wrapper">
                    <input 
                      type="text" 
                      value={draftSettings.cloudinary_cloud_name} 
                      onChange={e => setDraftSettings({...draftSettings, cloudinary_cloud_name: e.target.value})}
                    />
                 </div>
              </div>
              <div className="form-group">
                 <label className="form-label">Upload Preset</label>
                 <div className="form-input-wrapper">
                    <input 
                      type="text" 
                      value={draftSettings.cloudinary_upload_preset} 
                      onChange={e => setDraftSettings({...draftSettings, cloudinary_upload_preset: e.target.value})}
                    />
                 </div>
              </div>
           </div>
           <div className="form-group mt-4">
              <label className="form-label">API Key</label>
              <div className="form-input-wrapper relative">
                 <input 
                   type={showCloudinaryKey ? "text" : "password"} 
                   value={draftSettings.cloudinary_api_key} 
                   onChange={e => setDraftSettings({...draftSettings, cloudinary_api_key: e.target.value})}
                 />
                 <button 
                   className="absolute right-3 top-1/2 -translate-y-1/2 text-muted" 
                   onClick={() => setShowCloudinaryKey(!showCloudinaryKey)}
                 >
                   {showCloudinaryKey ? <EyeOff size={16} /> : <Eye size={16} />}
                 </button>
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
        isLoading={isSaving}
      />
    </div>
  );
};

export default Integrations;
