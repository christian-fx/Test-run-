import React, { useState, useEffect } from 'react';
import { 
  X, 
  ChevronDown, 
  UploadCloud, 
  Loader2, 
  Plus, 
  Trash2,
  Package,
  ChevronUp,
  GripVertical
} from 'lucide-react';
import './AddProductModal.css';
import { Link } from 'react-router-dom';

// API
import { uploadImage } from '../api/cloudinary';
import { addProduct, updateProduct } from '../api/products';
// Context
import { useCatalog } from '../context/useCatalog';

const AddProductModal = ({ isOpen, onClose, mode = 'add', product = null }) => {
  const { categories, loading: categoriesLoading, getBrandsForCategory } = useCatalog();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    brand: '',
    price: '',
    discountPrice: '',
    stock: '',
    status: 'Published',
    visibility: 'Public',
    isFeatured: false,
    notes: '',
    variantOption1Label: 'Color',
    variantOption2Label: 'Size',
  });

  const [images, setImages] = useState([]);
  const [features, setFeatures] = useState(['']);
  const [specs, setSpecs] = useState([{ key: '', value: '' }]);
  const [variants, setVariants] = useState([]);

  useEffect(() => {
    if (!isOpen) return;
    
    if (mode === 'edit' && product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        category: product.category || '',
        brand: product.brand || '',
        price: product.price || '',
        discountPrice: product.discountPrice || '',
        stock: product.stock || '',
        status: product.status || 'Published',
        visibility: product.visibility || 'Public',
        isFeatured: product.isFeatured || false,
        notes: product.notes || '',
        variantOption1Label: product.variantOption1Label || 'Color',
        variantOption2Label: product.variantOption2Label || 'Size',
      });
      setImages(product.images ? product.images.map(img => 
        typeof img === 'string' ? { url: img, label: '' } : img
      ) : []);
      setFeatures(product.features && product.features.length > 0 ? product.features : ['']);
      setSpecs(product.specs && product.specs.length > 0 ? product.specs : [{ key: '', value: '' }]);
      setVariants(product.variants || []);
    } else {
      setFormData({
        name: '',
        description: '',
        category: categories.length > 0 ? categories[0].name : '',
        brand: '',
        price: '',
        discountPrice: '',
        stock: '',
        status: 'Published',
        visibility: 'Public',
        isFeatured: false,
        notes: '',
        variantOption1Label: 'Color',
        variantOption2Label: 'Size',
      });
      setImages([]);
      setFeatures(['']);
      setSpecs([{ key: '', value: '' }]);
      setVariants([]);
    }
  }, [isOpen, mode, product, categories]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
  };

  const addFeature = () => setFeatures([...features, '']);
  const removeFeature = (index) => setFeatures(features.filter((_, i) => i !== index));

  const handleSpecChange = (index, field, value) => {
    const newSpecs = [...specs];
    newSpecs[index][field] = value;
    setSpecs(newSpecs);
  };

  const addSpec = () => setSpecs([...specs, { key: '', value: '' }]);
  const removeSpec = (index) => setSpecs(specs.filter((_, i) => i !== index));

  const addVariant = () => {
    setVariants([...variants, { 
      option1: '', 
      option2: '', 
      price: formData.price || '0.00', 
      stock: '0', 
      sku: '' 
    }]);
  };

  const generateVariantSKU = (index) => {
    const v = variants[index];
    if (!formData.name) {
      alert("Please enter a product name first");
      return;
    }
    const cleanName = formData.name.split(' ')[0].toUpperCase();
    const cleanOpt1 = (v.option1 || '').toUpperCase().replace(/\s+/g, '-');
    const cleanOpt2 = (v.option2 || '').toUpperCase().replace(/\s+/g, '-');
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    
    const sku = `${cleanName}-${cleanOpt1}${cleanOpt2 ? '-' + cleanOpt2 : ''}-${random}`;
    handleVariantChange(index, 'sku', sku);
  };

  const handleVariantChange = (index, field, value) => {
    const next = [...variants];
    next[index][field] = value;
    setVariants(next);
  };

  const removeVariant = (index) => setVariants(variants.filter((_, i) => i !== index));

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const urls = await Promise.all(files.map(file => uploadImage(file)));
      const newImages = urls.map((url, idx) => ({ 
        url, 
        label: idx === 0 && images.length === 0 ? 'Main View' : '' 
      }));
      setImages(prev => [...prev, ...newImages]);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload images.");
    } finally {
      setUploading(false);
    }
  };

  const handleLabelChange = (index, value) => {
    const next = [...images];
    next[index].label = value;
    setImages(next);
  };

  const moveImage = (index, direction) => {
    if ((direction === -1 && index === 0) || (direction === 1 && index === images.length - 1)) return;
    const next = [...images];
    const temp = next[index];
    next[index] = next[index + direction];
    next[index + direction] = temp;
    setImages(next);
  };

  const removeImage = (index) => setImages(prev => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.stock || !formData.category) {
      alert("Please fill in Name, Price, Stock, and Category");
      return;
    }

    setLoading(true);
    try {
      const productData = {
        ...formData,
        images,
        features: features.filter(f => f.trim() !== ''),
        specs: specs.filter(s => s.key.trim() !== ''),
        variants,
        sku: mode === 'edit' ? product.sku : `PROD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      };

      if (mode === 'edit') {
        await updateProduct(product.id, productData);
      } else {
        await addProduct(productData);
      }
      onClose();
    } catch (error) {
      console.error("Save failed:", error);
      alert("Error saving product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{mode === 'edit' ? 'Edit Product' : 'Add New Product'}</div>
          <div className="modal-close" onClick={onClose}>
            <X size={20} />
          </div>
        </div>

        <div className="modal-body">
          <div className="section">
            <div className="section-header">
              <div>
                <div className="section-title">Basic Info</div>
                <div className="section-subtitle">Core details customers see first.</div>
              </div>
            </div>
            <div className="section-panel">
              <div className="form-group">
                <div className="form-label">Name <span className="required-dot">*</span></div>
                <div className="form-input">
                  <input name="name" type="text" placeholder="e.g., Galaxy Buds Pro 2" value={formData.name} onChange={handleInputChange} />
                </div>
              </div>
              <div className="form-group">
                <div className="form-label">Description</div>
                <div className="form-input textarea">
                  <textarea name="description" placeholder="Write product overview..." value={formData.description} onChange={handleInputChange} />
                </div>
              </div>
              <div className="form-group">
                <div className="form-label">Category <span className="required-dot">*</span></div>
                {categoriesLoading ? (
                  <div className="flex items-center gap-2 text-muted px-3 py-2">
                    <Loader2 className="animate-spin" size={14} />
                    <span className="text-xs">Loading categories...</span>
                  </div>
                ) : categories.length > 0 ? (
                  <div className="select-wrapper">
                    <select name="category" value={formData.category} onChange={handleInputChange}>
                      {categories.map(cat => (
                        <React.Fragment key={cat.id}>
                          <option value={cat.name}>{cat.name}</option>
                          {cat.subcategories && cat.subcategories.map(sub => (
                            sub.name && (
                              <option key={`${cat.id}-${sub.name}`} value={`${cat.name} > ${sub.name}`}>
                                &nbsp;&nbsp;↳ {sub.name}
                              </option>
                            )
                          ))}
                        </React.Fragment>
                      ))}
                    </select>
                    <ChevronDown className="chevron-icon" size={16} />
                  </div>
                ) : (
                  <div className="flex flex-col gap-1 px-3 py-2">
                    <div className="text-destructive text-xs font-medium flex items-center gap-1">
                      <X size={12} /> No categories found
                    </div>
                    <Link to="/categories" className="text-primary text-xs hover:underline" onClick={onClose}>
                      Go to Categories page to add one
                    </Link>
                  </div>
                )}
              </div>

              {/* BRAND SELECTION - Context Aware & Optional */}
              <div className="form-group">
                <div className="form-label text-xs uppercase tracking-wider opacity-60">Brand (Optional)</div>
                <div className="form-input">
                  <input 
                    name="brand" 
                    type="text" 
                    list="brand-suggestions" 
                    placeholder="Select or enter brand..." 
                    value={formData.brand || ''} 
                    onChange={handleInputChange} 
                  />
                  <datalist id="brand-suggestions">
                    {(() => {
                      const brands = getBrandsForCategory(formData.category);
                      const uniqueBrands = [...new Set(brands)].filter(Boolean).sort();
                      
                      return uniqueBrands.map(b => (
                        <option key={b} value={b} />
                      ));
                    })()}
                  </datalist>
                </div>
              </div>
            </div>
          </div>

          <div className="section">
            <div className="section-header">
              <div>
                <div className="section-title">Pricing & Stock</div>
                <div className="section-subtitle">Set price, discounts, and inventory levels.</div>
              </div>
            </div>
            <div className="section-panel grid-3">
              <div className="form-group">
                <div className="form-label">Price <span className="required-dot">*</span></div>
                <div className="form-input">
                  <input name="price" type="text" placeholder="0.00" value={formData.price} onChange={handleInputChange} />
                </div>
              </div>
              <div className="form-group">
                <div className="form-label">Discount Price</div>
                <div className="form-input">
                  <input name="discountPrice" type="text" placeholder="Optional" value={formData.discountPrice} onChange={handleInputChange} />
                </div>
              </div>
              <div className="form-group">
                <div className="form-label">Stock Quantity <span className="required-dot">*</span></div>
                <div className="form-input">
                  <input name="stock" type="number" placeholder="0" value={formData.stock} onChange={handleInputChange} />
                </div>
              </div>
            </div>
          </div>

          <div className="section">
            <div className="section-header">
              <div>
                <div className="section-title">Media</div>
                <div className="section-subtitle">Upload multiple images.</div>
              </div>
            </div>
            <div className="section-panel">
              <label className="upload-area">
                <input type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} disabled={uploading} />
                {uploading ? (
                  <div className="upload-icon"><Loader2 className="animate-spin" size={24} /></div>
                ) : (
                  <div className="upload-icon"><UploadCloud size={24} /></div>
                )}
                <div className="upload-text">
                  <span>Click to upload</span> or drag and drop<br />
                  PNG, JPG or WEBP up to 10MB each
                </div>
              </label>
              <div className="file-list">
                {images.map((img, idx) => (
                  <div key={idx} className="file-row-enhanced">
                    <div className="file-preview-main">
                       <GripVertical size={16} className="text-muted cursor-grab" />
                       <div className="image-thumb">
                          <img src={img.url} alt="" />
                          {idx === 0 && <span className="primary-badge">Primary</span>}
                       </div>
                       <div className="image-info">
                          <input 
                            type="text" 
                            placeholder="Add label (e.g. Front View)" 
                            value={img.label} 
                            onChange={(e) => handleLabelChange(idx, e.target.value)}
                            className="label-input"
                          />
                          <div className="image-meta">First image is the display thumbnail</div>
                       </div>
                    </div>
                    <div className="file-actions">
                       <div className="move-controls">
                          <button className="move-btn" onClick={() => moveImage(idx, -1)} disabled={idx === 0}>
                             <ChevronUp size={14} />
                          </button>
                          <button className="move-btn rotate-180" onClick={() => moveImage(idx, 1)} disabled={idx === images.length - 1}>
                             <ChevronUp size={14} />
                          </button>
                       </div>
                       <button className="remove-btn" onClick={() => removeImage(idx)}>
                          <Trash2 size={14} />
                       </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="section">
            <div className="section-header">
              <div>
                <div className="section-title">Features</div>
              </div>
              <div className="btn btn-subtle" onClick={addFeature}>Add feature</div>
            </div>
            <div className="section-panel">
              {features.map((feature, idx) => (
                <div key={idx} className="dynamic-row">
                  <div className="form-input">
                    <input type="text" placeholder="e.g., Fast Charging" value={feature} onChange={(e) => handleFeatureChange(idx, e.target.value)} />
                  </div>
                  <div className="btn-remove-icon" onClick={() => removeFeature(idx)}>
                    <Trash2 size={16} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="section">
            <div className="section-header">
              <div>
                <div className="section-title">Specifications</div>
              </div>
              <div className="btn btn-subtle" onClick={addSpec}>Add spec</div>
            </div>
            <div className="section-panel">
              {specs.map((spec, idx) => (
                <div key={idx} className="spec-row">
                  <div className="form-input">
                    <input placeholder="Key" value={spec.key} onChange={(e) => handleSpecChange(idx, 'key', e.target.value)} />
                  </div>
                  <div className="form-input">
                    <input placeholder="Value" value={spec.value} onChange={(e) => handleSpecChange(idx, 'value', e.target.value)} />
                  </div>
                  <div className="btn-remove-icon" onClick={() => removeSpec(idx)}>
                    <Trash2 size={16} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="section">
            <div className="section-header">
              <div className="flex-1">
                <div className="section-title">Variants</div>
                <div className="section-subtitle">Add different product options (Color, Size, etc.)</div>
              </div>
              <div className="btn btn-subtle" onClick={addVariant}>Add variant</div>
            </div>
            <div className="section-panel">
              {/* Option Label Configuration */}
              <div className="variant-labels-config">
                 <div className="form-group-compact">
                    <div className="form-label-xs">Label for Option 1</div>
                    <div className="form-input-xs">
                       <input name="variantOption1Label" value={formData.variantOption1Label} onChange={handleInputChange} placeholder="e.g. Color" />
                    </div>
                 </div>
                 <div className="form-group-compact">
                    <div className="form-label-xs">Label for Option 2</div>
                    <div className="form-input-xs">
                       <input name="variantOption2Label" value={formData.variantOption2Label} onChange={handleInputChange} placeholder="e.g. Size" />
                    </div>
                 </div>
              </div>

              <div className="variant-scroll-wrapper">
                <div className="variant-grid-header">
                   <span>{formData.variantOption1Label}</span>
                   <span>{formData.variantOption2Label}</span>
                   <span>Price</span>
                   <span>Stock</span>
                   <span>SKU</span>
                   <span style={{ textAlign: 'right' }}>Action</span>
                </div>

                {variants.map((v, idx) => (
                  <div key={idx} className="variant-row-enhanced">
                    <div className="form-input-compact">
                      <input placeholder={`Value...`} value={v.option1} onChange={(e) => handleVariantChange(idx, 'option1', e.target.value)} />
                    </div>
                    <div className="form-input-compact">
                      <input placeholder={`Value...`} value={v.option2} onChange={(e) => handleVariantChange(idx, 'option2', e.target.value)} />
                    </div>
                    <div className="form-input-compact">
                      <input placeholder="Price" value={v.price} onChange={(e) => handleVariantChange(idx, 'price', e.target.value)} />
                    </div>
                    <div className="form-input-compact">
                      <input placeholder="Stock" type="number" value={v.stock} onChange={(e) => handleVariantChange(idx, 'stock', e.target.value)} />
                    </div>
                    <div className="form-input-compact sku-input-group">
                      <input placeholder="Auto" value={v.sku} onChange={(e) => handleVariantChange(idx, 'sku', e.target.value)} />
                      <div className="sku-gen-btn" onClick={() => generateVariantSKU(idx)}>Auto</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="remove-btn-compact" onClick={() => removeVariant(idx)}>
                        <Trash2 size={12} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {variants.length === 0 && (
                <div className="variants-empty">
                   <Package size={20} opacity={0.3} />
                   <span>No variants added.</span>
                </div>
              )}
            </div>
          </div>

          <div className="section">
            <div className="section-header">
              <div>
                <div className="section-title">Status & Visibility</div>
              </div>
            </div>
            <div className="section-panel">
              <div className="grid-2">
                <div className="form-group">
                  <div className="form-label">Status</div>
                  <div className="select-wrapper">
                    <select name="status" value={formData.status} onChange={handleInputChange}>
                      <option value="Published">Published</option>
                      <option value="Draft">Draft</option>
                    </select>
                    <ChevronDown className="chevron-icon" size={16} />
                  </div>
                </div>
                <div className="form-group">
                  <div className="form-label">Visibility</div>
                  <div className="select-wrapper">
                    <select name="visibility" value={formData.visibility} onChange={handleInputChange}>
                      <option value="Public">Public</option>
                      <option value="Private">Private</option>
                    </select>
                    <ChevronDown className="chevron-icon" size={16} />
                  </div>
                </div>
              </div>
              <div className="toggle-row">
                <div className="toggle-copy">
                  <div className="toggle-title">Featured</div>
                  <div className="toggle-subtitle">Show in homepage highlights.</div>
                </div>
                <div className={`switch ${formData.isFeatured ? 'active' : ''}`} onClick={() => setFormData(p => ({ ...p, isFeatured: !p.isFeatured }))}>
                  <div className="switch-knob"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="section">
            <div className="section-header">
              <div>
                <div className="section-title">Internal Notes</div>
                <div className="section-subtitle">Private annotations for staff only.</div>
              </div>
            </div>
            <div className="section-panel">
              <div className="form-group">
                <div className="form-input textarea">
                  <textarea 
                    name="notes" 
                    placeholder="e.g., Supplier contact info, restock schedule, etc..." 
                    value={formData.notes || ''} 
                    onChange={handleInputChange} 
                    style={{ minHeight: '100px' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <div className="btn btn-outline" onClick={onClose}>Cancel</div>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading || uploading || categoriesLoading || categories.length === 0}>
            {loading ? "Saving..." : "Save Product"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProductModal;
