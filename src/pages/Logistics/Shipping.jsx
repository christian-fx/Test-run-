import React, { useState } from 'react';
import { 
  Truck, 
  MapPin, 
  Globe, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  MoreVertical,
  Navigation,
  Anchor
} from 'lucide-react';
import './Shipping.css';

const MOCK_ZONES = [
  { id: '1', name: 'Lagos Metropolitan', regions: 'Ikeja, Lekki, Victoria Island, Surulere', rate: '₦2,500', time: '1-2 Days', status: 'Active' },
  { id: '2', name: 'South West Core', regions: 'Ibadan, Abeokuta, Akure, Osogbo', rate: '₦4,500', time: '3-5 Days', status: 'Active' },
  { id: '3', name: 'Northern Hub', regions: 'Abuja, Kano, Kaduna, Jos', rate: '₦6,000', time: '5-7 Days', status: 'Inactive' },
];

const Shipping = () => {
  const [zones] = useState(MOCK_ZONES);

  return (
    <div className="shipping-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Shipping & Delivery</h1>
          <p>Manage delivery zones, rates, and partners.</p>
        </div>
        <div className="page-header-actions">
           <button className="btn btn-primary flex items-center gap-2">
              <Plus size={16} /> Add Zone
           </button>
        </div>
      </div>

      <div className="shipping-grid">
         <div className="zones-section">
            <h2 className="section-label">Active Delivery Zones</h2>
            <div className="zone-list">
               {zones.map(zone => (
                  <div key={zone.id} className={`zone-card ${zone.status.toLowerCase()}`}>
                     <div className="zone-info">
                        <div className="zone-header">
                           <div className="zone-name">{zone.name}</div>
                           <span className={`zone-pill ${zone.status.toLowerCase()}`}>{zone.status}</span>
                        </div>
                        <div className="zone-regions">
                           <MapPin size={12} /> {zone.regions}
                        </div>
                     </div>
                     <div className="zone-metrics">
                        <div className="z-metric">
                           <div className="z-label">Base Rate</div>
                           <div className="z-value">{zone.rate}</div>
                        </div>
                        <div className="z-metric">
                           <div className="z-label">Est. Time</div>
                           <div className="z-value">{zone.time}</div>
                        </div>
                        <div className="z-actions">
                           <button className="z-btn"><Edit3 size={16} /></button>
                           <button className="z-btn"><Trash2 size={16} /></button>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         <div className="carriers-section">
            <h2 className="section-label">Logistics Partners</h2>
            <div className="carrier-card">
               <div className="carrier-logo">
                  <Navigation size={24} className="text-primary" />
               </div>
               <div className="carrier-details">
                  <div className="carrier-name">DHL Express</div>
                  <div className="carrier-status"><CheckCircle2 size={12} className="text-success" /> Integrated</div>
               </div>
               <button className="btn-config">Configure</button>
            </div>
            <div className="carrier-card">
               <div className="carrier-logo">
                  <Truck size={24} className="text-muted" />
               </div>
               <div className="carrier-details">
                  <div className="carrier-name">GIG Logistics</div>
                  <div className="carrier-status"><Clock size={12} className="text-amber-500" /> Setup Pending</div>
               </div>
               <button className="btn-config">Continue</button>
            </div>
            <div className="carrier-card disabled">
              <div className="carrier-logo">
                <Anchor size={24} className="text-muted" />
              </div>
              <div className="carrier-details">
                <div className="carrier-name">FedEx Global</div>
                <div className="carrier-status">Not Connected</div>
              </div>
              <button className="btn-config">Connect</button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Shipping;
