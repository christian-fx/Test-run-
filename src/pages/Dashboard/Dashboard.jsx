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

// API
import { subscribeToProducts } from '../../api/products';
import { subscribeToOrders } from '../../api/orders';
import { subscribeToCustomers } from '../../api/customers';

const Dashboard = () => {
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

  // --- Real computed stats ---

  const now = new Date();

  // Revenue: current month vs last month
  const thisMonthRevenue = orders
    .filter(o => {
      const d = new Date(o.order_date || o.orderDate || o.created_at || 0);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

  const lastMonthRevenue = orders
    .filter(o => {
      const d = new Date(o.order_date || o.orderDate || o.created_at || 0);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return d.getMonth() === lastMonth.getMonth() && d.getFullYear() === lastMonth.getFullYear();
    })
    .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

  const revenuePct = lastMonthRevenue > 0
    ? (((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(1)
    : null;

  const revenueChange = revenuePct !== null
    ? `${revenuePct > 0 ? '+' : ''}${revenuePct}% vs last month`
    : 'No data from last month';

  const revenueTrend = revenuePct === null ? 'neutral' : revenuePct >= 0 ? 'up' : 'down';

  // Total revenue (all delivered/paid orders)
  const totalRevenue = orders
    .filter(o => o.status === 'Delivered' || o.payment_status === 'Paid')
    .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

  // Orders this week
  const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);
  const ordersThisWeek = orders.filter(o => {
    const d = new Date(o.order_date || o.orderDate || o.created_at || 0);
    return d >= weekAgo;
  }).length;

  // Products
  const activeProducts = products.filter(p => p.status === 'Active' || p.status === 'Published').length;
  const outOfStock = products.filter(p => parseInt(p.stock) === 0).length;

  // Customers today
  const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
  const newCustomersToday = customers.filter(c => new Date(c.created_at || 0) >= todayStart).length;

  // Pending orders
  const pendingOrders = orders.filter(o => o.status === 'Processing' || o.status === 'Pending').length;
  const pendingPct = orders.length > 0 ? Math.round((pendingOrders / orders.length) * 100) : 0;

  const stats = [
    {
      title: 'Total Revenue',
      value: `₦${totalRevenue.toLocaleString()}`,
      change: revenueChange,
      trend: revenueTrend,
      icon: DollarSign,
    },
    {
      title: 'Total Orders',
      value: orders.length.toString(),
      change: `+${ordersThisWeek} this week`,
      trend: 'up',
      icon: ShoppingBag,
    },
    {
      title: 'Active Products',
      value: activeProducts.toString(),
      change: `${products.length - activeProducts} drafts · ${outOfStock} out of stock`,
      trend: outOfStock > 0 ? 'down' : 'neutral',
      icon: Package,
    },
    {
      title: 'Total Customers',
      value: customers.length.toString(),
      change: newCustomersToday > 0 ? `+${newCustomersToday} today` : 'No new customers today',
      trend: newCustomersToday > 0 ? 'up' : 'neutral',
      icon: Users,
    },
  ];

  // Recent orders (last 5, with real timestamp formatting)
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.order_date || b.created_at || 0) - new Date(a.order_date || a.created_at || 0))
    .slice(0, 6);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="font-bold" style={{ fontSize: '24px' }}>Dashboard Overview</h1>
          <p className="text-muted">Real-time summary of your store's performance across all channels.</p>
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
      {!loading && <RevenueChart orders={orders} />}

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
            {!loading && recentOrders.length === 0 && (
              <div className="empty-panel">
                <Clock size={28} opacity={0.2} />
                <span>No orders yet</span>
              </div>
            )}
            {!loading && recentOrders.map((order) => {
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
                    <div className="order-row-amount">₦{Number(order.total_amount || 0).toLocaleString()}</div>
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
