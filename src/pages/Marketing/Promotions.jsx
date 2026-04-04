import React, { useState } from 'react';
import { 
  Image, 
  Plus, 
  Play, 
  Pause, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  Clock,
  Eye,
  MousePointer2,
  Calendar,
  Layout
} from 'lucide-react';
import './Promotions.css';

const MOCK_PROMOS = [
  { id: '1', title: 'Summer Tech Bash', type: 'Hero Carousel', impressions: '45.2K', clicks: '2.4K', status: 'Running', image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800' },
  { id: '2', title: 'iPhone 15 Launch', type: 'Product Spotlight', impressions: '128K', clicks: '15.6K', status: 'Running', image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba3f95?auto=format&fit=crop&q=80&w=800' },
  { id: '3', title: 'Back to School', type: 'Sidebar Banner', impressions: '12K', clicks: '450', status: 'Paused', image: 'https://images.unsplash.com/photo-1513258496099-48168024adb0?auto=format&fit=crop&q=80&w=800' },
];

const Promotions = () => {
  const [promos] = useState(MOCK_PROMOS);

  return (
    <div className="promotions-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Promotions & Banners</h1>
          <p>Schedule storefront campaigns and collections.</p>
        </div>
        <div className="page-header-actions">
           <button className="btn btn-primary flex items-center gap-2">
              <Plus size={16} /> New Campaign
           </button>
        </div>
      </div>

      <div className="campaign-grid">
         {promos.map(promo => (
            <div key={promo.id} className="promo-card">
               <div className="promo-preview">
                  <img src={promo.image} alt={promo.title} />
                  <div className="promo-overlay">
                     <span className={`status-badge ${promo.status.toLowerCase()}`}>
                        {promo.status}
                     </span>
                  </div>
               </div>
               
               <div className="promo-body">
                  <div className="promo-type">
                     <Layout size={10} /> {promo.type}
                  </div>
                  <h3 className="promo-title">{promo.title}</h3>
                  
                  <div className="promo-metrics">
                     <div className="p-metric">
                        <Eye size={12} />
                        <span>{promo.impressions}</span>
                     </div>
                     <div className="p-metric">
                        <MousePointer2 size={12} />
                        <span>{promo.clicks}</span>
                     </div>
                  </div>
               </div>

               <div className="promo-footer">
                  <div className="promo-btns">
                     <button className="p-btn"><Edit3 size={16} /></button>
                     <button className="p-btn"><Trash2 size={16} /></button>
                     <button className="p-btn"><ExternalLink size={16} /></button>
                  </div>
                  {promo.status === 'Running' ? (
                     <button className="btn-pause">Pause</button>
                  ) : (
                     <button className="btn-resume">Resume</button>
                  )}
               </div>
            </div>
         ))}
      </div>
    </div>
  );
};

export default Promotions;
