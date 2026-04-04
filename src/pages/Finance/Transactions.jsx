import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Search,
  Filter,
  Download,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  MoreVertical,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { subscribeToOrders } from '../../api/orders';
import { useCurrency } from '../../hooks/useCurrency';
import { SkeletonStat } from '../../components/Skeleton';
import EmptyState from '../../components/EmptyState';
import './Transactions.css';

const Transactions = () => {
  const { formatPrice } = useCurrency();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [methodFilter, setMethodFilter] = useState('All');
  const [timeframe, setTimeframe] = useState('30days');

  useEffect(() => {
    const unsubscribe = subscribeToOrders((orderData) => {
      // Enriched transaction data from orders
      const enriched = orderData.map(order => ({
        id: order.id,
        date: order.order_date,
        customer: order.customer_name,
        amount: order.total_amount,
        status: order.payment_status === 'Paid' ? 'Completed' : 
                order.payment_status === 'Failed' ? 'Failed' : 'Pending',
        method: order.payment_method || 'Paystack',
        type: 'Inflow'
      })).sort((a, b) => new Date(b.date) - new Date(a.date));

      setTransactions(enriched);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const isWithinTimeframe = (dateStr) => {
    if (timeframe === 'all') return true;
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = (now - date) / (1000 * 60 * 60 * 24);
    
    if (timeframe === '7days') return diffDays <= 7;
    if (timeframe === '30days') return diffDays <= 30;
    if (timeframe === 'today') return date.toDateString() === now.toDateString();
    return true;
  };

  const filteredTransactions = transactions.filter(txn => {
    const matchesSearch = txn.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || txn.status === statusFilter;
    const matchesMethod = methodFilter === 'All' || txn.method === methodFilter;
    const matchesTime = isWithinTimeframe(txn.date);
    return matchesSearch && matchesStatus && matchesMethod && matchesTime;
  });

  // Calculate dynamic stats
  const totalInflow = transactions
    .filter(t => t.status === 'Completed' && isWithinTimeframe(t.date))
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const pendingSettlements = transactions
    .filter(t => t.status === 'Pending')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const refundTotal = transactions
    .filter(t => t.status === 'Failed') // Assuming 'Failed' as potential refund/loss for this view
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  return (
    <div className="transactions-page">
      <div className="page-header">
        <div className="header-content">
          <h1 className="font-bold">Financial Transactions</h1>
          <p className="text-muted">Monitor inflows, payouts, and settlement records.</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-outline flex items-center gap-2">
            <Download size={16} /> Export
          </button>
          <div className="timeframe-select">
            <Calendar size={16} />
            <select value={timeframe} onChange={(e) => setTimeframe(e.target.value)}>
              <option value="today">Today</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon">
              <ArrowDownLeft size={18} />
            </div>
            <span className="stat-change up">+12%</span>
          </div>
          <div className="stat-value">{loading ? <SkeletonStat /> : formatPrice(totalInflow)}</div>
          <div className="stat-title">Total Inflow</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon">
              <ArrowUpRight size={18} />
            </div>
            <span className="stat-change neutral">0%</span>
          </div>
          <div className="stat-value">{loading ? <SkeletonStat /> : formatPrice(pendingSettlements)}</div>
          <div className="stat-title">Pending Settlements</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon">
              <AlertCircle size={18} />
            </div>
            <span className="stat-change down">-2%</span>
          </div>
          <div className="stat-value">{loading ? <SkeletonStat /> : formatPrice(refundTotal)}</div>
          <div className="stat-title">Refunds</div>
        </div>
      </div>

      <div className="filters-bar">
        <div className="search-wrapper">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="select-dropdown">
          <Filter size={14} />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All Status</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
          </select>
        </div>
        <div className="select-dropdown">
          <Receipt size={14} />
          <select value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)}>
            <option value="All">All Methods</option>
            <option value="Paystack">Paystack</option>
            <option value="Stripe">Stripe</option>
            <option value="PayPal">PayPal</option>
            <option value="Bank Transfer">Bank Transfer</option>
          </select>
        </div>
      </div>

      <div className="content-card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Method</th>
                <th>Amount</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="skeleton-row">
                    <td colSpan="7"><div className="skeleton-line"></div></td>
                  </tr>
                ))
              ) : filteredTransactions.length === 0 ? (
                <tr className="empty-row">
                  <td colSpan="7" style={{ padding: 0 }}>
                    <EmptyState
                      Icon={Receipt}
                      title="No transactions matches your filters."
                      message="Try searching for a different ID or customer name."
                      variant="table"
                    />
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((txn) => (
                  <tr key={txn.id}>
                    <td className="font-mono text-xs text-primary">#{txn.id.slice(0, 8).toUpperCase()}</td>
                    <td className="text-sm">{new Date(txn.date).toLocaleDateString()}</td>
                    <td>
                      <div className="text-sm font-medium">{txn.customer}</div>
                    </td>
                    <td>
                      <div className="method-badge">
                        <CheckCircle2 size={12} /> {txn.method}
                      </div>
                    </td>
                    <td className="font-bold">{formatPrice(txn.amount)}</td>
                    <td>
                      <span className={`status-pill ${txn.status.toLowerCase()}`}>
                        {txn.status === 'Completed' ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                        {txn.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn-icon">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Transactions;
