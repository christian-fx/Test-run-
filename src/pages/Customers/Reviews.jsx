import React, { useState } from 'react';
import { 
  Star, 
  MessageSquare, 
  User, 
  Filter, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Flag,
  MoreVertical,
  ArrowUpRight,
  ThumbsUp,
  Clock
} from 'lucide-react';
import './Reviews.css';

const MOCK_REVIEWS = [
  { id: '1', customer: 'Babatunde O.', rating: 5, date: '2024-03-20', product: 'iPhone 15 Pro Max', comment: 'Absolutely stunning camera and performance. The battery life is a game changer!', status: 'Approved' },
  { id: '2', customer: 'Chidubem A.', rating: 4, date: '2024-03-19', product: 'MacBook Air M3', comment: 'Super fast and light. I wish it had more ports but overall great.', status: 'Approved' },
  { id: '3', customer: 'Sarah W.', rating: 1, date: '2024-03-18', product: 'USB-C Cable (2m)', comment: 'The cable stopped charging after 2 days. Very disappointed with the quality.', status: 'Pending' },
  { id: '4', customer: 'David K.', rating: 5, date: '2024-03-15', product: 'AirPods Pro 2', comment: 'Best noise cancellation I have ever used. Highly recommended!', status: 'Approved' },
  { id: '5', customer: 'Gift E.', rating: 2, date: '2024-03-12', product: 'Samsung S24 Ultra', comment: 'The screen color looks a bit washed out compared to my older model.', status: 'Flagged' },
];

const Reviews = () => {
  const [reviews] = useState(MOCK_REVIEWS);
  const [filter, setFilter] = useState('All');

  const filteredReviews = reviews.filter(r => filter === 'All' || r.status === filter);

  return (
    <div className="reviews-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Customer Reviews</h1>
          <p>Moderate feedback and build community trust.</p>
        </div>
        <div className="page-header-actions">
           <div className="review-stats-mini">
              <div className="mini-stat">
                 <Star size={12} className="fill-amber-500 text-amber-500" />
                 <span>4.8 Rating</span>
              </div>
           </div>
        </div>
      </div>

      <div className="reviews-toolbar">
         <div className="tab-pills">
            {['All', 'Approved', 'Pending', 'Flagged'].map(t => (
               <button 
                 key={t}
                 className={`pill ${filter === t ? 'active' : ''}`}
                 onClick={() => setFilter(t)}
               >{t}</button>
            ))}
         </div>
         <div className="search-box">
            <Search size={16} />
            <input type="text" placeholder="Search reviews..." />
         </div>
      </div>

      <div className="reviews-list">
         {filteredReviews.map(review => (
            <div key={review.id} className="review-card">
               <div className="review-side">
                  <div className="customer-avatar">
                     <User size={20} />
                  </div>
                  <div className="status-indicator">
                     {review.status === 'Approved' && <CheckCircle2 size={16} className="text-success" />}
                     {review.status === 'Pending' && <Clock size={16} className="text-amber-500" />}
                     {review.status === 'Flagged' && <Flag size={16} className="text-destructive" />}
                  </div>
               </div>
               <div className="review-main">
                  <div className="review-header">
                     <div className="customer-info">
                        <div className="customer-name">{review.customer}</div>
                        <div className="review-meta">
                           Purchased <span className="product-link">{review.product}</span> • {review.date}
                        </div>
                     </div>
                     <div className="rating-stars">
                        {[...Array(5)].map((_, i) => (
                           <Star 
                             key={i} 
                             size={14} 
                             className={i < review.rating ? 'fill-amber-500 text-amber-500' : 'text-muted'} 
                           />
                        ))}
                     </div>
                  </div>
                  <div className="review-content">
                     "{review.comment}"
                  </div>
                  <div className="review-footer">
                     <div className="footer-actions">
                        <button className="btn-action">
                           <ThumbsUp size={14} /> Helpful (2)
                        </button>
                        <button className="btn-action">
                           <MessageSquare size={14} /> Reply
                        </button>
                     </div>
                     <div className="admin-actions">
                        {review.status !== 'Approved' && (
                           <button className="btn-approve">Approve</button>
                        )}
                        <button className="btn-more">
                           <MoreVertical size={16} />
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         ))}
      </div>
    </div>
  );
};

export default Reviews;
