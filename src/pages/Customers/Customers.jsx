import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Search, 
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Users,
  UserPlus,
  UserCheck,
  Eye,
  Mail,
  Trash2,
  Ban
} from 'lucide-react';
import './Customers.css';
import { useToast } from '../../components/useToast';

// API
import { subscribeToCustomers, deleteCustomer, updateCustomer } from '../../api/customers';

// Components
import CustomerDetailsModal from '../../components/CustomerDetailsModal';
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal';
import ActionMenu from '../../components/ActionMenu';

const ITEMS_PER_PAGE = 10;

const Customers = () => {
  const toast = useToast();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const unsubscribe = subscribeToCustomers((data) => {
      setCustomers(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleViewProfile = (customer) => {
    setSelectedCustomer(customer);
    setShowCustomerModal(true);
  };

  const handleDeleteClick = (customer) => {
    setSelectedCustomer(customer);
    setShowDeleteModal(true);
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      (customer.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
      (customer.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.phone || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || (customer.status || 'Active') === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE);
  const paginatedCustomers = filteredCustomers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Reset page on filter change
  const handleSearchChange = (e) => { setSearchTerm(e.target.value); setCurrentPage(1); };
  const handleStatusChange = (e) => { setStatusFilter(e.target.value); setCurrentPage(1); };

  const handleSuspend = async (customer) => {
    try {
      await updateCustomer(customer.id, { status: 'Suspended' });
      toast(`${customer.name} has been suspended.`);
    } catch {
      toast('Failed to suspend account.', 'error');
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteCustomer(selectedCustomer.id);
      setShowDeleteModal(false);
      toast(`"${selectedCustomer.name}" deleted.`);
      setSelectedCustomer(null);
    } catch {
      toast('Failed to delete customer.', 'error');
    }
  };

  return (
    <div className="customers-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold" style={{ fontSize: '24px' }}>Customers</h1>
          <p className="text-muted">Manage your customer database and viewing profiles in real-time.</p>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-outline" onClick={() => {
            const csv = ['Name,Email,Phone,Orders,Spent,Status', ...customers.map(c => 
              `"${c.name}","${c.email}","${c.phone || ''}",${c.total_orders || 0},${c.total_spent || 0},"${c.status || 'Active'}"`
            )].join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
            a.download = 'customers.csv'; a.click();
            toast('Customers exported as CSV.');
          }}>
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-title">Total Customers</div>
            <div className="stat-icon"><Users size={18} /></div>
          </div>
          <div className="stat-value">{loading ? '...' : customers.length}</div>
          <div className="text-sm text-muted" style={{ marginTop: '8px' }}>
            All platforms combined
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-title">Active Now</div>
            <div className="stat-icon"><UserCheck size={18} /></div>
          </div>
          <div className="stat-value">{loading ? '...' : 0}</div>
          <div className="text-sm text-muted" style={{ marginTop: '8px' }}>
            Real-time tracking
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-title">New Signups</div>
            <div className="stat-icon"><UserPlus size={18} /></div>
          </div>
          <div className="stat-value">{loading ? '...' : customers.length}</div>
          <div className="text-sm text-muted" style={{ marginTop: '8px' }}>
            Lifetime members
          </div>
        </div>
      </div>

      <div className="filters-bar">
        <div className="filters-left">
          <div className="filter-input-wrapper search">
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Search by name, email, or phone..." 
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <div className="filter-select">
            <label>Status:</label>
            <select value={statusFilter} onChange={handleStatusChange}>
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Suspended">Suspended</option>
            </select>
            <ChevronDown className="chevron-icon" size={14} />
          </div>
        </div>
      </div>

      <div className="panel">
        <div style={{ overflowX: 'auto' }}>
          <table className="table-w">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>#</th>
                <th>Customer</th>
                <th>Orders</th>
                <th>Spent</th>
                <th>Status</th>
                <th>Last Login</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {!loading && paginatedCustomers.map((customer, idx) => (
                <tr key={customer.id}>
                  <td className="text-muted text-xs">{(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}</td>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="customer-avatar-placeholder" style={{ 
                        width: '32px', 
                        height: '32px', 
                        borderRadius: '50%', 
                        background: 'var(--secondary)',
                        overflow: 'hidden'
                      }}>
                        {customer.avatar ? (
                          <img src={customer.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <Users size={16} color="var(--muted-foreground)" style={{ margin: '8px' }} />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-xs text-muted">{customer.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{customer.total_orders || 0}</td>
                  <td className="font-medium">₦{Number(customer.total_spent || 0).toLocaleString()}</td>
                  <td>
                    <span className={`badge badge-${customer.status?.toLowerCase() === 'active' ? 'success' : 'secondary'}`}>
                      {customer.status || 'Active'}
                    </span>
                  </td>
                  <td className="text-muted">N/A</td>
                  <td style={{ textAlign: 'right' }}>
                    <ActionMenu 
                      options={[
                        { label: 'View Profile', icon: Eye, onClick: () => handleViewProfile(customer) },
                        { label: 'Send Message', icon: Mail, onClick: () => toast('Email integration coming soon.', 'info') },
                        { label: 'Suspend Account', icon: Ban, onClick: () => handleSuspend(customer) },
                        { label: 'Delete Customer', icon: Trash2, destructive: true, onClick: () => handleDeleteClick(customer) }
                      ]}
                    />
                  </td>
                </tr>
              ))}
              {!loading && filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '64px', color: 'var(--muted-foreground)' }}>
                    <div className="flex flex-col items-center gap-2">
                       <Users size={32} opacity={0.2} />
                       <div style={{ fontSize: '16px', fontWeight: 500, color: 'var(--foreground)' }}>
                         No {statusFilter === 'All' ? '' : statusFilter.toLowerCase()} customers found
                       </div>
                       <p className="text-sm">Try adjusting your search or filters.</p>
                    </div>
                  </td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '48px' }}>
                    Loading customers...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between" style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
            <div className="text-xs text-muted">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredCustomers.length)} of {filteredCustomers.length}
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
      <CustomerDetailsModal 
        isOpen={showCustomerModal} 
        onClose={() => setShowCustomerModal(false)}
        customer={selectedCustomer}
      />

      <ConfirmDeleteModal 
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Customer?"
        message={`Are you sure you want to delete "${selectedCustomer?.name}"? All associated local data will be removed. This action cannot be undone.`}
      />
    </div>
  );
};

export default Customers;
