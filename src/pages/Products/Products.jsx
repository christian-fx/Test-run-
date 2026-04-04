import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Download, 
  Search, 
  ChevronDown, 
  ChevronLeft,
  ChevronRight,
  Package,
  Eye,
  AlertCircle,
  EyeIcon,
  Pencil,
  Trash2,
  Archive,
  CheckCircle2
} from 'lucide-react';
import './Products.css';
import { useToast } from '../../components/useToast';
import { SkeletonStat, SkeletonRow } from '../../components/Skeleton';
import EmptyState from '../../components/EmptyState';

// API
import { subscribeToProducts, deleteProduct } from '../../api/products';
import { createNotification, getNotifications } from '../../api/notifications';

// Components
import AddProductModal from '../../components/AddProductModal';
import ProductDetailsModal from '../../components/ProductDetailsModal';
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal';
import ActionMenu from '../../components/ActionMenu';
import BulkActionBar from '../../components/BulkActionBar';

const ITEMS_PER_PAGE = 10;

const Products = () => {
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalMode, setModalMode] = useState('add');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState(new Set());

  const handleAddClick = () => {
    setSelectedProduct(null);
    setModalMode('add');
    setShowAddModal(true);
  };

  const handleEditClick = (product) => {
    setSelectedProduct(product);
    setModalMode('edit');
    setShowAddModal(true);
  };

  useEffect(() => {
    const unsubscribe = subscribeToProducts((data) => {
      setProducts(data);
      setLoading(false);
      checkStockAlerts(data);
    });
    return () => unsubscribe();
  }, []);

  const checkStockAlerts = async (allProducts) => {
    try {
      // 1. Find critical products
      const outOfStock = allProducts.filter(p => parseInt(p.stock || 0) === 0);
      const lowStock = allProducts.filter(p => parseInt(p.stock || 0) > 0 && parseInt(p.stock || 0) <= 5);

      if (outOfStock.length === 0 && lowStock.length === 0) return;

      // 2. Get existing unread stock notifications to avoid duplicates
      const existingNotifs = await getNotifications(50);
      const unreadStockNotifs = existingNotifs.filter(n => n.type === 'stock' && n.status === 'unread');

      // 3. Create missing notifications
      for (const p of outOfStock) {
        const hasNotif = unreadStockNotifs.some(n => n.message.includes(p.name) && n.title.includes('Out of Stock'));
        if (!hasNotif) {
          await createNotification('stock', 'Out of Stock Alert', `Product "${p.name}" is currently out of stock.`);
        }
      }

      for (const p of lowStock) {
        const hasNotif = unreadStockNotifs.some(n => n.message.includes(p.name) && n.title.includes('Low Stock'));
        if (!hasNotif) {
          await createNotification('stock', 'Low Stock Warning', `Product "${p.name}" has only ${p.stock} units left.`);
        }
      }
    } catch (err) {
      console.error("Stock check failed:", err);
    }
  };

  const handleViewDetails = (product) => {
    setSelectedProduct(product);
    setShowDetailsModal(true);
  };

  const handleDeleteClick = (product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const filteredProducts = products
    .filter(product => {
      const matchesSearch = (product.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (product.sku || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || 
                            (product.status === statusFilter) || 
                            (statusFilter === 'Published' && product.status === 'Active');
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      }
      if (sortBy === 'price_high') return (Number(b.price) || 0) - (Number(a.price) || 0);
      if (sortBy === 'price_low') return (Number(a.price) || 0) - (Number(b.price) || 0);
      if (sortBy === 'az') return (a.name || '').localeCompare(b.name || '');
      return 0;
    });

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);



  const confirmDelete = async () => {
    try {
      await deleteProduct(selectedProduct.id);
      setShowDeleteModal(false);
      toast(`"${selectedProduct.name}" deleted successfully.`);
      setSelectedProduct(null);
      // Remove from selection if it was there
      const newSelected = new Set(selectedIds);
      newSelected.delete(selectedProduct.id);
      setSelectedIds(newSelected);
    } catch {
      toast('Failed to delete product.', 'error');
    }
  };

  // --- Bulk Actions ---
  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedProducts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedProducts.map(p => p.id)));
    }
  };

  const toggleSelectRow = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkDelete = async () => {
    const count = selectedIds.size;
    if (!window.confirm(`Are you sure you want to delete ${count} products? This cannot be undone.`)) return;
    
    try {
      const idsToDelete = Array.from(selectedIds);
      await Promise.all(idsToDelete.map(id => deleteProduct(id)));
      setSelectedIds(new Set());
      toast(`Successfully deleted ${count} products.`, 'success');
    } catch {
      toast('Failed to delete some products.', 'error');
    }
  };

  const handleArchiveProduct = async (product) => {
    try {
      const { updateProduct } = await import('../../api/products');
      await updateProduct(product.id, { status: 'Archived' });
      setShowDetailsModal(false);
      toast(`"${product.name}" archived.`);
    } catch {
      toast('Failed to archive product.', 'error');
    }
  };

  const handleEditFromDetails = (product) => {
    setShowDetailsModal(false);
    handleEditClick(product);
  };

  return (
    <div className="products-page">
      <div className="products-header">
        <div className="products-title-area">
          <h1 className="font-bold" style={{ fontSize: '24px' }}>Products</h1>
          <p className="text-muted">Manage your product catalog, inventory, and pricing in real-time.</p>
        </div>
        <div className="products-actions">
          <button className="btn btn-outline" onClick={() => {
            const csv = ['Name,SKU,Category,Price,Stock,Status', ...products.map(p => 
              `"${p.name}","${p.sku || ''}","${p.category || ''}",${p.price},${p.stock},"${p.status}"`
            )].join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
            a.download = 'products.csv'; a.click();
            toast('Products exported as CSV.');
          }}>
            <Download size={16} />
            Export
          </button>
          <button className="btn btn-primary" onClick={handleAddClick}>
            <Plus size={16} />
            Add Product
          </button>
        </div>
      </div>

      {loading ? (
        <div className="stats-grid">
          <SkeletonStat /><SkeletonStat /><SkeletonStat /><SkeletonStat />
        </div>
      ) : (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-title">Total Products</div>
              <div className="stat-icon"><Package size={18} /></div>
            </div>
            <div className="stat-value">{products.length}</div>
            <div className="text-sm text-muted" style={{ marginTop: '8px' }}>Across all categories</div>
          </div>
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-title">Active Products</div>
              <div className="stat-icon"><Eye size={18} /></div>
            </div>
            <div className="stat-value">{products.filter(p => p.status === 'Active' || p.status === 'Published').length}</div>
            <div className="text-sm text-muted" style={{ marginTop: '8px' }}>Ready for sale</div>
          </div>
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-title">Out of Stock</div>
              <div className="stat-icon" style={{ background: 'color-mix(in srgb, var(--destructive) 15%, transparent)', color: 'var(--destructive)' }}>
                <AlertCircle size={18} />
              </div>
            </div>
            <div className="stat-value">{products.filter(p => parseInt(p.stock) === 0).length}</div>
            <div className="text-sm text-muted" style={{ marginTop: '8px' }}>Immediate restock needed</div>
          </div>
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-title">Low Stock</div>
              <div className="stat-icon" style={{ background: 'color-mix(in srgb, var(--warning) 15%, transparent)', color: 'var(--warning)' }}>
                <AlertCircle size={18} />
              </div>
            </div>
            <div className="stat-value">{products.filter(p => parseInt(p.stock) > 0 && parseInt(p.stock) < 10).length}</div>
            <div className="text-sm text-muted" style={{ marginTop: '8px' }}>Requires attention</div>
          </div>
        </div>
      )}

      <div className="filters-bar">
        <div className="filters-left">
          <div className="filter-input-wrapper search">
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Search by product name or SKU..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <div className="filter-select">
            <label>Status:</label>
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}>
              <option value="All">All Statuses</option>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
              <option value="Archived">Archived</option>
            </select>
            <ChevronDown className="chevron-icon" size={14} />
          </div>
        </div>
        <div className="filter-select" style={{ minWidth: '160px' }}>
          <label>Sort:</label>
          <select value={sortBy} onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}>
            <option value="newest">Newest First</option>
            <option value="price_high">Price: High to Low</option>
            <option value="price_low">Price: Low to High</option>
            <option value="az">Name: A to Z</option>
          </select>
          <ChevronDown className="chevron-icon" size={14} />
        </div>
      </div>

      <div className="panel">
        <div style={{ overflowX: 'auto' }}>
          <table className="table-w">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>
                  <input 
                    type="checkbox" 
                    className="table-checkbox"
                    checked={paginatedProducts.length > 0 && selectedIds.size === paginatedProducts.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {!loading && paginatedProducts.map((product) => (
                <tr key={product.id} className={selectedIds.has(product.id) ? 'row-selected' : ''}>
                  <td>
                    <input 
                      type="checkbox" 
                      className="table-checkbox"
                      checked={selectedIds.has(product.id)}
                      onChange={() => toggleSelectRow(product.id)}
                    />
                  </td>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="product-image-placeholder" style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: 'var(--radius-md)', 
                        overflow: 'hidden',
                        background: 'var(--secondary)'
                      }}>
                        {product.images && product.images[0] ? (
                          <img 
                            src={typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url} 
                            alt={product.name} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                          />
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                            <Package size={16} color="var(--muted-foreground)" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-xs text-muted">{product.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td className="text-muted">{product.sku || 'N/A'}</td>
                  <td>{product.category || 'Uncategorized'}</td>
                  <td className="font-medium">₦{Number(product.price || 0).toLocaleString()}</td>
                  <td>
                    <div className="flex items-center gap-2">
                       <div style={{ 
                        width: '8px', 
                        height: '8px', 
                        borderRadius: '50%', 
                        background: parseInt(product.stock) > 20 ? 'var(--success)' : parseInt(product.stock) > 0 ? 'var(--warning)' : 'var(--destructive)' 
                      }}></div>
                      {product.stock} units
                    </div>
                  </td>
                  <td>
                    <span className={`badge badge-${(product.status === 'Active' || product.status === 'Published') ? 'success' : 'secondary'}`}>
                      {product.status || 'Draft'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <ActionMenu 
                      options={[
                        { label: 'View Details', icon: EyeIcon, onClick: () => handleViewDetails(product) },
                        { label: 'Edit Product', icon: Pencil, onClick: () => handleEditClick(product) },
                        { label: 'Delete Product', icon: Trash2, destructive: true, onClick: () => handleDeleteClick(product) }
                      ]}
                    />
                  </td>
                </tr>
              ))}
              {!loading && filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ padding: 0 }}>
                    <EmptyState 
                      icon={Package} 
                      title={`No ${statusFilter === 'All' ? '' : statusFilter.toLowerCase()} products found`}
                      message="Try adjusting your search or filters to find what you're looking for."
                      action={searchTerm || statusFilter !== 'All' ? () => { setSearchTerm(''); setStatusFilter('All'); } : handleAddClick}
                      actionLabel={searchTerm || statusFilter !== 'All' ? "Clear filters" : "Add Product"}
                    />
                  </td>
                </tr>
              )}
              {loading && Array.from({ length: 6 }).map((_, i) => (
                <SkeletonRow key={i} cols={8} />
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between" style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
            <div className="text-xs text-muted">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)} of {filteredProducts.length}
            </div>
            <div className="flex items-center gap-2">
              <button className="btn btn-outline" style={{ padding: '6px 10px' }} disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
                <ChevronLeft size={14} />
              </button>
              <span className="text-sm font-medium">Page {currentPage} of {totalPages}</span>
              <button className="btn btn-outline" style={{ padding: '6px 10px' }} disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddProductModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
        mode={modalMode}
        product={selectedProduct}
      />

      <ProductDetailsModal 
        isOpen={showDetailsModal} 
        onClose={() => setShowDetailsModal(false)}
        product={selectedProduct}
        onEdit={handleEditFromDetails}
        onArchive={handleArchiveProduct}
      />

      <ConfirmDeleteModal 
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Product?"
        message={`Are you sure you want to delete "${selectedProduct?.name}"? This action cannot be undone.`}
      />

      <BulkActionBar 
        selectedCount={selectedIds.size}
        onClear={() => setSelectedIds(new Set())}
        actions={[
          { label: 'Archive', icon: Archive, onClick: () => toast('Bulk archive coming soon.', 'info') },
          { label: 'Delete', icon: Trash2, variant: 'danger', onClick: handleBulkDelete }
        ]}
      />
    </div>
  );
};

export default Products;
