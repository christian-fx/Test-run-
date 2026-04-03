import React from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import './ConfirmDeleteModal.css';

const ConfirmDeleteModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Deletion", 
  message = "Are you sure you want to delete this item? This action cannot be undone.",
  confirmLabel = "Delete",
  isLoading = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="confirm-modal-backdrop" onClick={onClose}>
      <div className="confirm-modal" onClick={e => e.stopPropagation()}>
        <div className="confirm-modal-header">
          <div className="confirm-modal-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={20} color="var(--destructive)" />
            {title}
          </div>
          <button className="modal-close" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>
        <div className="confirm-modal-body">
          {message}
        </div>
        <div className="confirm-modal-footer">
          <button className="btn btn-outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </button>
          <button className="btn btn-confirm" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? <><Loader2 className="animate-spin" size={16} /> Deleting...</> : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
