import React from 'react';
import { 
  X, 
  Check, 
  Archive, 
  Pencil,
  Package
} from 'lucide-react';
import './ProductDetailsModal.css';

const ProductDetailsModal = ({ isOpen, onClose, product, onEdit, onArchive }) => {
  if (!isOpen || !product) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title">Product Details</div>
          <div className="modal-close" onClick={onClose}>
            <X size={20} />
          </div>
        </div>

        {/* Body */}
        <div className="modal-body">
          
          {/* Basic Info & Status */}
          <div className="section">
            <div className="section-panel">
              <div className="details-grid">
                <div className="detail-group" style={{ gridColumn: 'span 2' }}>
                  <div className="detail-label">Product Name & Category</div>
                  <div className="detail-value" style={{ fontSize: '20px', fontWeight: 600, marginBottom: '4px' }}>
                    {product.name}
                  </div>
                  <div className="detail-subvalue">Category: {product.category || 'Uncategorized'}</div>
                  
                  <div className="description-text">
                    {product.description || 'No description provided.'}
                  </div>
                </div>
                
                <div className="detail-group">
                  <div className="detail-label">Status & Visibility</div>
                  <div className="badge-group" style={{ marginTop: '8px' }}>
                    <span className={`badge badge-${product.status?.toLowerCase() === 'published' ? 'success' : 'secondary'}`}>
                      {product.status || 'Draft'}
                    </span>
                    <span className="badge badge-primary">{product.visibility || 'Public'}</span>
                    {product.isFeatured && <span className="badge badge-warning">Featured</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="section">
            <div className="section-header">
              <div className="section-title">Pricing & Stock Summary</div>
            </div>
            <div className="section-panel">
              <div className="details-grid">
                <div className="detail-group">
                  <div className="detail-label">Base Price</div>
                  <div className="detail-value" style={{ fontSize: '16px' }}>{product.price}</div>
                </div>
                <div className="detail-group">
                  <div className="detail-label">Discount Price</div>
                  <div className="detail-value" style={{ color: 'var(--success)', fontSize: '16px' }}>
                    {product.discountPrice || 'None'}
                  </div>
                </div>
                <div className="detail-group">
                  <div className="detail-label">Total Stock Available</div>
                  <div className="detail-value" style={{ fontSize: '16px' }}>{product.stock} Units</div>
                </div>
              </div>
            </div>
          </div>

          {/* Media Gallery */}
          <div className="section">
            <div className="section-header">
              <div className="section-title">Media Gallery</div>
            </div>
            <div className="section-panel">
              <div className="media-gallery-enhanced">
                {product.images && product.images.length > 0 ? product.images.map((img, idx) => {
                  const url = typeof img === 'string' ? img : img.url;
                  const label = typeof img === 'string' ? '' : img.label;
                  
                  return (
                    <div key={idx} className="product-image-card">
                      <div className="image-wrapper">
                        <img alt={label || `Product image ${idx}`} src={url} />
                        {idx === 0 && <span className="primary-pill">Primary</span>}
                      </div>
                      {label && <div className="image-label-caption">{label}</div>}
                    </div>
                  );
                }) : (
                  <div className="product-image-empty">
                    <Package size={32} />
                    <span>No images available</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Features & Specs Grid */}
          <div className="grid-2-custom">
            {/* Features */}
            <div className="section">
              <div className="section-header">
                <div className="section-title">Key Features</div>
              </div>
              <div className="section-panel" style={{ height: '100%' }}>
                <div className="feature-list">
                  {product.features && product.features.length > 0 ? product.features.map((feature, idx) => (
                    <div key={idx} className="feature-item">
                      <div className="feature-icon">
                        <Check size={14} />
                      </div>
                      <span>{feature}</span>
                    </div>
                  )) : <div className="text-muted">No features listed.</div>}
                </div>
              </div>
            </div>

            {/* Specifications */}
            <div className="section">
              <div className="section-header">
                <div className="section-title">Specifications</div>
              </div>
              <div className="section-panel" style={{ height: '100%' }}>
                <div className="spec-grid">
                  {product.specs && product.specs.length > 0 ? product.specs.map((spec, idx) => (
                    <div key={idx} className="spec-item">
                      <div className="spec-key">{spec.key}</div>
                      <div className="spec-value">{spec.value}</div>
                    </div>
                  )) : <div className="text-muted">No specifications.</div>}
                </div>
              </div>
            </div>
          </div>

          {/* Variants Table */}
          {product.variants && product.variants.length > 0 && (
            <div className="section">
              <div className="section-header">
                <div className="section-title">Product Variants</div>
              </div>
              <div className="section-panel" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table className="variant-table">
                    <thead>
                      <tr>
                        <th>{product.variantOption1Label || 'Option 1'}</th>
                        <th>{product.variantOption2Label || 'Option 2'}</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>SKU</th>
                      </tr>
                    </thead>
                    <tbody>
                      {product.variants.map((v, i) => (
                        <tr key={i}>
                          <td>{v.option1 || v.color || v.size || 'N/A'}</td>
                          <td>{v.option2 || v.storage || v.material || 'N/A'}</td>
                          <td>{v.price}</td>
                          <td>{v.stock}</td>
                          <td>{v.sku || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Internal Notes */}
          <div className="section">
            <div className="section-header">
              <div className="section-title">Internal Notes</div>
            </div>
            <div className="section-panel">
              <div className="description-text" style={{ marginTop: 0, color: 'var(--muted-foreground)' }}>
                {product.notes || 'No internal notes available.'}
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="modal-footer">
          <div className="btn btn-outline" onClick={() => onArchive(product)} style={{ color: 'var(--destructive)', borderColor: 'rgb(255 0 0 / 0.3)' }}>
            <Archive size={16} />
            Archive Product
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-subtle" onClick={onClose}>Close</button>
            <button className="btn btn-primary" onClick={() => onEdit(product)}>
              <Pencil size={16} />
              Edit Product
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductDetailsModal;
