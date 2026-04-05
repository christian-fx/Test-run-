import React, { useState, useEffect } from 'react';
import { 
  X, 
  UploadCloud, 
  Loader2, 
  ChevronDown, 
  ExternalLink,
  Image as ImageIcon
} from 'lucide-react';
import './AddPromotionModal.css';
import { uploadImage } from '../api/cloudinary';
import { upsertPromotion } from '../api/promotions';

const AddPromotionModal = ({ isOpen, onClose, promotion = null }) => {
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Hero Carousel',
    status: 'Running',
    imageUrl: '',
    linkUrl: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    if (!isOpen) return;

    if (promotion) {
      setFormData({
        id: promotion.id,
        title: promotion.title || '',
        description: promotion.description || '',
        type: promotion.type || 'Hero Carousel',
        status: promotion.status || 'Running',
        imageUrl: promotion.imageUrl || '',
        linkUrl: promotion.linkUrl || '',
        startDate: promotion.startDate ? promotion.startDate.split('T')[0] : '',
        endDate: promotion.endDate ? promotion.endDate.split('T')[0] : ''
      });
    } else {
      setFormData({
        title: '',
        description: '',
        type: 'Hero Carousel',
        status: 'Running',
        imageUrl: '',
        linkUrl: '',
        startDate: '',
        endDate: ''
      });
    }
  }, [isOpen, promotion]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadImage(file);
      setFormData(prev => ({ ...prev, imageUrl: url }));
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title || !formData.imageUrl) {
      alert("Please ensure a Title and Promotion Image are provided.");
      return;
    }

    setSaving(true);
    try {
      await upsertPromotion(formData);
      onClose();
    } catch (error) {
      console.error("Save failed:", error);
      alert("Failed to save promotion. Check your connection.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{promotion ? 'Edit Campaign' : 'New Banner Campaign'}</div>
          <div className="modal-close" onClick={onClose}><X size={20} /></div>
        </div>

        <div className="modal-body">
          {/* Media Section */}
          <div className="section">
            <div className="section-header">
              <div className="section-title">Promotion Visual</div>
            </div>
            <div className="section-panel">
               <label className="promo-upload-area">
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} disabled={uploading} />
                  {uploading ? (
                     <div className="upload-placeholder">
                        <Loader2 className="animate-spin text-primary" size={32} />
                        <span className="text-sm font-medium">Uploading high-res asset...</span>
                     </div>
                  ) : formData.imageUrl ? (
                     <>
                        <img src={formData.imageUrl} alt="Preview" className="promo-preview-image" />
                        <div className="upload-overlay">
                           <UploadCloud size={24} />
                           <span className="text-sm font-bold">Replace Banner</span>
                        </div>
                     </>
                  ) : (
                     <div className="upload-placeholder">
                        <UploadCloud className="text-muted" size={40} />
                        <div className="flex-col gap-1 items-center">
                           <span className="text-sm font-bold text-foreground">Click to upload banner</span>
                           <span className="text-xs text-muted">21:9 Aspect ratio recommended</span>
                        </div>
                     </div>
                  )}
               </label>
            </div>
          </div>

          {/* Configuration Section */}
          <div className="section">
            <div className="section-header">
              <div className="section-title">Campaign Configuration</div>
            </div>
            <div className="section-panel">
               <div className="form-group">
                  <div className="form-label">Campaign Title</div>
                  <div className="form-input">
                     <input 
                        type="text" 
                        placeholder="e.g. Summer Tech Extravaganza" 
                        value={formData.title} 
                        onChange={e => setFormData({...formData, title: e.target.value})}
                     />
                  </div>
               </div>
               
               <div className="grid-2">
                  <div className="form-group">
                     <div className="form-label">Placement Type</div>
                     <div className="select-wrapper">
                        <select 
                           value={formData.type} 
                           onChange={e => setFormData({...formData, type: e.target.value})}
                        >
                           <option value="Hero Carousel">Hero Carousel (Top)</option>
                           <option value="Product Spotlight">Product Spotlight</option>
                           <option value="Sidebar Banner">Sidebar Banner</option>
                           <option value="Popup">Interactive Popup</option>
                        </select>
                        <ChevronDown className="chevron-icon" size={16} />
                     </div>
                  </div>
                  <div className="form-group">
                     <div className="form-label">Destination Link (URL)</div>
                     <div className="form-input">
                        <ExternalLink size={14} className="text-muted mr-2" />
                        <input 
                           type="text" 
                           placeholder="/collection/new-arrivals" 
                           value={formData.linkUrl} 
                           onChange={e => setFormData({...formData, linkUrl: e.target.value})}
                        />
                     </div>
                  </div>
               </div>
            </div>
          </div>

          {/* Scheduling Section */}
          <div className="section">
            <div className="section-header">
              <div className="section-title">Lifecycle & Scheduling</div>
            </div>
            <div className="section-panel grid-2">
               <div className="form-group">
                  <div className="form-label">Start Date</div>
                  <div className="form-input">
                     <input 
                        type="date" 
                        value={formData.startDate} 
                        onChange={e => setFormData({...formData, startDate: e.target.value})}
                     />
                  </div>
               </div>
               <div className="form-group">
                  <div className="form-label">End Date (Expiry)</div>
                  <div className="form-input">
                     <input 
                        type="date" 
                        value={formData.endDate} 
                        onChange={e => setFormData({...formData, endDate: e.target.value})}
                     />
                  </div>
               </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving || uploading}>
            {saving ? <><Loader2 className="animate-spin" size={16} /> Saving...</> : (promotion ? 'Save Changes' : 'Launch Campaign')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddPromotionModal;
