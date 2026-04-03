import React from 'react';
import { X, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import './ConfirmModal.css';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action", 
  message = "Are you sure you want to proceed with this action?",
  confirmLabel = "Confirm",
  type = "primary", // 'primary' or 'destructive'
  isLoading = false
}) => {
  if (!isOpen) return null;

  const isDestructive = type === 'destructive';
  const Icon = isDestructive ? AlertTriangle : CheckCircle2;

  return (
    <div className="confirm-modal-backdrop" onClick={onClose}>
      <div className="confirm-modal" onClick={e => e.stopPropagation()}>
        <div className="confirm-modal-header">
          <div className="confirm-modal-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className={`modal-icon-bg ${type}`}>
              <Icon size={18} />
            </div>
            {title}
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className="confirm-modal-body">
          {message}
        </div>

        <div className="confirm-modal-footer">
          <button 
            className="btn btn-outline" 
            onClick={onClose} 
            disabled={isLoading}
          >
            Cancel
          </button>
          <button 
            className={`btn btn-${type === 'destructive' ? 'destructive' : 'primary'}`} 
            onClick={onConfirm} 
            disabled={isLoading}
          >
            {isLoading ? (
              <><Loader2 className="animate-spin" size={16} /> Processing...</>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
