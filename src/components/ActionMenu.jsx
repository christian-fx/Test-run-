import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { createPortal } from 'react-dom';
import './ActionMenu.css';

const ActionMenu = ({ options, icon }) => {
  const MenuIcon = icon || MoreHorizontal;
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const [orientation, setOrientation] = useState('down'); // 'down' or 'up'
  const menuRef = useRef(null);
  const dropdownRef = useRef(null);

  const toggleMenu = (e) => {
    e.stopPropagation();
    
    // Get button coordinates for fixed positioning
    const buttonRect = e.currentTarget.getBoundingClientRect();
    const dropdownHeight = 220; // Estimated
    const spaceBelow = window.innerHeight - buttonRect.bottom;
    
    setCoords({
      top: buttonRect.top,
      left: buttonRect.left,
      width: buttonRect.width,
      bottom: buttonRect.bottom
    });

    if (spaceBelow < dropdownHeight) {
      setOrientation('up');
    } else {
      setOrientation('down');
    }
    
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside both the button and the portal dropdown
      const isOutsideButton = menuRef.current && !menuRef.current.contains(event.target);
      const isOutsideDropdown = dropdownRef.current && !dropdownRef.current.contains(event.target);
      
      if (isOutsideButton && isOutsideDropdown) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleOptionClick = (option, e) => {
    e.stopPropagation();
    if (option.onClick) {
      option.onClick();
    }
    setIsOpen(false);
  };

  return (
    <div className="action-menu-container" ref={menuRef}>
      <button 
        className={`btn btn-outline btn-icon ${isOpen ? 'active' : ''}`}
        onClick={toggleMenu}
      >
        <MenuIcon size={16} />
      </button>

      {isOpen && createPortal(
        <div 
          ref={dropdownRef}
          className={`action-menu-dropdown ${orientation}`}
          style={{
            position: 'fixed',
            top: orientation === 'down' ? coords.bottom + 8 : 'auto',
            bottom: orientation === 'up' ? (window.innerHeight - coords.top) + 8 : 'auto',
            left: coords.left + coords.width - 180, // Align right with button
            width: '180px'
          }}
        >
          {options.map((option, idx) => (
            <button
              key={idx}
              className={`action-menu-item ${option.destructive ? 'destructive' : ''}`}
              onClick={(e) => handleOptionClick(option, e)}
            >
              {option.icon && <option.icon size={16} />}
              {option.label}
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
};

export default ActionMenu;
