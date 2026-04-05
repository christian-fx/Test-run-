import React, { useState, useEffect } from 'react';
import { 
  X, 
  ChevronDown, 
  Loader2 
} from 'lucide-react';
import './AddCouponModal.css';
import { upsertDiscount } from '../api/discounts';

const AddCouponModal = ({ isOpen, onClose, coupon = null }) => {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    type: 'Percentage',
    value: '',
    min_purchase: 0,
    usage_limit: 100,
    start_date: '',
    expiry_date: '',
    status: 'Active'
  });

  useEffect(() => {
    if (!isOpen) return;

    if (coupon) {
      setFormData({
        id: coupon.id,
        code: coupon.code || '',
        type: coupon.type || 'Percentage',
        value: coupon.value || '',
        min_purchase: coupon.min_purchase || 0,
        usage_limit: coupon.usage_limit || 100,
        start_date: coupon.start_date || '',
        expiry_date: coupon.expiry_date || '',
        status: coupon.status || 'Active'
      });
    } else {
      setFormData({
        code: '',
        type: 'Percentage',
        value: '',
        min_purchase: 0,
        usage_limit: 100,
        start_date: '',
        expiry_date: '',
        status: 'Active'
      });
    }
  }, [isOpen, coupon]);

  const handleSave = async () => {
    if (!formData.code || (formData.type !== 'Free Shipping' && !formData.value)) {
      alert("Please fill in Code and Value");
      return;
    }

    setSaving(true);
    try {
      await upsertDiscount(formData);
      onClose();
    } catch (error) {
      console.error("Failed to save discount:", error);
      alert("Failed to save discount. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{coupon ? 'Edit Coupon' : 'Create New Coupon'}</div>
          <div className="modal-close" onClick={onClose}><X size={20} /></div>
        </div>
        
        {/* Modal Body: This part is scrollable */}
        <div className="modal-body">
          {/* Campaign Core Info */}
          <div className="section">
            <div className="section-header">
              <div>
                <div className="section-title">Campaign Details</div>
                <div className="section-subtitle">Core voucher code and discount logic.</div>
              </div>
            </div>
            <div className="section-panel grid-2">
              <div className="form-group">
                <div className="form-label">Coupon Code</div>
                <div className="form-input">
                  <input 
                    type="text" 
                    placeholder="e.g. SUMMER50" 
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    required 
                  />
                </div>
              </div>
              <div className="form-group">
                <div className="form-label">Discount Type</div>
                <div className="select-wrapper">
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="Percentage">Percentage (%)</option>
                    <option value="Fixed Amount">Fixed Amount (Cash)</option>
                    <option value="Free Shipping">Free Shipping</option>
                  </select>
                  <ChevronDown className="chevron-icon" size={16} />
                </div>
              </div>
              <div className="form-group">
                <div className="form-label">Value {formData.type === 'Percentage' ? '(%)' : formData.type === 'Fixed Amount' ? '(Amount)' : ''}</div>
                <div className="form-input">
                  <input 
                    type="number" 
                    disabled={formData.type === 'Free Shipping'}
                    placeholder={formData.type === 'Free Shipping' ? 'N/A' : '0'} 
                    value={formData.value}
                    onChange={(e) => setFormData({...formData, value: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-group">
                <div className="form-label">Validation Status</div>
                <div className="select-wrapper">
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="Active">Live / Active</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Expired">Expired / Disabled</option>
                  </select>
                  <ChevronDown className="chevron-icon" size={16} />
                </div>
              </div>
            </div>
          </div>

          {/* Limits & Rules */}
          <div className="section">
            <div className="section-header">
              <div>
                <div className="section-title">Rules & Limits</div>
                <div className="section-subtitle">Define how and when this code can be used.</div>
              </div>
            </div>
            <div className="section-panel grid-2">
              <div className="form-group">
                <div className="form-label">Usage Limit</div>
                <div className="form-input">
                  <input 
                    type="number" 
                    placeholder="Unlimited if empty"
                    value={formData.usage_limit}
                    onChange={(e) => setFormData({...formData, usage_limit: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-group">
                <div className="form-label">Min. Purchase</div>
                <div className="form-input">
                  <input 
                    type="number" 
                    value={formData.min_purchase}
                    onChange={(e) => setFormData({...formData, min_purchase: e.target.value})}
                  />
                </div>
              </div>
              {formData.status === 'Scheduled' && (
                <div className="form-group">
                  <div className="form-label">Start Date</div>
                  <div className="form-input">
                    <input 
                      type="date" 
                      value={formData.start_date}
                      onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                      required
                    />
                  </div>
                </div>
              )}
              <div className="form-group">
                <div className="form-label">Expiry Date</div>
                <div className="form-input">
                  <input 
                    type="date" 
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({...formData, expiry_date: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer: This part remains fixed at the bottom */}
        <div className="modal-footer">
          <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? <><Loader2 className="animate-spin" size={16} /> Saving...</> : (coupon ? 'Save Changes' : 'Create Voucher')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddCouponModal;
