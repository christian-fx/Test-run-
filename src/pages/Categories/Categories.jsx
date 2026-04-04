import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  ChevronDown, 
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
  Pencil,
  Trash2,
  Package
} from 'lucide-react';
import './Categories.css';
import { SkeletonStat, SkeletonRow } from '../../components/Skeleton';
import EmptyState from '../../components/EmptyState';

// API
import { subscribeToCategories, deleteCategory } from '../../api/categories';
import { subscribeToProducts } from '../../api/products';

// Components
import AddCategoryModal from '../../components/AddCategoryModal';
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal';
import ActionMenu from '../../components/ActionMenu';

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

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const handleAddClick = () => {
    setSelectedCategory(null);
    setModalMode('add');
    setShowAddModal(true);
  };

  const handleEditClick = (category) => {
    setSelectedCategory(category);
    setModalMode('edit');
    setShowAddModal(true);
  };

  useEffect(() => {
    // 1. Subscribe to Categories
    // 1. Subscribe to Categories
    const unsubscribeCats = subscribeToCategories((data) => {
      setCategories(data);
      setLoading(false); // Resolve loading as soon as categories arrive
    });

    // 2. Subscribe to Products for Dynamic Counting
    const unsubscribeProds = subscribeToProducts((data) => {
      setProducts(data);
    });

    return () => {
      unsubscribeCats();
      unsubscribeProds();
    };
  }, []);

  const getProductCount = (categoryName) => {
    return products.filter(p => 
      p.category === categoryName || 
      (p.category && p.category.startsWith(`${categoryName} >`))
    ).length;
  };

  const filteredCategories = categories.filter(category => {
    const matchesSearch = (category.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || category.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDeleteClick = (category) => {
    setSelectedCategory(category);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setDeleteLoading(true);
    try {
      await deleteCategory(selectedCategory.id);
      setShowDeleteModal(false);
      setSelectedCategory(null);
    } catch (error) {
      console.error("Failed to delete category:", error);
      alert("Failed to delete category. Please try again.");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="categories-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold" style={{ fontSize: '24px' }}>Categories</h1>
          <p className="text-muted">Intelligent automated category management with real-time product syncing.</p>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-primary" onClick={handleAddClick}>
            <Plus size={16} />
            Add Category
          </button>
        </div>
      </div>

      {loading ? (
        <div className="stats-grid">
          <SkeletonStat /><SkeletonStat />
        </div>
      ) : (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-title">Total Categories</div>
              <div className="stat-icon"><FolderTree size={18} /></div>
            </div>
            <div className="stat-value">{categories.length}</div>
            <div className="text-sm text-muted" style={{ marginTop: '8px' }}>Across all departments</div>
          </div>
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-title">Active Products</div>
              <div className="stat-icon"><Package size={18} /></div>
            </div>
            <div className="stat-value">{products.length}</div>
            <div className="text-sm text-muted" style={{ marginTop: '8px' }}>Live in catalog</div>
          </div>
        </div>
      )}

      <div className="filters-bar">
        <div className="filters-left">
          <div className="filter-input-wrapper search">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
               <Search size={16} color="var(--muted-foreground)" />
               <input 
                 type="text" 
                 placeholder="Search categories..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '14px' }}
               />
            </div>
          </div>
          <div className="filter-select">
            <label>Status:</label>
            <div className="select-wrapper" style={{ width: '140px', height: '36px', border: 'none', background: 'transparent' }}>
               <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              <ChevronDown className="chevron-icon" size={14} />
            </div>
          </div>
        </div>
      </div>

      <div className="panel">
        <div style={{ overflowX: 'auto' }}>
          <table className="table-w">
            <thead>
              <tr>
                <th style={{ width: '40px' }}><div className="table-checkbox"></div></th>
                <th>Category</th>
                <th>Slug</th>
                <th>Products Count</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {!loading && filteredCategories.map(category => {
                const IconComponent = iconMap[category.icon] || FolderTree;
                const pCount = getProductCount(category.name);
                return (
                  <tr key={category.id}>
                    <td><div className="table-checkbox"></div></td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="category-icon-wrapper">
                          <IconComponent size={20} />
                        </div>
                        <div className="font-medium">{category.name}</div>
                      </div>
                    </td>
                    <td className="text-muted">/{category.slug}</td>
                    <td>
                       <div className="flex items-center gap-2">
                          <span className="font-medium" style={{ color: pCount > 0 ? 'var(--primary)' : 'inherit' }}>{pCount}</span>
                          <span className="text-xs text-muted">products</span>
                       </div>
                    </td>
                    <td>
                      <span className={`badge badge-${(category.status || '').toLowerCase() === 'active' ? 'success' : 'secondary'}`}>
                        {category.status || 'Active'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <ActionMenu 
                        options={[
                          { label: 'Edit Category', icon: Pencil, onClick: () => handleEditClick(category) },
                          { label: 'Delete Category', icon: Trash2, destructive: true, onClick: () => handleDeleteClick(category) }
                        ]}
                      />
                    </td>
                  </tr>
                );
              })}
              {!loading && filteredCategories.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ padding: 0 }}>
                    <EmptyState 
                      Icon={FolderTree} 
                      title={`No ${statusFilter === 'All' ? '' : statusFilter.toLowerCase()} categories found`}
                      message="Try adjusting your search or filters to find what you're looking for."
                      action={searchTerm || statusFilter !== 'All' ? () => { setSearchTerm(''); setStatusFilter('All'); } : handleAddClick}
                      actionLabel={searchTerm || statusFilter !== 'All' ? "Clear filters" : "Add Category"}
                    />
                  </td>
                </tr>
              )}
              {loading && Array.from({ length: 6 }).map((_, i) => (
                <SkeletonRow key={i} cols={6} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AddCategoryModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
        mode={modalMode}
        category={selectedCategory}
      />

      <ConfirmDeleteModal 
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Category?"
        message={`Are you sure you want to delete the "${selectedCategory?.name}" category? This will not delete the products within it.`}
        isLoading={deleteLoading}
      />
    </div>
  );
};

export default Categories;
