import React from 'react';
import { Search, Plus } from 'lucide-react';
import './EmptyState.css';

const EmptyState = (props) => {
  const { 
    title = "No results found", 
    message = "Try adjusting your search or filters to find what you're looking for.",
    action,
    actionLabel = "Clear filters" 
  } = props;

  const IconComponent = props.Icon || Search;

  return (
    <div className={`empty-state-container ${props.variant === 'table' ? 'table-variant' : ''}`}>
      <div className="empty-state-icon">
        <IconComponent size={40} strokeWidth={1.5} />
      </div>
      <div className="empty-state-content">
        <h3 className="empty-state-title">{title}</h3>
        <p className="empty-state-message">{message}</p>
      </div>
      {action && (
        <button className="btn btn-outline empty-state-action" onClick={action}>
          {actionLabel === 'Add Product' ? <Plus size={16} /> : null}
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
