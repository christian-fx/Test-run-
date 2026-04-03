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
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm">Notifications</span>
                <button className="close-btn" onClick={() => setIsOpen(false)}>
                  <X size={16} />
                </button>
              </div>
              
              <div className="dropdown-tabs mt-3">
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
                  Unread {unreadCount > 0 && `(${unreadCount})`}
                </button>
              </div>
           </div>

           <div className="dropdown-body">
             {filteredNotes.length === 0 ? (
                <div className="empty-state">
                   <div className="icon-circle mb-2">
                     <CheckCircle2 size={24} className="text-muted" />
                   </div>
                   <div className="text-xs text-muted">You're all caught up!</div>
                </div>
             ) : (
                filteredNotes.map(note => (
                  <div 
                    key={note.id} 
                    className={`notification-item ${note.status === 'unread' ? 'unread' : ''}`}
                    onClick={() => note.status === 'unread' && handleMarkRead(note.id)}
                  >
                    <div className="flex gap-3">
                      <div className="icon-wrapper">{getIcon(note.type)}</div>
                      <div className="content">
                        <div className="flex items-center justify-between">
                            <div className="title">{note.title}</div>
                            {note.status === 'unread' && <div className="unread-dot" />}
                        </div>
                        <div className="message">{note.message}</div>
                        <div className="time">{new Date(note.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                    </div>
                  </div>
                ))
             )}
           </div>

           {unreadCount > 0 && (
              <div className="dropdown-footer">
                <button className="read-all-btn" onClick={handleReadAll}>
                  <Check size={14} /> Mark all as read
                </button>
              </div>
           )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
