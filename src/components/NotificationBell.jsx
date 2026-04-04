import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, Check, X, ShieldAlert, ShoppingCart, Package, Info, CheckCircle2 } from 'lucide-react';
import { getNotifications, markAsRead, markAllAsRead, subscribeToNotifications } from '../api/notifications';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'unread'
  
  const dropdownRef = useRef(null);

  const fetchNotes = useCallback(async () => {
    try {
      const data = await getNotifications(20);
      setNotifications(data);
      setUnreadCount(data.filter(n => n.status === 'unread').length);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToNotifications((data) => {
      setNotifications(data);
      setUnreadCount(data.filter(n => n.status === 'unread').length);
    });
    return () => unsubscribe();
  }, []);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleMarkRead = async (id) => {
    await markAsRead(id);
    fetchNotes();
  };

  const handleReadAll = async () => {
    await markAllAsRead();
    fetchNotes();
  };

  const getIcon = (type) => {
    switch (type) {
      case 'order': return <ShoppingCart size={14} className="text-indigo-500" />;
      case 'stock': return <Package size={14} className="text-amber-500" />;
      case 'warning': return <ShieldAlert size={14} className="text-rose-500" />;
      default: return <Info size={14} className="text-slate-400" />;
    }
  };

  const filteredNotes = activeTab === 'all' 
    ? notifications 
    : notifications.filter(n => n.status === 'unread');

  return (
    <div className="relative" ref={dropdownRef}>
      <button className="icon-btn relative" onClick={() => setIsOpen(!isOpen)}>
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="notification-badge pointer-events-none">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
           <div className="dropdown-header">
              <div className="flex items-center justify-between mb-4">
                <span className="dropdown-title">Notifications</span>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button className="mark-all-read-btn" onClick={handleReadAll}>
                      <Check size={14} /> Mark all read
                    </button>
                  )}
                  <button className="close-btn" onClick={() => setIsOpen(false)}>
                    <X size={18} />
                  </button>
                </div>
              </div>
              
              <div className="dropdown-tabs">
                <button 
                  className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`} 
                  onClick={() => setActiveTab('all')}
                >
                  All
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'unread' ? 'active' : ''}`} 
                  onClick={() => setActiveTab('unread')}
                >
                  Unread {unreadCount > 0 && <span className="tab-count">{unreadCount}</span>}
                </button>
              </div>
           </div>

           <div className="dropdown-body">
             {filteredNotes.length === 0 ? (
                <div className="notes-empty">
                   <div className="empty-icon">
                     <CheckCircle2 size={32} />
                   </div>
                   <p>All caught up!</p>
                   <span>No new notifications at this time.</span>
                </div>
             ) : (
                filteredNotes.map(note => (
                  <div 
                    key={note.id} 
                    className={`notification-item ${note.status === 'unread' ? 'unread' : ''}`}
                    onClick={() => note.status === 'unread' && handleMarkRead(note.id)}
                  >
                    <div className="notification-inner">
                      <div className={`notification-icon-box ${note.type}`}>
                        {getIcon(note.type)}
                      </div>
                      <div className="notification-content">
                        <div className="notification-top">
                            <span className="notification-label">{note.title}</span>
                            <span className="notification-time">
                              {new Date(note.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                        <div className="notification-message">{note.message}</div>
                        {note.status === 'unread' && <div className="unread-indicator" />}
                      </div>
                    </div>
                  </div>
                ))
             )}
           </div>

           <div className="dropdown-footer">
             <button className="view-all-btn">
               View all activity
             </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
