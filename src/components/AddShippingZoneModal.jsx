import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Truck, 
  Clock, 
  ChevronDown, 
  Loader2 
} from 'lucide-react';
import './AddShippingZoneModal.css';
import { upsertZone } from '../api/shipping';

const AddShippingZoneModal = ({ isOpen, onClose, zone = null }) => {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    regions: '',
    rate: 0,
    timeEstimate: '',
    status: 'Active'
  });

  useEffect(() => {
    if (!isOpen) return;

    if (zone) {
      setFormData({
        id: zone.id,
        name: zone.name || '',
        regions: zone.regions || '',
        rate: zone.rate || 0,
        timeEstimate: zone.timeEstimate || '',
        status: zone.status || 'Active'
      });
    } else {
      setFormData({
        name: '',
        regions: '',
        rate: 0,
        timeEstimate: '',
        status: 'Active'
      });
    }
  }, [isOpen, zone]);

  const handleSave = async () => {
    if (!formData.name || !formData.regions) {
      alert("Please fill in Zone Name and Covered Regions");
      return;
    }

    setSaving(true);
    try {
      await upsertZone(formData);
      onClose();
    } catch (error) {
      console.error("Save failed:", error);
      alert("Failed to save shipping zone. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{zone ? 'Edit Shipping Zone' : 'Create New Delivery Zone'}</div>
          <div className="modal-close" onClick={onClose}><X size={20} /></div>
        </div>

        <div className="modal-body">
          {/* Geographical Section */}
          <div className="section">
            <div className="section-header">
              <div className="section-title text-sm font-bold text-muted-foreground uppercase tracking-wider">Geography & Scope</div>
            </div>
            <div className="section-panel">
               <div className="form-group mb-4">
                  <div className="form-label">Zone Name</div>
                  <div className="form-input">
                     <input 
                        type="text" 
                        placeholder="e.g. Lagos Metropolitan Area" 
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                     />
                  </div>
               </div>
               <div className="form-group">
                  <div className="form-label">Covered Regions / Cities</div>
                  <div className="form-input textarea">
                     <textarea 
                        placeholder="List specific areas (e.g. Ikeja, Lekki, Victoria Island...)" 
                        value={formData.regions}
                        onChange={e => setFormData({...formData, regions: e.target.value})}
                     />
                  </div>
               </div>
            </div>
          </div>

          {/* Pricing & Logistics Section */}
          <div className="section">
            <div className="section-header">
              <div className="section-title text-sm font-bold text-muted-foreground uppercase tracking-wider">Rates & Fulfillment</div>
            </div>
            <div className="section-panel grid-2">
               <div className="form-group">
                  <div className="form-label">Base Delivery Rate</div>
                  <div className="form-input">
                     <input 
                        type="number" 
                        placeholder="0.00" 
                        value={formData.rate}
                        onChange={e => setFormData({...formData, rate: e.target.value})}
                     />
                  </div>
               </div>
               <div className="form-group">
                  <div className="form-label">Estimated Time</div>
                  <div className="form-input">
                     <Clock size={16} className="text-muted mr-2" />
                     <input 
                        type="text" 
                        placeholder="e.g. 1-2 Working Days" 
                        value={formData.timeEstimate}
                        onChange={e => setFormData({...formData, timeEstimate: e.target.value})}
                     />
                  </div>
               </div>
               <div className="form-group">
                  <div className="form-label">Operational Status</div>
                  <div className="select-wrapper relative flex items-center">
                     <select 
                        className="w-full bg-background border border-border rounded-md p-2 appearance-none text-sm outline-none"
                        value={formData.status}
                        onChange={e => setFormData({...formData, status: e.target.value})}
                     >
                        <option value="Active">Active / Taking Orders</option>
                        <option value="Inactive">Paused / No Deliveries</option>
                     </select>
                     <ChevronDown className="absolute right-3 pointer-events-none text-muted" size={16} />
                  </div>
               </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? <><Loader2 className="animate-spin" size={16} /> Saving...</> : (zone ? 'Save Changes' : 'Create Delivery Zone')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddShippingZoneModal;
