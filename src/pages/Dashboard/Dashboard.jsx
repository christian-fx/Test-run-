import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  ShoppingBag, 
  Users, 
  TrendingUp, 
  TrendingDown,
  Package,
  Clock,
  AlertCircle,
  ArrowUpRight
} from 'lucide-react';
import './Dashboard.css';
import RevenueChart from '../../components/RevenueChart';
import { SkeletonStat, SkeletonRow } from '../../components/Skeleton';
import EmptyState from '../../components/EmptyState';

// API
import { subscribeToProducts } from '../../api/products';
import { subscribeToOrders } from '../../api/orders';
import { subscribeToCustomers } from '../../api/customers';
import { getRangeStart, getPrevRangeStart, isWithinRange } from '../../utils/dateUtils';

// Context
import { useCurrency } from '../../hooks/useCurrency';

const Dashboard = () => {
  const { formatPrice } = useCurrency();
  const [activeRange, setActiveRange] = useState(30); // Default to 30 days
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubProducts = subscribeToProducts(setProducts);
    const unsubOrders = subscribeToOrders(setOrders);
    const unsubCustomers = subscribeToCustomers((data) => {
      setCustomers(data);
      setLoading(false);
    });

    return () => {
      unsubProducts();
      unsubOrders();
      unsubCustomers();
    };
  }, []);

  // --- Dynamic Dashboard Intelligence ---
  
  const rangeStart = getRangeStart(activeRange);
  const prevRangeStart = getPrevRangeStart(activeRange);

  // 1. Revenue Analytics
  const currentPeriodOrders = orders.filter(o => isWithinRange(o.order_date || o.created_at, rangeStart));
  const prevPeriodOrders = orders.filter(o => isWithinRange(o.order_date || o.created_at, prevRangeStart, rangeStart));

  const currentRevenue = currentPeriodOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
  const prevRevenue = prevPeriodOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

  const revenuePct = prevRevenue > 0 
    ? (((currentRevenue - prevRevenue) / prevRevenue) * 100).toFixed(1)
    : null;

  const revenueChangeText = revenuePct !== null 
    ? `${revenuePct > 0 ? '+' : ''}${revenuePct}% vs prev. ${activeRange} days`
    : 'No comparison data';

  const revenueTrend = revenuePct === null ? 'neutral' : Number(revenuePct) >= 0 ? 'up' : 'down';

  // 2. Order Analytics
  const activeOrders = currentPeriodOrders.length;
  const prevActiveOrders = prevPeriodOrders.length;
  const orderPct = prevActiveOrders > 0
    ? (((activeOrders - prevActiveOrders) / prevActiveOrders) * 100).toFixed(0)
    : null;

  const orderChangeText = orderPct !== null
    ? `${orderPct > 0 ? '+' : ''}${orderPct}% growth`
    : `${activeOrders} orders total`;

  // 3. Product Inventory
  const activeProducts = products.filter(p => p.status === 'Active' || p.status === 'Published').length;
  const outOfStock = products.filter(p => parseInt(p.stock) === 0).length;

  // 4. Customer Growth
  const newCustomersCurrent = customers.filter(c => isWithinRange(c.created_at, rangeStart)).length;
  const customerChangeText = newCustomersCurrent > 0 
    ? `+${newCustomersCurrent} new recently` 
    : 'Steady growth';

  // Pending Analytics
  const pendingOrders = orders.filter(o => o.status === 'Processing' || o.status === 'Pending').length;
  const pendingPct = orders.length > 0 ? Math.round((pendingOrders / orders.length) * 100) : 0;

  const stats = [
    {
      title: 'Current Revenue',
      value: formatPrice(currentRevenue),
      change: revenueChangeText,
      trend: revenueTrend,
      icon: DollarSign,
    },
    {
      title: 'Active Orders',
      value: activeOrders.toString(),
      change: orderChangeText,
      trend: orderPct === null ? 'neutral' : Number(orderPct) >= 0 ? 'up' : 'down',
      icon: ShoppingBag,
    },
    {
      title: 'Published Products',
      value: activeProducts.toString(),
      change: `${outOfStock} items out of stock`,
      trend: outOfStock > 0 ? 'down' : 'neutral',
      icon: Package,
    },
    {
      title: 'Total Customers',
      value: customers.length.toString(),
      change: customerChangeText,
      trend: newCustomersCurrent > 0 ? 'up' : 'neutral',
      icon: Users,
    },
  ];

  // Recent orders (Always show globally, but we could highlight if we wanted)
  const recentOrdersSorted = [...orders]
    .sort((a, b) => new Date(b.order_date || b.created_at || 0) - new Date(a.order_date || a.created_at || 0))
    .slice(0, 6);

  const ranges = [
    { label: '7D', value: 7 },
    { label: '30D', value: 30 },
    { label: '90D', value: 90 },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="font-bold" style={{ fontSize: '24px' }}>Analytics & Overview</h1>
          <p className="text-muted">Dynamic summary of your business performance.</p>
        </div>
        
        <div className="range-selector">
          {ranges.map(r => (
            <button
              key={r.value}
              className={`range-btn ${activeRange === r.value ? 'active' : ''}`}
              onClick={() => setActiveRange(r.value)}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      {loading ? (
        <div className="stats-grid">
          <SkeletonStat /><SkeletonStat /><SkeletonStat /><SkeletonStat />
        </div>
      ) : (
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-header">
                <span className="stat-title">{stat.title}</span>
                <div className="stat-icon"><stat.icon size={18} /></div>
              </div>
              <div className="stat-value">{stat.value}</div>
              <div className={`stat-change ${stat.trend}`}>
                {stat.trend === 'up' && <TrendingUp size={13} />}
                {stat.trend === 'down' && <TrendingDown size={13} />}
                <span>{stat.change}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Revenue Chart */}
      {!loading && <RevenueChart orders={orders} activeRange={activeRange} />}

      {/* Bottom Grid: Recent Orders + Quick Stats */}
      <div className="dashboard-grid">

        {/* Recent Orders */}
        <div className="panel">
          <div className="panel-header">
            <h2 className="panel-title">Recent Orders</h2>
            <a href="/orders" className="panel-link">
              View all <ArrowUpRight size={14} />
            </a>
          </div>
          <div className="panel-body" style={{ padding: 0 }}>
            {loading && (
              <table className="table-w" style={{ width: '100%' }}>
                <tbody>
                  {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={4} />)}
                </tbody>
              </table>
            )}
            {!loading && recentOrdersSorted.length === 0 && (
              <EmptyState 
                Icon={Clock} 
                title="No orders yet" 
                message="Recent orders will appear here once customers start purchasing."
              />
            )}
            {!loading && recentOrdersSorted.map((order) => {
              const raw = order.order_date || order.orderDate || order.created_at;
              const date = raw ? new Date(raw?.toDate ? raw.toDate() : raw) : null;
              const timeStr = date ? date.toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';
              const statusClass = order.status === 'Delivered' ? 'success'
                : order.status === 'Processing' ? 'warning'
                : order.status === 'Cancelled' ? 'destructive'
                : 'secondary';

              return (
                <div key={order.id} className="order-row">
                  <div className="order-row-icon">
                    <ShoppingBag size={15} />
                  </div>
                  <div className="order-row-info">
                    <div className="order-row-name">{order.customer?.name || 'Customer'}</div>
                    <div className="order-row-meta">{timeStr}</div>
                  </div>
                  <div className="order-row-right">
                    <div className="order-row-amount">{formatPrice(order.total_amount)}</div>
                    <span className={`badge badge-${statusClass}`}>{order.status || 'Pending'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="panel">
          <div className="panel-header">
            <h2 className="panel-title">Quick Stats</h2>
          </div>
          <div className="panel-body">
            <div className="quick-stats">
              <div className="q-stat">
                <div className="q-stat-header">
                  <div className="q-label">Pending Fulfillment</div>
                  <div className="q-count">{loading ? '—' : pendingOrders}</div>
                </div>
                <div className="q-progress">
                  <div className="q-bar" style={{ width: `${pendingPct}%` }} />
                </div>
                <div className="q-hint">{pendingPct}% of all orders</div>
              </div>

              <div className="q-stat">
                <div className="q-stat-header">
                  <div className="q-label">Out of Stock Items</div>
                  <div className="q-count">{loading ? '—' : outOfStock}</div>
                </div>
                <div className="q-progress">
                  <div className="q-bar danger" style={{ width: products.length > 0 ? `${(outOfStock / products.length) * 100}%` : '0%' }} />
                </div>
                <div className="q-hint">{products.length > 0 ? ((outOfStock / products.length) * 100).toFixed(0) : 0}% of catalog</div>
              </div>

              <div className="q-stat">
                <div className="q-stat-header">
                  <div className="q-label">Low Stock (≤5 units)</div>
                  <div className="q-count">{loading ? '—' : products.filter(p => parseInt(p.stock) > 0 && parseInt(p.stock) <= 5).length}</div>
                </div>
                <div className="q-progress">
                  <div className="q-bar warning" style={{ 
                    width: products.length > 0 
                      ? `${(products.filter(p => parseInt(p.stock) > 0 && parseInt(p.stock) <= 5).length / products.length) * 100}%` 
                      : '0%' 
                  }} />
                </div>
                <div className="q-hint">Requires attention</div>
              </div>

              {outOfStock > 0 && (
                <div className="stock-alert-banner">
                  <AlertCircle size={14} />
                  <span>{outOfStock} product{outOfStock > 1 ? 's' : ''} out of stock — restock needed</span>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
