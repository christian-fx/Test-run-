import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  Eye,
  MousePointer2,
  Layout,
  Loader2,
  AlertCircle,
  Image as ImageIcon
} from 'lucide-react';
import './Promotions.css';
import AddPromotionModal from '../../components/AddPromotionModal';
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal';
import { 
  subscribeToPromotions, 
  deletePromotion, 
  togglePromotionStatus 
} from '../../api/promotions';

const Promotions = () => {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState(null);
  
  // Deletion state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [promoToDelete, setPromoToDelete] = useState(null);
  
  // Tracking status updates per-item to show loading spinners on buttons
  const [updatingStatus, setUpdatingStatus] = useState({});

  useEffect(() => {
    const unsubscribe = subscribeToPromotions((data) => {
      setPromos(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleOpenModal = (promo = null) => {
    setSelectedPromo(promo);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPromo(null);
  };

  // --- Deletion Flow ---
  const triggerDelete = (promo) => {
    setPromoToDelete(promo);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!promoToDelete) return;
    await deletePromotion(promoToDelete.id);
  };

  // --- Toggle Status Flow ---
  const handleToggleStatus = async (id, currentStatus) => {
    setUpdatingStatus(prev => ({ ...prev, [id]: true }));
    try {
      await togglePromotionStatus(id, currentStatus);
    } catch (error) {
      console.error("Toggle status failed:", error);
      alert("Failed to update status. Please try again.");
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div className="promotions-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Promotions & Banners</h1>
          <p>Schedule storefront campaigns and collections.</p>
        </div>
        <div className="page-header-actions">
           <button className="btn btn-primary flex items-center gap-2" onClick={() => handleOpenModal()}>
              <Plus size={16} /> New Campaign
           </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
          <Loader2 className="animate-spin text-primary" size={32} />
          <p className="text-muted font-medium">Synchronizing promotions...</p>
        </div>
      ) : promos.length > 0 ? (
        <div className="campaign-grid">
          {promos.map(promo => (
            <div key={promo.id} className="promo-card">
              <div className="promo-preview">
                {promo.imageUrl ? (
                  <img src={promo.imageUrl} alt={promo.title} />
                ) : (
                  <div className="w-full h-full bg-secondary flex items-center justify-center text-muted">
                    <ImageIcon size={40} opacity={0.3} />
                  </div>
                )}
                <div className="promo-overlay">
                  <span className={`status-badge ${promo.status.toLowerCase()}`}>
                    {promo.status}
                  </span>
                </div>
              </div>
              
              <div className="promo-body">
                <div className="promo-type">
                  <Layout size={10} /> {promo.type}
                </div>
                <h3 className="promo-title">{promo.title}</h3>
                
                <div className="promo-metrics">
                  <div className="p-metric">
                    <Eye size={12} />
                    <span>{promo.impressions?.toLocaleString() || 0}</span>
                  </div>
                  <div className="p-metric">
                    <MousePointer2 size={12} />
                    <span>{promo.clicks?.toLocaleString() || 0}</span>
                  </div>
                </div>
              </div>

              <div className="promo-footer">
                <div className="promo-btns">
                  <button className="p-btn" onClick={() => handleOpenModal(promo)} title="Edit Campaign" disabled={updatingStatus[promo.id]}><Edit3 size={16} /></button>
                  <button className="p-btn delete" onClick={() => triggerDelete(promo)} title="Delete Campaign" disabled={updatingStatus[promo.id]}><Trash2 size={16} /></button>
                  {promo.linkUrl && (
                    <a href={promo.linkUrl} target="_blank" rel="noopener noreferrer" className="p-btn" title="View Destination">
                      <ExternalLink size={16} />
                    </a>
                  )}
                </div>
                {promo.status === 'Running' ? (
                  <button 
                    className="btn btn-secondary btn-sm" 
                    onClick={() => handleToggleStatus(promo.id, promo.status)}
                    disabled={updatingStatus[promo.id]}
                  >
                    {updatingStatus[promo.id] ? <Loader2 className="animate-spin" size={14} /> : 'Pause'}
                  </button>
                ) : (
                  <button 
                    className="btn btn-primary btn-sm" 
                    onClick={() => handleToggleStatus(promo.id, promo.status)}
                    disabled={updatingStatus[promo.id]}
                  >
                    {updatingStatus[promo.id] ? <Loader2 className="animate-spin" size={14} /> : 'Resume'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-20 text-center gap-4 bg-secondary/5 border-2 border-dashed border-border rounded-xl">
           <AlertCircle size={40} className="text-muted" />
           <div className="flex-col gap-1">
              <h3 className="text-lg font-bold">No Active Campaigns</h3>
              <p className="text-muted text-sm">Your storefront banners and spotlight promos will appear here.</p>
           </div>
           <button className="btn btn-outline mt-4" onClick={() => handleOpenModal()}>Create First Promotion</button>
        </div>
      )}

      {/* Add/Edit Promotion Modal */}
      <AddPromotionModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        promotion={selectedPromo}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal 
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Promotion"
        message={`Are you sure you want to delete "${promoToDelete?.title}"? This will remove the banner from your storefront immediately.`}
      />
    </div>
  );
};

export default Promotions;
