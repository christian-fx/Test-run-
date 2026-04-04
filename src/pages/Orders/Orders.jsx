import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Search, 
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Eye,
  Truck,
  FileText,
  Trash2
} from 'lucide-react';
import './Orders.css';
import { useToast } from '../../components/useToast';
import { SkeletonRow } from '../../components/Skeleton';

// API
import { subscribeToOrders, deleteOrder, updateOrder } from '../../api/orders';

// Components
import OrderManagementModal from '../../components/OrderManagementModal';
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal';
import ActionMenu from '../../components/ActionMenu';

const ITEMS_PER_PAGE = 10;

const Orders = () => {
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const unsubscribe = subscribeToOrders((data) => {
      setOrders(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const handleDeleteClick = (order) => {
    setSelectedOrder(order);
    setShowDeleteModal(true);
  };

  const filteredOrders = orders
    .filter(order => {
      const matchesSearch = 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (order.customer?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const dateA = new Date(a.order_date || a.orderDate || 0);
      const dateB = new Date(b.order_date || b.orderDate || 0);
      if (sortBy === 'newest') return dateB - dateA;
      if (sortBy === 'oldest') return dateA - dateB;
      if (sortBy === 'total_high') return (Number(b.total_amount) || 0) - (Number(a.total_amount) || 0);
      return 0;
    });

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleMarkShipped = async (order) => {
    try {
      await updateOrder(order.id, { status: 'Shipped' });
      toast(`Order shipped successfully.`);
    } catch {
      toast('Failed to update order status.', 'error');
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteOrder(selectedOrder.id);
      setShowDeleteModal(false);
      toast('Order cancelled and deleted.');
      setSelectedOrder(null);
    } catch {
      toast('Failed to delete order.', 'error');
    }
  };

  return (
    <div className="orders-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold" style={{ fontSize: '24px' }}>Orders</h1>
          <p className="text-muted">Manage your store's orders, fulfillment, and revenue in real-time.</p>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-outline" onClick={() => {
            const csv = ['Order ID,Customer,Date,Status,Total', ...orders.map(o => 
              `"${o.id}","${o.customer_name || ''}","${o.order_date}","${o.status}",${o.total_amount || 0}`
            )].join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
            a.download = 'orders.csv'; a.click();
            toast('Orders exported as CSV.');
          }}>
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-title">Total Orders</div>
            <div className="stat-icon"><ShoppingBag size={18} /></div>
          </div>
          <div className="stat-value">{loading ? '...' : orders.length}</div>
          <div className="text-sm text-muted" style={{ marginTop: '8px' }}>
            All-time volume
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-title">Pending Fulfillment</div>
            <div className="stat-icon"><Clock size={18} /></div>
          </div>
          <div className="stat-value">{loading ? '...' : orders.filter(o => o.status === 'Processing' || o.status === 'Pending').length}</div>
          <div className="text-sm text-muted" style={{ marginTop: '8px' }}>
            Requires action
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-title">Completed Orders</div>
            <div className="stat-icon"><CheckCircle2 size={18} /></div>
          </div>
          <div className="stat-value">{loading ? '...' : orders.filter(o => o.status === 'Delivered').length}</div>
          <div className="text-sm text-muted" style={{ marginTop: '8px' }}>
            High fulfillment rate
          </div>
        </div>
      </div>

      <div className="filters-bar">
        <div className="filters-left">
          <div className="filter-input-wrapper search">
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Search orders by ID or customer..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <div className="filter-select">
            <label>Status:</label>
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}>
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <ChevronDown className="chevron-icon" size={14} />
          </div>
        </div>
        <div className="filter-select" style={{ minWidth: '160px' }}>
          <label>Sort:</label>
          <select value={sortBy} onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="total_high">Total: High to Low</option>
          </select>
          <ChevronDown className="chevron-icon" size={14} />
        </div>
      </div>

      <div className="panel">
        <div style={{ overflowX: 'auto' }}>
          <table className="table-w">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>#</th>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Status</th>
                <th>Total</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {!loading && paginatedOrders.map((order, idx) => (
                <tr key={order.id}>
                  <td className="text-muted text-xs">{(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}</td>
                  <td className="font-medium">{order.id}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="customer-avatar-placeholder" style={{ 
                        width: '24px', 
                        height: '24px', 
                        borderRadius: '50%', 
                        background: 'var(--secondary)',
                        overflow: 'hidden'
                      }}>
                        {order.customer?.avatar ? (
                          <img src={order.customer.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <Users size={12} color="var(--muted-foreground)" style={{ margin: '6px' }} />
                        )}
                      </div>
                      {order.customer?.name || 'Guest Customer'}
                    </div>
                  </td>
                  <td className="text-muted">
                    {new Date(order.order_date || order.orderDate).toLocaleDateString()}
                  </td>
                  <td>
                    <span className={`badge badge-${
                      order.status?.toLowerCase() === 'delivered' ? 'success' : 
                      order.status?.toLowerCase() === 'processing' ? 'warning' : 'secondary'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="font-medium">₦{Number(order.total_amount || 0).toLocaleString()}</td>
                  <td style={{ textAlign: 'right' }}>
                    <ActionMenu 
                      options={[
                        { label: 'View Details', icon: Eye, onClick: () => handleViewDetails(order) },
                        { label: 'Mark as Shipped', icon: Truck, onClick: () => handleMarkShipped(order) },
                        { label: 'Print Invoice', icon: FileText, onClick: () => toast('Invoice generation coming soon.', 'info') },
                        { label: 'Cancel Order', icon: Trash2, destructive: true, onClick: () => handleDeleteClick(order) }
                      ]}
                    />
                  </td>
                </tr>
              ))}
              {!loading && filteredOrders.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '64px', color: 'var(--muted-foreground)' }}>
                    <div className="flex flex-col items-center gap-2">
                       <ShoppingBag size={32} opacity={0.2} />
                       <div style={{ fontSize: '16px', fontWeight: 500, color: 'var(--foreground)' }}>
                         No {statusFilter === 'All' ? '' : statusFilter.toLowerCase()} orders found
                       </div>
                       <p className="text-sm">Try adjusting your search or filters.</p>
                    </div>
                  </td>
                </tr>
              )}
              {loading && Array.from({ length: 6 }).map((_, i) => (
                <SkeletonRow key={i} cols={7} />
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between" style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
            <div className="text-xs text-muted">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredOrders.length)} of {filteredOrders.length}
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
      <OrderManagementModal 
        isOpen={showOrderModal} 
        onClose={() => setShowOrderModal(false)}
        order={selectedOrder}
      />

      <ConfirmDeleteModal 
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Cancel Order?"
        message={`Are you sure you want to cancel and delete order "${selectedOrder?.id}"? This action cannot be undone.`}
        confirmLabel="Cancel Order"
      />
    </div>
  );
};

export default Orders;
