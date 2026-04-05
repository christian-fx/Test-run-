import React, { useState, useEffect } from 'react';
import { 
  X, 
  ChevronDown, 
  Loader2, 
  Laptop,
  Smartphone,
  Headphones,
  Watch,
  Gamepad2,
  FolderTree,
  Tablet,
  Monitor,
  Keyboard,
  Mouse,
  Camera,
  Printer,
  Mic,
  Speaker,
  Home,
  Zap,
  Wifi,
  Trash2,
  Plus
} from 'lucide-react';
import './AddCategoryModal.css';

// API
import { addCategory, updateCategory } from '../api/categories';

const iconMap = {
  Laptop: Laptop,
  Smartphone: Smartphone,
  Headphones: Headphones,
  Watch: Watch,
  Gamepad2: Gamepad2,
  FolderTree: FolderTree,
  Tablet: Tablet,
  Monitor: Monitor,
  Keyboard: Keyboard,
  Mouse: Mouse,
  Camera: Camera,
  Printer: Printer,
  Mic: Mic,
  Speaker: Speaker,
  Home: Home,
  Zap: Zap,
  Wifi: Wifi
};

// Hardcoded Keyword Lookup Table
const KEYWORD_ICON_MAP = [
  { keywords: ['phone', 'mobile', 'smartphone', 'cell'], icon: 'Smartphone' },
  { keywords: ['laptop', 'computer', 'macbook', 'pc', 'desktop'], icon: 'Laptop' },
  { keywords: ['tablet', 'ipad', 'surface', 'tab'], icon: 'Tablet' },
  { keywords: ['monitor', 'screen', 'display', 'tv', 'led'], icon: 'Monitor' },
  { keywords: ['keyboard', 'typing', 'board'], icon: 'Keyboard' },
  { keywords: ['mouse', 'trackpad', 'pointer'], icon: 'Mouse' },
  { keywords: ['camera', 'photo', 'video', 'lens', 'vlog'], icon: 'Camera' },
  { keywords: ['printer', 'scanner', 'fax', 'copy'], icon: 'Printer' },
  { keywords: ['mic', 'microphone', 'podcast', 'record'], icon: 'Mic' },
  { keywords: ['speaker', 'audio', 'sound', 'woofer', 'music'], icon: 'Speaker' },
  { keywords: ['wifi', 'router', 'network', 'modem', 'internet'], icon: 'Wifi' },
  { keywords: ['battery', 'power', 'charge', 'zap', 'energy'], icon: 'Zap' },
  { keywords: ['home', 'smart home', 'automation', 'living'], icon: 'Home' },
  { keywords: ['audio', 'headphone', 'earbud'], icon: 'Headphones' },
  { keywords: ['gaming', 'console', 'switch', 'xbox', 'ps5', 'game', 'playstation'], icon: 'Gamepad2' },
  { keywords: ['watch', 'wearable', 'smartwatch', 'band', 'apple watch'], icon: 'Watch' }
];

