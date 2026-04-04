import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Package, ShoppingBag, Users, X, ArrowRight, Hash } from 'lucide-react';
import './GlobalSearch.css';

import { subscribeToProducts } from '../api/products';
import { subscribeToOrders } from '../api/orders';
import { subscribeToCustomers } from '../api/customers';

// Simple substring match — fast and dependency-free
const matches = (str = '', query = '') =>
  str.toLowerCase().includes(query.toLowerCase());

const GlobalSearch = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  // Data stores — subscribed once on mount
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);

  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Subscribe to all three collections once
  useEffect(() => {
    const u1 = subscribeToProducts(setProducts);
    const u2 = subscribeToOrders(setOrders);
    const u3 = subscribeToCustomers(setCustomers);
    return () => { u1(); u2(); u3(); };
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Build results from query
  const results = React.useMemo(() => {
    const q = query.trim();
    if (q.length < 2) return [];

    const productHits = products
      .filter(p => matches(p.name, q) || matches(p.sku, q) || matches(p.category, q))
      .slice(0, 4)
      .map(p => ({
        id: `product-${p.id}`,
        type: 'product',
        icon: Package,
        label: p.name,
        sub: p.sku ? `SKU: ${p.sku}` : p.category || 'Product',
        badge: p.status,
        action: () => navigate('/products'),
        color: 'var(--primary)',
      }));

    const orderHits = orders
      .filter(o =>
        matches(o.id, q) ||
        matches(o.customer?.name, q) ||
        matches(o.status, q)
      )
      .slice(0, 4)
      .map(o => ({
        id: `order-${o.id}`,
        type: 'order',
        icon: ShoppingBag,
        label: `Order ${o.id}`,
        sub: o.customer?.name || 'Unknown Customer',
        badge: o.status,
        action: () => navigate('/orders'),
        color: '#6366f1',
      }));

    const customerHits = customers
      .filter(c =>
        matches(c.name, q) ||
        matches(c.email, q) ||
        matches(c.phone, q)
      )
      .slice(0, 4)
      .map(c => ({
        id: `customer-${c.id}`,
        type: 'customer',
        icon: Users,
        label: c.name,
        sub: c.email || c.phone || 'Customer',
        badge: c.status,
        action: () => navigate('/customers'),
        color: '#10b981',
      }));

    return [
      ...(productHits.length ? [{ type: 'heading', label: 'Products' }, ...productHits] : []),
      ...(orderHits.length ? [{ type: 'heading', label: 'Orders' }, ...orderHits] : []),
      ...(customerHits.length ? [{ type: 'heading', label: 'Customers' }, ...customerHits] : []),
    ];
  }, [query, products, orders, customers, navigate]);

  // Flat navigable items for keyboard nav
  const navigableItems = results.filter(r => r.type !== 'heading');

  const handleChange = (e) => {
    setQuery(e.target.value);
    setIsOpen(true);
    setActiveIndex(-1);
  };

  const handleFocus = () => {
    setIsOpen(true);
  };

  const handleKeyDown = (e) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, navigableItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && navigableItems[activeIndex]) {
        selectItem(navigableItems[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setQuery('');
      inputRef.current?.blur();
    }
  };

  const selectItem = useCallback((item) => {
    item.action();
    setQuery('');
    setIsOpen(false);
    setActiveIndex(-1);
  }, []);

  const isEmpty = query.trim().length >= 2 && navigableItems.length === 0;

  // Compute active index relative to navigable items only (skipping headings)
  let navIdx = -1;

  return (
    <div className="global-search-wrapper" ref={containerRef}>
      <div className={`global-search-box ${isOpen && query ? 'focused' : ''}`}>
        <Search size={16} className="global-search-icon" />
        <input
          ref={inputRef}
          type="text"
          className="global-search-input"
          placeholder="Search orders, products, or customers..."
          value={query}
          onChange={handleChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          autoComplete="off"
        />
        {query && (
          <button
            className="global-search-clear"
            onClick={() => { setQuery(''); setIsOpen(false); inputRef.current?.focus(); }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {isOpen && query.trim().length >= 2 && (
        <div className="global-search-dropdown">
          {isEmpty ? (
            <div className="search-empty">
              <Search size={24} opacity={0.2} />
              <span>No results for &ldquo;{query}&rdquo;</span>
            </div>
          ) : (
            results.map((item) => {
              if (item.type === 'heading') {
                return (
                  <div key={`h-${item.label}`} className="search-group-heading">
                    {item.label}
                  </div>
                );
              }
              navIdx++;
              const currentNavIdx = navIdx;
              const isActive = activeIndex === currentNavIdx;
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className={`search-result-item ${isActive ? 'active' : ''}`}
                  onMouseDown={() => selectItem(item)}
                  onMouseEnter={() => setActiveIndex(currentNavIdx)}
                >
                  <div className="search-result-icon" style={{ background: `color-mix(in srgb, ${item.color} 12%, transparent)`, color: item.color }}>
                    <Icon size={14} />
                  </div>
                  <div className="search-result-text">
                    <div className="search-result-label">
                      {highlightMatch(item.label, query)}
                    </div>
                    <div className="search-result-sub">{item.sub}</div>
                  </div>
                  <div className="search-result-arrow">
                    <ArrowRight size={13} />
                  </div>
                </div>
              );
            })
          )}

          <div className="search-footer">
            <span><kbd>↑↓</kbd> navigate</span>
            <span><kbd>↵</kbd> select</span>
            <span><kbd>Esc</kbd> close</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Highlight matching substring in bold
function highlightMatch(text = '', query = '') {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="search-highlight">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export default GlobalSearch;
