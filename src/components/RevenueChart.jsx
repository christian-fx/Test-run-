import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import './RevenueChart.css';

const formatNaira = (value) => {
  if (value >= 1_000_000) return `₦${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `₦${(value / 1_000).toFixed(0)}K`;
  return `₦${value}`;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <div className="tooltip-label">{label}</div>
        <div className="tooltip-value">₦{Number(payload[0].value).toLocaleString()}</div>
        <div className="tooltip-sub">{payload[0].payload.orders} orders</div>
      </div>
    );
  }
  return null;
};

const RevenueChart = ({ orders = [], activeRange = 30, setActiveRange }) => {
  // Build daily buckets for the selected range
  const chartData = React.useMemo(() => {
    const today = new Date();
    const buckets = {};

    for (let i = activeRange - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
      buckets[key] = { date: key, revenue: 0, orders: 0 };
    }

    orders.forEach(order => {
      const raw = order.order_date || order.orderDate || order.created_at;
      if (!raw) return;
      const d = new Date(raw?.toDate ? raw.toDate() : raw);
      const diffMs = today - d;
      const daysAgo = diffMs / (1000 * 60 * 60 * 24);
      
      if (daysAgo > activeRange) return;

      const key = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
      if (buckets[key]) {
        buckets[key].revenue += Number(order.total_amount) || 0;
        buckets[key].orders += 1;
      }
    });

    return Object.values(buckets);
  }, [orders, activeRange]);

  const totalRevenue = chartData.reduce((sum, d) => sum + d.revenue, 0);
  const totalOrders = chartData.reduce((sum, d) => sum + d.orders, 0);

  // Tick interval based on range
  const tickInterval = activeRange === 7 ? 0 : activeRange === 30 ? 4 : 11;

  const RANGES = [
    { label: '7D', value: 7 },
    { label: '30D', value: 30 },
    { label: '90D', value: 90 },
  ];

  return (
    <div className="revenue-chart-card">
      <div className="chart-header">
        <div className="chart-header-left">
          <div className="chart-title">Revenue Overview</div>
          <div className="chart-summary">
            <span className="chart-total">₦{totalRevenue.toLocaleString()}</span>
            <span className="chart-orders-pill">{totalOrders} orders</span>
          </div>
        </div>
        <div className="chart-range-tabs">
          {RANGES.map(r => (
            <button
              key={r.value}
              className={`range-tab ${activeRange === r.value ? 'active' : ''}`}
              onClick={() => setActiveRange && setActiveRange(r.value)}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="chart-body">
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              axisLine={false}
              tickLine={false}
              interval={tickInterval}
            />
            <YAxis
              tickFormatter={formatNaira}
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              axisLine={false}
              tickLine={false}
              width={50}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="var(--primary)"
              strokeWidth={2.5}
              fill="url(#revenueGradient)"
              dot={false}
              activeDot={{ r: 5, fill: 'var(--primary)', stroke: 'white', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueChart;
