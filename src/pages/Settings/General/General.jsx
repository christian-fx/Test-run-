import React, { useState, useEffect } from 'react';
import { ChevronDown, Save, Edit2, Globe, Store, Loader2 } from 'lucide-react';

// API
import { getSettings, updateSettings } from '../../../api/settings';

// Components
import ConfirmModal from '../../../components/ConfirmModal';

const General = () => {
  // --- States ---
  const [loading, setLoading] = useState(true);
  
  // Store Details State
  const [storeData, setStoreData] = useState({
    name: '',
    email: '',
    phone: '',
    description: ''
  });
  const [isEditingStore, setIsEditingStore] = useState(false);
  const [draftStore, setDraftStore] = useState({ ...storeData });

  // Regional Settings State
  const [regionalData, setRegionalData] = useState({
    currency: '',
    timezone: '',
    unitSystem: '',
    language: ''
  });
  const [isEditingRegional, setIsEditingRegional] = useState(false);
  const [draftRegional, setDraftRegional] = useState({ ...regionalData });

  // Modal State
  const [isSaving, setIsSaving] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, type: 'primary', onConfirm: () => {}, title: '', message: '' });

  // --- Initial Fetch ---
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await getSettings('store_settings');
        setStoreData({
          name: data.store_name,
          email: data.support_email,
          phone: data.support_phone,
          description: data.store_description
        });
        setRegionalData({
          currency: data.currency,
          timezone: data.timezone,
          unitSystem: data.unit_system,
          language: data.default_language
        });
        setLoading(false);
      } catch (error) {
        console.error("Failed to load settings:", error);
      }
    };
    fetchSettings();
  }, []);

  // --- Handlers ---
  
  const handleEditStore = () => {
    setDraftStore({ ...storeData });
    setIsEditingStore(true);
  };

  const handleCancelStore = () => {
    setDraftStore({ ...storeData });
    setIsEditingStore(false);
  };

  const handleSaveStoreRequested = () => {
    setModal({
      isOpen: true,
      type: 'primary',
      title: 'Save Store Changes?',
      message: 'Are you sure you want to update your store details? These changes will be visible to your customers immediately.',
      onConfirm: async () => {
        setIsSaving(true);
        try {
          await updateSettings('store_settings', {
            store_name: draftStore.name,
            support_email: draftStore.email,
            support_phone: draftStore.phone,
            store_description: draftStore.description
          });
          setStoreData({ ...draftStore });
          setIsEditingStore(false);
          setModal(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
          console.error("Failed to save store settings:", error);
        } finally {
          setIsSaving(false);
        }
      }
    });
  };

  const handleEditRegional = () => {
    setDraftRegional({ ...regionalData });
    setIsEditingRegional(true);
  };

  const handleCancelRegional = () => {
    setDraftRegional({ ...regionalData });
    setIsEditingRegional(false);
  };

  const handleSaveRegionalRequested = () => {
    setModal({
      isOpen: true,
      type: 'primary',
      title: 'Update Regional Settings?',
      message: 'Currency and unit changes may affect how your products and prices are displayed on the storefront.',
      onConfirm: async () => {
        setIsSaving(true);
        try {
          await updateSettings('store_settings', {
            currency: draftRegional.currency,
            timezone: draftRegional.timezone,
            unit_system: draftRegional.unitSystem,
            default_language: draftRegional.language
          });
          setRegionalData({ ...draftRegional });
          setIsEditingRegional(false);
          setModal(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
          console.error("Failed to save regional settings:", error);
        } finally {
          setIsSaving(false);
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="settings-content flex items-center justify-center" style={{ minHeight: '400px' }}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-primary" size={40} />
          <p className="text-muted text-sm font-medium">Fetching store configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-content">
      {/* --- Store Details Section --- */}
      <div className="form-card">
        <div className="form-card-header">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="icon-badge primary">
                <Store size={18} />
              </div>
              <div>
                <div className="form-card-title">Store Details</div>
                <div className="form-card-desc">Update your store's basic information and contact details.</div>
              </div>
            </div>
            {!isEditingStore ? (
              <button className="btn btn-subtle" onClick={handleEditStore}>
                <Edit2 size={14} /> Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button className="btn btn-outline" onClick={handleCancelStore}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSaveStoreRequested}>
                  <Save size={14} /> Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="form-card-body">
          <div className="form-group">
            <label className="form-label">Store Name</label>
            {isEditingStore ? (
              <div className="form-input-wrapper">
                <input 
                  type="text" 
                  value={draftStore.name} 
                  onChange={e => setDraftStore({...draftStore, name: e.target.value})}
                  autoFocus
                />
              </div>
            ) : (
              <div className="form-input static">{storeData.name}</div>
            )}
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Support Email</label>
              {isEditingStore ? (
                <div className="form-input-wrapper">
                  <input 
                    type="email" 
                    value={draftStore.email} 
                    onChange={e => setDraftStore({...draftStore, email: e.target.value})}
                  />
                </div>
              ) : (
                <div className="form-input static">{storeData.email}</div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Support Phone</label>
              {isEditingStore ? (
                <div className="form-input-wrapper">
                  <input 
                    type="text" 
                    value={draftStore.phone} 
                    onChange={e => setDraftStore({...draftStore, phone: e.target.value})}
                  />
                </div>
              ) : (
                <div className="form-input static">{storeData.phone}</div>
              )}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Store Description</label>
            {isEditingStore ? (
              <div className="form-input-wrapper textarea">
                <textarea 
                  value={draftStore.description} 
                  onChange={e => setDraftStore({...draftStore, description: e.target.value})}
                />
              </div>
            ) : (
              <div className="form-input static textarea">{storeData.description}</div>
            )}
            <div className="form-hint">Brief description for your store. This appears in search engine results.</div>
          </div>
        </div>
      </div>

      {/* --- Regional Settings Section --- */}
      <div className="form-card">
        <div className="form-card-header">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="icon-badge primary">
                <Globe size={18} />
              </div>
              <div>
                <div className="form-card-title">Regional Settings</div>
                <div className="form-card-desc">Set your default currency, timezone, and preferred metric systems.</div>
              </div>
            </div>
            {!isEditingRegional ? (
              <button className="btn btn-subtle" onClick={handleEditRegional}>
                <Edit2 size={14} /> Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button className="btn btn-outline" onClick={handleCancelRegional}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSaveRegionalRequested}>
                  <Save size={14} /> Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="form-card-body">
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Store Currency</label>
              {isEditingRegional ? (
                <div className="select-wrapper">
                  <select 
                    value={draftRegional.currency} 
                    onChange={e => setDraftRegional({...draftRegional, currency: e.target.value})}
                  >
                    <option>United States Dollar (USD)</option>
                    <option>Euro (EUR)</option>
                    <option>British Pound (GBP)</option>
                    <option>Japanese Yen (JPY)</option>
                    <option>Nigerian Naira (NGN)</option>
                  </select>
                  <ChevronDown className="chevron-icon" size={16} />
                </div>
              ) : (
                <div className="form-input static select">
                  {regionalData.currency}
                </div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Timezone</label>
              {isEditingRegional ? (
                <div className="select-wrapper">
                  <select 
                    value={draftRegional.timezone} 
                    onChange={e => setDraftRegional({...draftRegional, timezone: e.target.value})}
                  >
                    <option>(GMT-08:00) Pacific Time (US & Canada)</option>
                    <option>(GMT+00:00) London</option>
                    <option>(GMT+01:00) Lagos (WAT)</option>
                    <option>(GMT+01:00) Paris</option>
                  </select>
                  <ChevronDown className="chevron-icon" size={16} />
                </div>
              ) : (
                <div className="form-input static select">
                  {regionalData.timezone}
                </div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Unit System</label>
              {isEditingRegional ? (
                <div className="select-wrapper">
                  <select 
                    value={draftRegional.unitSystem} 
                    onChange={e => setDraftRegional({...draftRegional, unitSystem: e.target.value})}
                  >
                    <option>Metric System (kg, cm)</option>
                    <option>Imperial System (lb, in)</option>
                  </select>
                  <ChevronDown className="chevron-icon" size={16} />
                </div>
              ) : (
                <div className="form-input static select">
                  {regionalData.unitSystem}
                </div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Default Language</label>
              {isEditingRegional ? (
                <div className="select-wrapper">
                  <select 
                    value={draftRegional.language} 
                    onChange={e => setDraftRegional({...draftRegional, language: e.target.value})}
                  >
                    <option>English (US)</option>
                    <option>Spanish (ES)</option>
                    <option>French (FR)</option>
                  </select>
                  <ChevronDown className="chevron-icon" size={16} />
                </div>
              ) : (
                <div className="form-input static select">
                  {regionalData.language}
                </div>
              )}
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
        isLoading={isSaving}
      />
    </div>
  );
};

export default General;
