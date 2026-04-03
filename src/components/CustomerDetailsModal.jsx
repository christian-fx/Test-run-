import React from 'react';
import { 
  X, 
  Mail, 
  Phone, 
  Check, 
  Trash2, 
  UserX, 
  UserCheck, 
  MessageSquare, 
  Pencil,
  Users
} from 'lucide-react';
import './CustomerDetailsModal.css';

const CustomerDetailsModal = ({ isOpen, onClose, customer }) => {
  if (!isOpen || !customer) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title">Customer Profile</div>
          <div className="modal-close" onClick={onClose}>
            <X size={20} />
          </div>
        </div>

        {/* Body */}
        <div className="modal-body">
          
          {/* Basic Info */}
          <div className="section">
            <div className="section-panel" style={{ display: 'flex', flexDirection: 'row', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
               <img src={customer.avatar || 'https://storage.googleapis.com/banani-avatars/avatar%2Ffemale%2F25-35%2FNorth%20American%2F3'} alt="Avatar" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)' }} />
               <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minWidth: '200px' }}>
                   <div style={{ fontSize: '20px', fontWeight: 600, color: 'var(--foreground)' }}>{customer.name}</div>
                   <div style={{ display: 'flex', gap: '16px', color: 'var(--muted-foreground)', fontSize: '14px', flexWrap: 'wrap' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                           <Mail size={16} />
                           {customer.email}
                       </div>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                           <Phone size={16} />
                           {customer.phone || 'No phone provided'}
                       </div>
                   </div>
               </div>
               <div>
                   <span className={`badge badge-${customer.status?.toLowerCase() === 'active' ? 'success' : 'secondary'}`}>
                     {customer.status || 'Active Member'}
                   </span>
               </div>
            </div>
          </div>

          {/* Stats */}
          <div className="section">
            <div className="section-header">
              <div className="section-title">Customer Statistics</div>
            </div>
            <div className="section-panel">
              <div className="details-grid-custom">
                <div className="detail-group">
                  <div className="detail-label">Total Orders</div>
                  <div className="detail-value" style={{ fontSize: '24px' }}>{customer.orders || 0}</div>
                </div>
                <div className="detail-group">
                  <div className="detail-label">Total Spent</div>
                  <div className="detail-value" style={{ fontSize: '24px', color: 'var(--primary)' }}>{customer.spent || '$0.00'}</div>
                </div>
                <div className="detail-group">
                  <div className="detail-label">Avg. Order Value</div>
                  <div className="detail-value" style={{ fontSize: '24px' }}>$0.00</div>
                </div>
                <div className="detail-group">
                  <div className="detail-label">Member Since</div>
                  <div className="detail-value" style={{ fontSize: '24px' }}>{customer.memberSince || 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Orders Table */}
          <div className="section">
            <div className="section-header">
              <div className="section-title">Recent Orders</div>
              <div style={{ color: 'var(--primary)', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}>View all</div>
            </div>
            <div className="section-panel" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Items</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customer.recentOrders && customer.recentOrders.length > 0 ? customer.recentOrders.map((o, idx) => (
                      <tr key={idx}>
                        <td><span style={{ color: 'var(--primary)', fontWeight: 500 }}>{o.id}</span></td>
                        <td>{o.date}</td>
                        <td><span className={`badge badge-${o.status?.toLowerCase() === 'delivered' ? 'success' : 'warning'}`}>{o.status}</span></td>
                        <td>{o.items}</td>
                        <td style={{ fontWeight: 500 }}>{o.total}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: 'var(--muted-foreground)' }}>No recent orders.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Addresses */}
          <div className="section">
            <div className="section-header">
              <div className="section-title">Saved Addresses</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              <div className="section-panel" style={{ height: '100%' }}>
                  <div style={{ fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--foreground)' }}>
                    <Check size={18} color="var(--muted-foreground)" />
                    Default Shipping
                  </div>
                  <div style={{ color: 'var(--muted-foreground)', lineHeight: 1.6, fontSize: '14px' }}>
                    {customer.shippingAddress || 'No shipping address saved.'}
                  </div>
              </div>
              <div className="section-panel" style={{ height: '100%' }}>
                  <div style={{ fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--foreground)' }}>
                    <Check size={18} color="var(--muted-foreground)" />
                    Default Billing
                  </div>
                  <div style={{ color: 'var(--muted-foreground)', lineHeight: 1.6, fontSize: '14px' }}>
                    {customer.billingAddress || 'No billing address saved.'}
                  </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="modal-footer">
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div className="btn btn-outline" style={{ color: 'var(--destructive)', borderColor: 'rgb(255 0 0 / 0.3)' }} onClick={() => console.log('Suspend', customer.id)}>
              <UserX size={16} />
              Suspend Account
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <div className="btn btn-subtle" onClick={() => console.log('Mail', customer.id)}>
              <Mail size={16} />
              Send Email
            </div>
            <div className="btn btn-subtle" onClick={() => console.log('Message', customer.id)}>
              <MessageSquare size={16} />
              Send Message
            </div>
            <div className="btn btn-primary" onClick={() => console.log('Edit', customer.id)}>
              <Pencil size={16} />
              Edit Profile
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CustomerDetailsModal;
