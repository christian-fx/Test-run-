import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  ChevronDown, 
  History,
  Layers,
  AlertTriangle,
  TrendingDown,
  ChevronRight,
  Package,
  DollarSign,
  Truck
} from 'lucide-react';
import './Inventory.css';
import { subscribeToProducts } from '../../api/products';
import { restockProduct, subscribeToStockLogs } from '../../api/inventory';
import { useCurrency } from '../../hooks/useCurrency';
import { SkeletonStat } from '../../components/Skeleton';
import EmptyState from '../../components/EmptyState';
import { X, Check, ArrowUp, ArrowDown, Activity } from 'lucide-react';

const Inventory = () => {
  const { formatPrice } = useCurrency();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stockStatus, setStockStatus] = useState('All');
  const [stockLogs, setStockLogs] = useState([]);
  const [showLogs, setShowLogs] = useState(false);
  const [restockItem, setRestockItem] = useState(null);
  const [restockAmount, setRestockAmount] = useState(10);
  const [restockReason, setRestockReason] = useState('New Shipment');
  const [restockNote, setRestockNote] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const unsubProducts = subscribeToProducts((data) => {
      setProducts(data);
      setLoading(false);
    });

    const unsubLogs = subscribeToStockLogs((data) => {
      setStockLogs(data);
    });

    return () => {
      unsubProducts();
      unsubLogs();
    };
  }, []);

  const inventory = products.map(p => ({
    id: p.id,
    name: p.name,
    sku: p.sku || 'N/A',
    stock: parseInt(p.stock) || 0,
    price: p.price,
    image: p.images?.[0] || null,
    threshold: 10, // Default threshold
    category: p.category || 'General'
  }));

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = stockStatus === 'All' || 
                          (stockStatus === 'Low Stock' && item.stock > 0 && item.stock <= item.threshold) ||
                          (stockStatus === 'Out of Stock' && item.stock === 0);
    return matchesSearch && matchesStatus;
  });

  const lowStockCount = inventory.filter(item => item.stock > 0 && item.stock <= item.threshold).length;
  const outOfStockCount = inventory.filter(item => item.stock === 0).length;
  const totalValue = inventory.reduce((sum, item) => sum + (item.price * item.stock), 0);
  const totalUnits = inventory.reduce((sum, item) => sum + item.stock, 0);

  const handleRestockSubmit = async () => {
    if (!restockItem || restockAmount <= 0) return;
    setUpdating(true);
    try {
      const fullNote = restockNote ? `${restockReason}: ${restockNote}` : restockReason;
      await restockProduct(restockItem.id, restockItem.stock, Number(restockAmount), 'Restock', fullNote);
      setRestockItem(null);
      setRestockAmount(10);
      setRestockNote('');
    } catch (error) {
      console.error("Restock failed:", error);
    } finally {
      setUpdating(false);
    }
  };

  const handleBatchRestock = async () => {
    const lowStockItems = inventory.filter(item => item.stock <= item.threshold);
    if (lowStockItems.length === 0) return;
    
    if (confirm(`Do you want to restock all ${lowStockItems.length} low-stock items by 50 units each?`)) {
      setUpdating(true);
      try {
        await Promise.all(lowStockItems.map(item => 
          restockProduct(item.id, item.stock, 50, 'Batch Restock')
        ));
      } catch (error) {
        console.error("Batch restock failed:", error);
      } finally {
        setUpdating(false);
      }
    }
  };

  return (
    <div className="inventory-page">
      <div className="inventory-header">
        <div className="header-info">
          <h1 className="font-bold">Inventory Management</h1>
          <p className="text-muted">Real-time tracking of stock levels and warehouse valuation.</p>
        </div>
        <div className="page-header-actions">
          <button 
            className="btn btn-outline flex items-center gap-2"
            onClick={() => setShowLogs(true)}
          >
            <History size={16} /> Stock Logs
          </button>
          <button 
            className="btn btn-primary flex items-center gap-2"
            onClick={handleBatchRestock}
            disabled={updating}
          >
            <Plus size={16} /> Batch Restock
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
           <div className="stat-header">
             <div className="stat-title">Total SKUs</div>
             <div className="stat-icon">
                <Layers size={18} />
             </div>
           </div>
           <div className="stat-value">{inventory.length}</div>
        </div>
        <div className="stat-card">
           <div className="stat-header">
             <div className="stat-title">Inventory Value</div>
             <div className="stat-icon">
                <DollarSign size={18} />
             </div>
           </div>
           <div className="stat-value">{formatPrice(totalValue)}</div>
           <div className="text-xs text-muted" style={{ marginTop: '4px' }}>{totalUnits} total units</div>
        </div>
        <div className="stat-card">
           <div className="stat-header">
             <div className="stat-title">Low Stock</div>
             <div className="stat-icon" style={{ background: 'color-mix(in srgb, var(--warning) 15%, transparent)', color: 'var(--warning)' }}>
                <AlertTriangle size={18} />
             </div>
           </div>
           <div className="stat-value">{lowStockCount}</div>
        </div>
        <div className="stat-card">
           <div className="stat-header">
             <div className="stat-title">Out of Stock</div>
             <div className="stat-icon" style={{ background: 'color-mix(in srgb, var(--destructive) 15%, transparent)', color: 'var(--destructive)' }}>
                <TrendingDown size={18} />
             </div>
           </div>
           <div className="stat-value">{outOfStockCount}</div>
        </div>
      </div>

      <div className="inventory-toolbar">
          <div className="search-bar">
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Search by SKU or name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="tab-group">
               <button 
                 className={`tab-btn ${stockStatus === 'All' ? 'active' : ''}`}
                 onClick={() => setStockStatus('All')}
               >All</button>
               <button 
                 className={`tab-btn ${stockStatus === 'Low Stock' ? 'active' : ''}`}
                 onClick={() => setStockStatus('Low Stock')}
               >Low</button>
               <button 
                className={`tab-btn ${stockStatus === 'Out of Stock' ? 'active' : ''}`}
                onClick={() => setStockStatus('Out of Stock')}
               >Out of Stock</button>
          </div>
      </div>

      <div className="inventory-grid">
        {loading ? (
          Array(6).fill(0).map((_, i) => <div key={i} className="inventory-skeleton"></div>)
        ) : filteredInventory.length === 0 ? (
          <div className="col-span-full">
            <EmptyState 
              icon={Package}
              title="No items found"
              message="Adjust your filters or search to find specific inventory items."
            />
          </div>
        ) : (
          filteredInventory.map((item) => (
            <div key={item.id} className="inventory-card">
              <div className="item-main">
                <div className="item-image">
                  {item.image ? (
                    <img src={typeof item.image === 'string' ? item.image : item.image.url} alt={item.name} />
                  ) : (
                    <Package size={20} className="text-muted-foreground" />
                  )}
                </div>
                <div className="item-details">
                  <div className="item-name">{item.name}</div>
                  <div className="item-sku">{item.sku}</div>
                </div>
              </div>

              <div className="stock-meter-container">
                <div className="stock-info">
                  <span className="stock-count">{item.stock} in stock</span>
                  <span className="stock-threshold">Threshold: {item.threshold}</span>
                </div>
                <div className="stock-progress-bg">
                  <div 
                    className={`stock-progress-bar ${item.stock === 0 ? 'out' : item.stock <= item.threshold ? 'low' : 'good'}`}
                    style={{ width: `${Math.min((item.stock / 50) * 100, 100)}%` }}
                  />
                </div>
              </div>

              <div className="item-footer">
                <div className="item-price">{formatPrice(item.price)}</div>
                <button 
                  className="restock-btn"
                  onClick={() => setRestockItem(item)}
                >
                  Restock <ChevronRight size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Restock Modal */}
      {restockItem && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Restock: {restockItem.name}</h3>
              <button className="close-btn" onClick={() => setRestockItem(null)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="stock-preview">
                <div className="preview-stat">
                  <span className="p-label">Current</span>
                  <span className="p-value">{restockItem.stock}</span>
                </div>
                <div className="preview-stat">
                  <span className="p-label">New Total</span>
                  <span className="p-value highlight">{restockItem.stock + Number(restockAmount)}</span>
                </div>
              </div>
              <div className="input-group">
                <label>Add Units</label>
                <input 
                  type="number" 
                  value={restockAmount} 
                  onChange={(e) => setRestockAmount(e.target.value)}
                  min="1"
                />
              </div>
              <div className="input-group">
                <label>Reason</label>
                <select 
                  value={restockReason} 
                  onChange={(e) => setRestockReason(e.target.value)}
                  className="select-reason"
                >
                  <option value="New Shipment">New Shipment</option>
                  <option value="Customer Return">Customer Return</option>
                  <option value="Inventory Correction">Inventory Correction</option>
                  <option value="Supplier Replacement">Supplier Replacement</option>
                  <option value="Promotional Stock">Promotional Stock</option>
                </select>
              </div>
              <div className="input-group">
                <label>Optional Note</label>
                <textarea 
                  placeholder="e.g. Received from DHL, Batch #203..."
                  value={restockNote}
                  onChange={(e) => setRestockNote(e.target.value)}
                  rows="2"
                  className="note-area"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setRestockItem(null)}>Cancel</button>
              <button 
                className="btn btn-primary flex items-center gap-2"
                onClick={handleRestockSubmit}
                disabled={updating}
              >
                {updating ? 'Updating...' : <><Check size={16} /> Confirm Restock</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stock Logs Drawer */}
      <div className={`drawer-overlay ${showLogs ? 'open' : ''}`} onClick={() => setShowLogs(false)}>
        <div className="drawer-content" onClick={e => e.stopPropagation()}>
          <div className="drawer-header">
            <div className="flex items-center gap-2">
              <Activity size={20} className="text-primary" />
              <h3>Adjustment History</h3>
            </div>
            <button className="close-btn" onClick={() => setShowLogs(false)}><X size={20} /></button>
          </div>
          <div className="drawer-body">
            {stockLogs.length === 0 ? (
              <EmptyState icon={History} title="No logs yet" message="Adjustments will appear here as they happen." />
            ) : (
              <div className="logs-list">
                {stockLogs.map(log => {
                  const product = inventory.find(p => p.id === log.product_id);
                  return (
                    <div key={log.id} className="log-item">
                      <div className="log-icon">
                        {log.quantity_change > 0 ? <ArrowUp size={14} className="text-success" /> : <ArrowDown size={14} className="text-destructive" />}
                      </div>
                      <div className="log-info">
                        <div className="log-title">
                          <span className="log-action">{log.action}:</span> {product?.name || 'Unknown Product'}
                        </div>
                        <div className="log-meta">
                          {log.quantity_change > 0 ? '+' : ''}{log.quantity_change} units • {new Date(log.created_at).toLocaleString()}
                        </div>
                        {log.notes && (
                          <div className="log-comment">
                            "{log.notes}"
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
