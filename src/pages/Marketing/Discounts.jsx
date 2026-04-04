import React, { useState } from 'react';
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
  Percent
} from 'lucide-react';
import './Discounts.css';

const MOCK_COUPONS = [
  { id: '1', code: 'WELCOME25', type: 'Percentage', value: '25%', usage: '142/500', expiry: '2024-12-31', status: 'Active' },
  { id: '2', code: 'BLACKFRIDAY', type: 'Fixed Amount', value: '₦10,000', usage: '890/1000', expiry: '2024-11-30', status: 'Expired' },
  { id: '3', code: 'GADGETLOVER', type: 'Free Shipping', value: 'N/A', usage: '56/Unlimited', expiry: '2024-06-15', status: 'Scheduled' },
];

const Discounts = () => {
  const [coupons] = useState(MOCK_COUPONS);

  return (
    <div className="discounts-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Discounts & Coupons</h1>
          <p>Manage offers, sales, and loyalty rewards.</p>
        </div>
        <div className="page-header-actions">
           <button className="btn btn-primary flex items-center gap-2">
              <Plus size={16} /> New Coupon
           </button>
        </div>
      </div>

      <div className="stats-row">
         <div className="marketing-stat">
            <div className="m-stat-top">
               <TrendingUp size={16} className="text-success" />
               <span className="m-stat-label">Conv. Lift</span>
            </div>
            <div className="m-stat-value">+18%</div>
         </div>
         <div className="marketing-stat">
            <div className="m-stat-top">
               <Users size={16} className="text-primary" />
               <span className="m-stat-label">Active Users</span>
            </div>
            <div className="m-stat-value">1.2K</div>
         </div>
         <div className="marketing-stat">
            <div className="m-stat-top">
               <Percent size={16} style={{ color: 'var(--purple-500)' }} />
               <span className="m-stat-label">Avg. Discount</span>
            </div>
            <div className="m-stat-value">12%</div>
         </div>
      </div>

      <div className="coupon-grid">
         {coupons.map(coupon => (
            <div key={coupon.id} className={`coupon-card ${coupon.status.toLowerCase()}`}>
               <div className="coupon-glow"></div>
               <div className="coupon-top">
                  <div className="coupon-icon">
                     <Ticket size={24} />
                  </div>
                  <span className={`status-tag ${coupon.status.toLowerCase()}`}>{coupon.status}</span>
               </div>
               
               <div className="coupon-info">
                  <div className="coupon-code">{coupon.code}</div>
                  <div className="coupon-value">{coupon.value} OFF</div>
                  <div className="coupon-type">{coupon.type}</div>
               </div>

               <div className="coupon-metrics">
                  <div className="metric">
                     <div className="metric-label">Usage</div>
                     <div className="metric-value">{coupon.usage}</div>
                  </div>
                  <div className="metric">
                     <div className="metric-label">Expires</div>
                     <div className="metric-value">{coupon.expiry}</div>
                  </div>
               </div>

               <div className="coupon-actions">
                  <button className="btn-edit-c"><Edit3 size={16} /></button>
                  <button className="btn-delete-c"><Trash2 size={16} /></button>
                  <button className="btn-details-c">
                     View Results <ArrowRight size={14} />
                  </button>
               </div>
            </div>
         ))}
      </div>
    </div>
  );
};

export default Discounts;