const AddCategoryModal = ({ isOpen, onClose, mode = 'add', category = null }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    slug: '',
    status: 'Active',
    icon: 'FolderTree'
  });

  const [subcategories, setSubcategories] = useState([
    { name: '', slug: '' }
  ]);

  // Exhaustive Keyword-to-Icon Mapper
  const detectIcon = (name) => {
    const val = name.toLowerCase();
    if (!val) return 'FolderTree';
    
    for (const entry of KEYWORD_ICON_MAP) {
      if (entry.keywords.some(ki => val.includes(ki))) {
        return entry.icon;
      }
    }
    return 'FolderTree';
  };

  const generateSlug = (name) => {
    return name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  useEffect(() => {
    if (!isOpen) return;

    if (mode === 'edit' && category) {
      setFormData({
        name: category.name || '',
        description: category.description || '',
        slug: category.slug || '',
        status: category.status || 'Active',
        icon: category.icon || 'FolderTree'
      });
      setSubcategories(category.subcategories && category.subcategories.length > 0 ? category.subcategories : [{ name: '', slug: '' }]);
    } else {
      setFormData({
        name: '',
        description: '',
        slug: '',
        status: 'Active',
        icon: 'FolderTree'
      });
      setSubcategories([{ name: '', slug: '' }]);
    }
  }, [isOpen, mode, category]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const next = { ...prev, [name]: value };
      
      // Intensive Automation for Name Field
      if (name === 'name') {
        next.slug = generateSlug(value);
        // Aggressive auto-detection (Detect and choose)
        next.icon = detectIcon(value);
      }
      
      return next;
    });
  };

  const handleSubcategoryChange = (index, field, value) => {
    const next = [...subcategories];
    next[index][field] = value;
    
    // Auto-generate subcategory slug
    if (field === 'name') {
      next[index].slug = generateSlug(value);
    }
    setSubcategories(next);
  };

  const handleAddBrand = (subIdx, brandName) => {
    if (!brandName.trim()) return;
    const next = [...subcategories];
    const brands = next[subIdx].brands || [];
    if (!brands.includes(brandName.trim())) {
      next[subIdx].brands = [...brands, brandName.trim()];
      setSubcategories(next);
    }
  };

  const handleRemoveBrand = (subIdx, brandIdx) => {
    const next = [...subcategories];
    next[subIdx].brands = next[subIdx].brands.filter((_, i) => i !== brandIdx);
    setSubcategories(next);
  };

  const addSubcategory = () => setSubcategories([...subcategories, { name: '', slug: '', brands: [] }]);
  const removeSubcategory = (index) => setSubcategories(subcategories.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.slug) {
      alert("Please fill in Name and Slug");
      return;
    }

    setLoading(true);
    try {
      const categoryData = {
        ...formData,
        subcategories: subcategories.filter(s => s.name.trim() !== '')
      };

      if (mode === 'edit') {
        await updateCategory(category.id, categoryData);
      } else {
        await addCategory(categoryData);
      }
      onClose();
    } catch (error) {
      console.error("Save failed:", error);
      alert("Error saving category.");
    } finally {
      setLoading(false);
    }
  };

  const IconComponent = iconMap[formData.icon] || FolderTree;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{mode === 'edit' ? 'Edit Category' : 'Add New Category'}</div>
          <div className="modal-close" onClick={onClose}>
            <X size={20} />
          </div>
        </div>

        <div className="modal-body">
          <div className="section">
            <div className="section-header">
              <div>
                <div className="section-title">Category Details</div>
                <div className="section-subtitle">Auto-generates icon and slug based on name keywords.</div>
              </div>
            </div>
            <div className="section-panel">
              <div className="form-group">
                <div className="form-label flex items-center justify-between">
                  <span>Name <span className="required-dot">*</span></span>
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <span>Auto-icon:</span>
                    <div className="category-icon-wrapper" style={{ width: '24px', height: '24px', padding: '4px' }}>
                      <IconComponent size={14} />
                    </div>
                  </div>
                </div>
                <div className="form-input">
                  <input name="name" type="text" placeholder="e.g., Apple MacBooks" value={formData.name} onChange={handleInputChange} />
                </div>
              </div>
              <div className="form-group">
                <div className="form-label">Slug</div>
                <div className="form-input">
                  <input name="slug" type="text" placeholder="auto-generated-slug" value={formData.slug} onChange={handleInputChange} />
                </div>
              </div>
              <div className="form-group">
                <div className="form-label">Description</div>
                <div className="form-input textarea">
                  <textarea name="description" placeholder="Optional category description..." value={formData.description} onChange={handleInputChange} />
                </div>
              </div>
            </div>
          </div>

          <div className="section">
            <div className="section-header">
              <div>
                <div className="section-title">Subcategories & Brands</div>
                <div className="section-subtitle">Define optional brands for each subcategory (comma-separated).</div>
              </div>
              <div className="btn btn-subtle" onClick={addSubcategory}>Add subcategory</div>
            </div>
            <div className="section-panel">
              {subcategories.map((sub, idx) => (
                <div key={idx} className="subcategory-management-row">
                  <div className="subcategory-main-inputs">
                    <div className="form-input">
                      <input placeholder="Subcategory Name" value={sub.name} onChange={(e) => handleSubcategoryChange(idx, 'name', e.target.value)} />
                    </div>
                    <div className="form-input">
                      <input placeholder="Slug" value={sub.slug} readOnly />
                    </div>
                    {subcategories.length > 1 && (
                      <div className="btn-remove-icon" onClick={() => removeSubcategory(idx)}>
                        <Trash2 size={16} />
                      </div>
                    )}
                  </div>
                  <div className="subcategory-brands-management">
                    <div className="form-label text-xs" style={{ marginBottom: '8px', opacity: 0.7 }}>Manage Brands (Optional)</div>
                    <div className="brand-tags-container">
                      {sub.brands && sub.brands.map((brand, bIdx) => (
                        <div key={bIdx} className="brand-tag">
                          <span>{brand}</span>
                          <X size={12} onClick={() => handleRemoveBrand(idx, bIdx)} />
                        </div>
                      ))}
                      <div className="add-brand-input-wrapper">
                        <input 
                          placeholder="Add brand..." 
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddBrand(idx, e.target.value);
                              e.target.value = '';
                            }
                          }}
                        />
                        <Plus size={14} className="add-icon" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="section">
            <div className="section-panel">
              <div className="form-group">
                <div className="form-label">Visibility Status</div>
                <div className="select-wrapper">
                  <select name="status" value={formData.status} onChange={handleInputChange}>
                    <option value="Active">Active (Visible)</option>
                    <option value="Inactive">Inactive (Hidden)</option>
                  </select>
                  <ChevronDown className="chevron-icon" size={16} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <div className="btn btn-outline" onClick={onClose}>Cancel</div>
          <div className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? <><Loader2 className="animate-spin" size={16} /> Saving...</> : "Save Category"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCategoryModal;
