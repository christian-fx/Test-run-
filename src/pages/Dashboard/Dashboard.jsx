import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  ShoppingBag, 
  Users, 
  TrendingUp, 
  TrendingDown,
  Package,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import './Dashboard.css';

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

  // Compute Stats
  const totalRevenue = orders
    .filter(o => o.status === 'Delivered' || o.status === 'Paid')
    .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

  const activeProducts = products.filter(p => p.status === 'Active' || p.status === 'Published').length;
  const pendingOrders = orders.filter(o => o.status === 'Processing' || o.status === 'Pending').length;

  const stats = [
    { 
      title: 'Total Revenue', 
      value: `₦${totalRevenue.toLocaleString()}`, 
      change: '+12.5% from last month', 
      trend: 'up', 
      icon: DollarSign 
    },
    { 
      title: 'Total Orders', 
      value: orders.length.toString(), 
      change: `+${orders.filter(o => {
        const today = new Date();
        const orderDate = new Date(o.order_date || o.orderDate || 0);
        return orderDate > new Date(today.setDate(today.getDate() - 7));
      }).length} this week`, 
      trend: 'up', 
      icon: ShoppingBag 
    },
    { 
      title: 'Active Products', 
      value: activeProducts.toString(), 
      change: `${products.length - activeProducts} drafts`, 
      trend: 'neutral', 
      icon: Package 
    },
    { 
      title: 'Total Customers', 
      value: customers.length.toString(), 
      change: `+${customers.filter(c => {
        const today = new Date();
        const signupDate = new Date(c.created_at || 0);
        return signupDate > new Date(today.setHours(0,0,0,0));
      }).length} today`, 
      trend: 'up', 
      icon: Users 
    },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="font-bold" style={{ fontSize: '24px' }}>Dashboard Overview</h1>
        <p className="text-muted">Real-time summary of your store's performance across all channels.</p>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-header">
              <span className="stat-title">{stat.title}</span>
              <div className="stat-icon"><stat.icon size={18} /></div>
            </div>
            <div className="stat-value">{loading ? '...' : stat.value}</div>
            <div className={`stat-change ${stat.trend}`}>
              {stat.trend === 'up' ? <TrendingUp size={14} /> : stat.trend === 'down' ? <TrendingDown size={14} /> : null}
              {stat.change}
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="panel col-span-2">
          <div className="panel-header">
            <h2 className="font-bold">Recent Activity</h2>
            <button className="btn btn-subtle">View All</button>
          </div>
          <div className="panel-body">
            <div className="activity-list">
              {!loading && orders.slice(0, 5).map((order) => (
                <div key={order.id} className="activity-item">
                  <div className="activity-icon-box">
                    <Clock size={16} />
                  </div>
                  <div className="activity-details">
                    <div className="activity-text">
                      <span className="font-medium">{order.customer?.name || 'Customer'}</span> placed a new order <span className="font-medium">{order.id}</span>
                    </div>
                    <div className="activity-time">₦{Number(order.total_amount || 0).toLocaleString()} • Just now</div>
                  </div>
                  <span className={`badge badge-${order.status?.toLowerCase() === 'delivered' ? 'success' : 'warning'}`}>
                    {order.status}
                  </span>
                </div>
              ))}
              {!loading && orders.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted-foreground)' }}>
                  No recent orders to show.
                </div>
              )}
              {loading && (
                <div style={{ textAlign: 'center', padding: '40px' }}>Loading activity...</div>
              )}
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h2 className="font-bold">Quick Stats</h2>
          </div>
          <div className="panel-body">
            <div className="quick-stats">
              <div className="q-stat">
                <div className="q-label">Pending Fulfillment</div>
                <div className="q-value">{pendingOrders}</div>
                <div className="q-progress"><div className="q-bar" style={{ width: '45%' }}></div></div>
              </div>
              <div className="q-stat">
                <div className="q-label">Out of Stock Items</div>
                <div className="q-value">{products.filter(p => parseInt(p.stock) === 0).length}</div>
                <div className="q-progress"><div className="q-bar danger" style={{ width: '12%' }}></div></div>
              </div>
              <div className="q-stat">
                <div className="q-label">Customer Satisfaction</div>
                <div className="q-value">0%</div>
                <div className="q-progress"><div className="q-bar success" style={{ width: '0%' }}></div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
