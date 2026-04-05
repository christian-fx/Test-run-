import React, { useState, useEffect } from 'react';
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
  Anchor,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import './Shipping.css';
import AddShippingZoneModal from '../../components/AddShippingZoneModal';
import ConfigurePartnerModal from '../../components/ConfigurePartnerModal';
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal';
import { 
  subscribeToZones, 
  subscribeToPartners, 
  deleteZone 
} from '../../api/shipping';

const Shipping = () => {
  const [zones, setZones] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState(null);
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [zoneToDelete, setZoneToDelete] = useState(null);

  useEffect(() => {
    // Subscribe to Zones
    const unsubscribeZones = subscribeToZones((data) => {
      setZones(data);
      setLoading(false);
    });

    // Subscribe to Partners
    const unsubscribePartners = subscribeToPartners((data) => {
      setPartners(data);
    });

    return () => {
      unsubscribeZones();
      unsubscribePartners();
    };
  }, []);

  const handleOpenZoneModal = (zone = null) => {
    setSelectedZone(zone);
    setIsZoneModalOpen(true);
  };

  const handleOpenPartnerModal = (partner) => {
    setSelectedPartner(partner);
    setIsPartnerModalOpen(true);
  };

  const triggerDeleteZone = (zone) => {
    setZoneToDelete(zone);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteZone = async () => {
    if (zoneToDelete) {
      await deleteZone(zoneToDelete.id);
    }
  };

  // Icon Mapping for Partners
  const getPartnerIcon = (iconName) => {
    switch (iconName) {
      case 'Navigation': return <Navigation size={24} />;
      case 'Truck': return <Truck size={24} />;
      case 'Anchor': return <Anchor size={24} />;
      default: return <Globe size={24} />;
    }
  };

  return (
    <div className="shipping-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Shipping & Delivery</h1>
          <p>Manage delivery zones, rates, and partners.</p>
        </div>
        <div className="page-header-actions">
           <button className="btn btn-primary flex items-center gap-2" onClick={() => handleOpenZoneModal()}>
              <Plus size={16} /> Add Zone
           </button>
        </div>
      </div>

      <div className="shipping-grid">
         <div className="zones-section">
            <h2 className="section-label">Active Delivery Zones</h2>
            
            {loading ? (
               <div className="flex flex-col items-center justify-center p-12 gap-4">
                  <Loader2 className="animate-spin text-primary" size={32} />
                  <p className="text-muted text-sm font-medium">Syncing logistics data...</p>
               </div>
            ) : zones.length > 0 ? (
               <div className="zone-list">
                  {zones.map(zone => (
                     <div key={zone.id} className={`zone-card ${zone.status?.toLowerCase() || 'active'}`}>
                        <div className="zone-info">
                           <div className="zone-header">
                              <div className="zone-name">{zone.name}</div>
                              <span className={`zone-pill ${zone.status?.toLowerCase() || 'active'}`}>{zone.status}</span>
                           </div>
                           <div className="zone-regions">
                              <MapPin size={12} /> {zone.regions}
                           </div>
                        </div>
                        <div className="zone-metrics">
                           <div className="z-metric">
                              <div className="z-label">Base Rate</div>
                              <div className="z-value">₦{Number(zone.rate).toLocaleString()}</div>
                           </div>
                           <div className="z-metric">
                              <div className="z-label">Est. Time</div>
                              <div className="z-value">{zone.timeEstimate || 'N/A'}</div>
                           </div>
                           <div className="z-actions">
                              <button className="z-btn" onClick={() => handleOpenZoneModal(zone)} title="Edit Zone"><Edit3 size={16} /></button>
                              <button className="z-btn delete" onClick={() => triggerDeleteZone(zone)} title="Delete Zone"><Trash2 size={16} /></button>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            ) : (
               <div className="empty-state p-12 border-2 border-dashed border-border rounded-xl flex flex-col items-center gap-4 text-center">
                  <Globe size={40} className="text-muted" />
                  <div className="flex-col gap-1">
                     <p className="font-bold">No Shipping Zones Found</p>
                     <p className="text-sm text-muted">Create your first delivery region to start taking orders.</p>
                  </div>
                  <button className="btn btn-outline btn-sm mt-2" onClick={() => handleOpenZoneModal()}>Configure Zone</button>
               </div>
            )}
         </div>

         <div className="carriers-section">
            <h2 className="section-label">Logistics Partners</h2>
            
            <div className="carrier-list flex flex-col gap-3">
               {partners.map(carrier => (
                  <div key={carrier.id} className={`carrier-card ${carrier.status === 'Not Connected' ? 'disabled' : ''}`}>
                     <div className={`carrier-logo ${carrier.status === 'Integrated' ? 'text-primary' : 'text-muted'}`}>
                        {getPartnerIcon(carrier.iconType)}
                     </div>
                     <div className="carrier-details">
                        <div className="carrier-name">{carrier.name}</div>
                        <div className="carrier-status">
                           {carrier.status === 'Integrated' ? (
                              <span className="flex items-center gap-1 text-success"><CheckCircle2 size={12} /> Integrated</span>
                           ) : carrier.status === 'Setup Pending' ? (
                              <span className="flex items-center gap-1 text-amber-500"><Clock size={12} /> Setup Pending</span>
                           ) : (
                              <span className="flex items-center gap-1 text-muted"><AlertCircle size={12} /> Not Connected</span>
                           )}
                        </div>
                     </div>
                     <button className="btn-config" onClick={() => handleOpenPartnerModal(carrier)}>
                        {carrier.status === 'Integrated' ? 'Configure' : 'Connect'}
                     </button>
                  </div>
               ))}
            </div>

            <div className="mt-8 p-6 bg-secondary/5 border border-border rounded-xl">
               <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                     <AlertCircle size={20} />
                  </div>
                  <h3 className="font-bold">Automated Fulfillment</h3>
               </div>
               <p className="text-xs text-muted leading-relaxed">
                  Integrating logistics partners allows your store to automatically generate waybills and request pickups once orders are marked as "Ready to Ship".
               </p>
            </div>
         </div>
      </div>

      {/* Modals */}
      <AddShippingZoneModal 
         isOpen={isZoneModalOpen}
         onClose={() => setIsZoneModalOpen(false)}
         zone={selectedZone}
      />

      <ConfigurePartnerModal 
         isOpen={isPartnerModalOpen}
         onClose={() => setIsPartnerModalOpen(false)}
         partner={selectedPartner}
      />

      <DeleteConfirmationModal 
         isOpen={isDeleteModalOpen}
         onClose={() => setIsDeleteModalOpen(false)}
         onConfirm={confirmDeleteZone}
         title="Delete Shipping Zone"
         message={`Are you sure you want to delete the "${zoneToDelete?.name}" zone? Orders from this region will no longer have a fixed shipping rate.`}
      />
    </div>
  );
};

export default Shipping;
