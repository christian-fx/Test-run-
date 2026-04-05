import React, { useState, useEffect } from 'react';
import { 
  Ticket, 
  Plus, 
  Trash2, 
  Edit3, 
  Calendar, 
  Users, 
  CheckCircle2, 
  XCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  Percent,
  X,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { 
  subscribeToDiscounts, 
  deleteDiscount, 
  toggleDiscountStatus 
} from '../../api/discounts';
import { useCurrency } from '../../hooks/useCurrency';
import { SkeletonStat } from '../../components/Skeleton';
import EmptyState from '../../components/EmptyState';
import AddCouponModal from '../../components/AddCouponModal';
import './Discounts.css';

const Discounts = () => {
  const { formatPrice } = useCurrency();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Modals state
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);


  useEffect(() => {
    const unsubscribe = subscribeToDiscounts((data) => {
      setCoupons(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleOpenModal = (coupon = null) => {
    setSelectedCoupon(coupon);
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!selectedCoupon) return;
    setSaving(true);
    try {
      await deleteDiscount(selectedCoupon.id);
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setSaving(false);
    }
  };

  // Stats calculation
  const activeCount = coupons.filter(c => c.status === 'Active').length;
  const avgDiscount = coupons.length > 0 
    ? Math.round(coupons.reduce((sum, c) => sum + (c.type === 'Percentage' ? Number(c.value) : 0), 0) / coupons.filter(c => c.type === 'Percentage').length || 0)
    : 0;
  const totalUsage = coupons.reduce((sum, c) => sum + (c.usage_count || 0), 0);

  return (
    <div className="discounts-page">
      <div className="page-header">
        <div className="header-content">
          <h1 className="font-bold">Discounts & Coupons</h1>
          <p className="text-muted">Manage offers, sales, and loyalty rewards.</p>
        </div>
        <div className="page-header-actions">
           <button className="btn btn-primary flex items-center gap-2" onClick={() => handleOpenModal()}>
              <Plus size={16} /> New Coupon
           </button>
        </div>
      </div>

      <div className="stats-row">
         <div className="marketing-stat">
            <div className="m-stat-top">
               <TrendingUp size={16} className="text-success" />
               <span className="m-stat-label">Total Usage</span>
            </div>
            <div className="m-stat-value">{loading ? <SkeletonStat /> : totalUsage}</div>
         </div>
         <div className="marketing-stat">
            <div className="m-stat-top">
               <Users size={16} className="text-primary" />
               <span className="m-stat-label">Active Offers</span>
            </div>
            <div className="m-stat-value">{loading ? <SkeletonStat /> : activeCount}</div>
         </div>
         <div className="marketing-stat">
            <div className="m-stat-top">
               <Percent size={16} style={{ color: 'var(--purple-500)' }} />
               <span className="m-stat-label">Avg. Percentage</span>
            </div>
            <div className="m-stat-value">{loading ? <SkeletonStat /> : `${avgDiscount}%`}</div>
         </div>
      </div>

      {loading ? (
        <div className="coupon-grid">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="skeleton-card" style={{ height: '300px', borderRadius: 'var(--radius-xl)' }}></div>
          ))}
        </div>
      ) : coupons.length === 0 ? (
        <EmptyState 
          Icon={Ticket}
          title="No coupons yet"
          message="Create your first discount campaign to boost conversions."
          action={() => handleOpenModal()}
          actionLabel="Create Coupon"
        />
      ) : (
        <div className="coupon-grid">
           {coupons.map(coupon => (
              <div key={coupon.id} className={`coupon-card ${coupon.status.toLowerCase()}`}>
                 <div className="coupon-glow"></div>
                 <div className="coupon-top">
                    <div className="coupon-icon">
                       <Ticket size={24} />
                    </div>
                    <button 
                      className={`status-tag-toggle ${coupon.status.toLowerCase()}`}
                      onClick={() => toggleDiscountStatus(coupon.id, coupon.status)}
                    >
                      {coupon.status === 'Scheduled' ? (
                        <span className="flex items-center gap-1"><Clock size={10} /> Scheduled</span>
                      ) : coupon.status}
                    </button>
                 </div>
                 
                 <div className="coupon-info">
                    <div className="coupon-code">{coupon.code}</div>
                    <div className="coupon-value">
                      {coupon.type === 'Percentage' ? `${coupon.value}%` : 
                       coupon.type === 'Fixed Amount' ? formatPrice(coupon.value) : 'Free Sales'} OFF
                    </div>
                    <div className="coupon-type">{coupon.type}</div>
                 </div>
  
                 <div className="coupon-metrics">
                    <div className="metric">
                       <div className="metric-label">Usage</div>
                       <div className="metric-value">{coupon.usage_count} / {coupon.usage_limit || '∞'}</div>
                    </div>
                    <div className="metric">
                       <div className="metric-label">{coupon.status === 'Scheduled' ? 'Starts' : 'Expires'}</div>
                       <div className="metric-value">
                         {coupon.status === 'Scheduled' 
                           ? (coupon.start_date ? new Date(coupon.start_date).toLocaleDateString() : 'TBD')
                           : (coupon.expiry_date ? new Date(coupon.expiry_date).toLocaleDateString() : 'Never')}
                       </div>
                    </div>
                 </div>
  
                 <div className="coupon-actions">
                    <button className="btn-edit-c" onClick={() => handleOpenModal(coupon)}>
                      <Edit3 size={16} />
                    </button>
                    <button className="btn-delete-c" onClick={() => { setSelectedCoupon(coupon); setShowDeleteModal(true); }}>
                      <Trash2 size={16} />
                    </button>
                    <button className="btn-details-c" onClick={() => { setSelectedCoupon(coupon); setShowResultsModal(true); }}>
                       View Results <ArrowRight size={14} />
                    </button>
                 </div>
              </div>
           ))}
        </div>
      )}

      {/* New/Edit Modal (Refactored) */}
      <AddCouponModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
        coupon={selectedCoupon}
      />

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="modal-backdrop" onClick={() => setShowDeleteModal(false)}>
          <div className="modal" style={{ maxWidth: '450px' }} onClick={e => e.stopPropagation()}>
             <div className="modal-body text-center" style={{ padding: '40px 24px' }}>
                <div className="warning-icon bg-destructive/10 text-destructive" style={{ 
                  width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px'
                }}>
                   <AlertTriangle size={32} />
                </div>
                <h3 className="modal-title" style={{ fontSize: '20px', textAlign: 'center', marginBottom: '8px' }}>Delete Campaign?</h3>
                <p className="text-muted text-sm px-4">
                  Are you sure you want to delete <span className="font-bold text-foreground">"{selectedCoupon?.code}"</span>? 
                  This action cannot be undone and will immediately disable the code for customers.
                </p>
                <div className="flex gap-3 mt-8">
                   <button className="btn btn-outline flex-1" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                   <button className="btn btn-primary flex-1 bg-destructive" style={{ borderColor: 'transparent' }} onClick={handleDelete} disabled={saving}>
                      {saving ? 'Deleting...' : 'Confirm Delete'}
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Results Modal */}
      {showResultsModal && (
        <div className="modal-backdrop" onClick={() => setShowResultsModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Campaign Performance: {selectedCoupon?.code}</div>
              <div className="modal-close" onClick={() => setShowResultsModal(false)}><X size={20} /></div>
            </div>
            <div className="modal-body">
               <div className="results-stats">
                  <div className="r-stat">
                    <div className="r-label">Total Redemptions</div>
                    <div className="r-value">{selectedCoupon?.usage_count}</div>
                  </div>
                  <div className="r-stat">
                    <div className="r-label">Usage Rate</div>
                    <div className="r-value">
                      {selectedCoupon?.usage_limit ? 
                        `${Math.round((selectedCoupon.usage_count / selectedCoupon.usage_limit) * 100)}%` : 
                        'N/A'}
                    </div>
                  </div>
                  <div className="r-stat">
                    <div className="r-label">Status</div>
                    <div className={`r-status ${selectedCoupon?.status.toLowerCase()}`}>
                       {selectedCoupon?.status}
                    </div>
                  </div>
               </div>
               
               <div className="results-chart-placeholder">
                  <div className="placeholder-content">
                     <TrendingUp size={32} className="text-primary mb-2" />
                     <p className="font-medium">Voucher Engagement</p>
                     <p className="text-xs text-muted">Analysis of conversion lift using this coupon code.</p>
                  </div>
               </div>
            </div>
            <div className="modal-footer">
               <button className="btn btn-primary w-full" onClick={() => setShowResultsModal(false)}>Close Analysis</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Discounts;
