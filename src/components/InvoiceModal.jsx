import React from 'react';
import { X, Printer, Download, CreditCard } from 'lucide-react';
import './InvoiceModal.css';

// Context
import { useCurrency } from '../hooks/useCurrency';

const InvoiceModal = ({ isOpen, onClose, order }) => {
  const { formatPrice } = useCurrency();
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const calculateSubtotal = () => {
    return order.items?.reduce((sum, item) => {
      const price = typeof item.price === 'string' 
        ? parseFloat(item.price.replace(/[^0-9.-]+/g, "") || 0)
        : Number(item.price || 0);
      return sum + (price * (item.quantity || 1));
    }, 0) || 0;
  };

  const getInvoiceDate = () => {
    if (order.orderDate?.toDate) return order.orderDate.toDate().toLocaleDateString();
    const rawDate = order.order_date || order.orderDate;
    if (rawDate) return new Date(rawDate).toLocaleDateString();
    return 'Unknown Date';
  };

  const invoiceDate = getInvoiceDate();

  return (
    <div className="invoice-modal-backdrop" onClick={onClose}>
      <div className="invoice-modal" onClick={e => e.stopPropagation()}>
        {/* Modal Toolbar (Hidden on Print) */}
        <div className="invoice-toolbar no-print">
          <div className="toolbar-left">
            <h2 className="toolbar-title">Invoice Preview</h2>
          </div>
          <div className="toolbar-actions">
            <button className="btn btn-outline" onClick={handlePrint}>
              <Printer size={16} />
              Print Invoice
            </button>
            <button className="btn btn-subtle" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Actual Invoice Content */}
        <div className="invoice-document" id="invoice-capture">
          {/* Header */}
          <div className="invoice-header">
            <div className="invoice-brand">
              <div className="brand-logo">
                <div className="logo-symbol">GG</div>
                <span className="logo-text">GO GADGET STORE</span>
              </div>
              <div className="brand-address">
                123 Tech Avenue, Silicon District<br />
                Lagos, Nigeria<br />
                support@gogadget.shop
              </div>
            </div>
            <div className="invoice-meta">
              <h1 className="invoice-title">INVOICE</h1>
              <div className="meta-details">
                <div className="meta-row">
                  <span className="meta-label">Invoice #:</span>
                  <span className="meta-value">{order.id?.substring(0, 8).toUpperCase()}</span>
                </div>
                <div className="meta-row">
                  <span className="meta-label">Order Date:</span>
                  <span className="meta-value">{invoiceDate}</span>
                </div>
                <div className="meta-row">
                  <span className="meta-label">Order ID:</span>
                  <span className="meta-value">#{order.id}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="invoice-divider" />

          {/* Addresses */}
          <div className="invoice-addresses">
            <div className="address-block">
              <h3 className="address-title">Bill To:</h3>
              <div className="address-content">
                <strong>{order.customer?.name || 'Valued Customer'}</strong><br />
                {order.customer?.email || 'N/A'}<br />
                {order.customer?.phone || 'N/A'}
              </div>
            </div>
            <div className="address-block">
              <h3 className="address-title">Ship To:</h3>
              <div className="address-content">
                {order.address || 'Standard Shipping Address'}<br />
                Method: {order.shippingMethod || 'Standard Delivery'}
              </div>
            </div>
          </div>

          {/* Table */}
          <table className="invoice-table">
            <thead>
              <tr>
                <th>Description</th>
                <th className="text-right">Quantity</th>
                <th className="text-right">Price</th>
                <th className="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item, idx) => {
                const itemPrice = typeof item.price === 'string' 
                  ? parseFloat(item.price.replace(/[^0-9.-]+/g, "") || 0)
                  : Number(item.price || 0);
                return (
                  <tr key={idx}>
                    <td>
                      <div className="item-info">
                        <span className="item-name">{item.name}</span>
                        <span className="item-variant">{item.variant || 'Default'}</span>
                      </div>
                    </td>
                    <td className="text-right">{item.quantity}</td>
                    <td className="text-right">{formatPrice(itemPrice)}</td>
                    <td className="text-right">
                      {formatPrice(itemPrice * (item.quantity || 1))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Totals Section */}
          <div className="invoice-bottom">
            <div className="invoice-notes">
              <h3 className="notes-title">Payment Information</h3>
              <div className="payment-details">
                <div className="payment-row">
                  <span className="payment-label">Method:</span>
                  <span className="payment-value">{order.paymentMethod || 'Credit Card'}</span>
                </div>
                <div className="payment-row">
                  <span className="payment-label">Status:</span>
                  <span className={`payment-value status-${(order.payment_status || order.paymentStatus || 'Unpaid').toLowerCase()}`}>
                    {order.payment_status || order.paymentStatus || 'Unpaid'}
                  </span>
                </div>
              </div>
              <div className="thanks-msg">
                Thank you for your business! Reach out to us if you have any questions about this invoice.
              </div>
            </div>

            <div className="invoice-summary">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>{formatPrice(calculateSubtotal())}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>{formatPrice(0)}</span>
              </div>
              <div className="summary-row">
                <span>Discount</span>
                <span>{formatPrice(0)}</span>
              </div>
              <div className="summary-divider" />
              <div className="summary-row total">
                <span>Total Amount</span>
                <span>{formatPrice(order.total_amount || calculateSubtotal())}</span>
              </div>
            </div>
          </div>

          <div className="invoice-footer">
            <p>GO GADGET STORE • www.gogadget.shop</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
