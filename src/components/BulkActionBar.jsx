import React from 'react';
import { X, Trash2, Archive, CheckCircle2 } from 'lucide-react';
import './BulkActionBar.css';

const BulkActionBar = ({ 
  selectedCount = 0, 
  onClear, 
  actions = [] 
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="bulk-action-bar-wrapper">
      <div className="bulk-action-bar">
        <div className="bulk-info">
          <button className="bulk-clear-btn" onClick={onClear}>
            <X size={16} />
          </button>
          <span className="bulk-count">
            <strong>{selectedCount}</strong> item{selectedCount > 1 ? 's' : ''} selected
          </span>
        </div>
        
        <div className="bulk-actions-divider" />
        
        <div className="bulk-actions">
          {actions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <button 
                key={idx}
                className={`bulk-btn ${action.variant || ''}`}
                onClick={action.onClick}
                disabled={action.disabled}
                title={action.label}
              >
                <Icon size={16} />
                <span className="bulk-btn-label">{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BulkActionBar;
