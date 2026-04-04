import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  ShoppingBag, 
  Mail, 
  Clock, 
  Truck,
  CreditCard,
  ChevronDown,
  Loader2,
  Printer
} from 'lucide-react';
import './OrderManagementModal.css';
import InvoiceModal from './InvoiceModal';

// API
import { updateOrder } from '../api/orders';
import { initializeTransaction, verifyTransaction } from '../api/paystack';

const OrderManagementModal = ({ isOpen, onClose, order }) => {
  const [loading, setLoading] = useState(false);
  const [orderStatus, setOrderStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [isPaystackProcessing, setIsPaystackProcessing] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);

  useEffect(() => {
    if (order) {
      setOrderStatus(order.status || 'Processing');
      setPaymentStatus(order.payment_status || 'Unpaid');
      setPaymentReference(order.payment_reference || '');
    }
  }, [order, isOpen]);

  if (!isOpen || !order) return null;

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateOrder(order.id, {
        status: orderStatus,
        payment_status: paymentStatus,
        payment_reference: paymentReference
      });
      onClose();
    } catch (error) {
      console.error("Failed to update order:", error);
      alert("Error updating order status.");
    } finally {
      setLoading(false);
    }
  };

  const handleInitializePaystack = async () => {
    setIsPaystackProcessing(true);
    try {
      const amount = parseFloat(order.total?.replace(/[^0-9.-]+/g, "") || 0);
      const data = await initializeTransaction(order.customer?.email || 'guest@example.com', amount, {
        orderId: order.id
      });
      
      // Open the payment URL in a new tab
      window.open(data.authorization_url, '_blank');
      
      // Save the reference automatically
      setPaymentReference(data.reference);
      await updateOrder(order.id, { payment_reference: data.reference });
      
    } catch (error) {
      console.error("Paystack Init Error:", error);
      alert("Failed to initialize Paystack: " + error.message);
    } finally {
      setIsPaystackProcessing(false);
    }
  };

  const handleVerifyPaystack = async () => {
    if (!paymentReference) return alert("No payment reference found.");
    setIsPaystackProcessing(true);
    try {
      const data = await verifyTransaction(paymentReference);
      if (data.status === 'success') {
        setPaymentStatus('Paid');
        await updateOrder(order.id, { 
          payment_status: 'Paid',
          status: 'Processing' // Move to processing automatically
        });
        alert("Payment verified successfully!");
      } else {
        alert(`Payment status: ${data.status}`);
      }
    } catch (error) {
      console.error("Paystack Verify Error:", error);
      alert("Verification failed: " + error.message);
    } finally {
      setIsPaystackProcessing(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Manage Order {order.id}</div>
          <div className="modal-close" onClick={onClose}>
            <X size={20} />
          </div>
        </div>

        <div className="modal-body">
          <div className="section">
            <div className="section-header">
              <div>
                <div className="section-title">Order Summary</div>
                <div className="section-subtitle">Review core details and customer information.</div>
              </div>
            </div>
            
            <div className="details-grid-custom">
              <div className="section-panel">
                <div className="detail-group">
                  <div className="detail-label">Customer</div>
                  <div className="detail-value">{order.customer?.name || 'Guest'}</div>
                  <div className="detail-subvalue">{order.customer?.email || 'No email provided'}</div>
                  <div className="detail-subvalue">{order.customer?.phone || 'No phone'}</div>
                </div>
                <div className="detail-group">
                  <div className="detail-label">Shipping Address</div>
                  <div className="detail-value">{order.address || 'N/A'}</div>
                </div>
              </div>
              
              <div className="section-panel">
                <div className="detail-group">
                  <div className="detail-label">Order Info</div>
                  <div className="detail-value">
                    {order.orderDate?.toDate ? order.orderDate.toDate().toLocaleString() : new Date(order.orderDate).toLocaleString()}
                  </div>
                  <div className="detail-subvalue">Method: {order.shippingMethod || 'Standard'}</div>
                </div>
                <div className="detail-group">
                  <div className="detail-label">Payment Details</div>
                  <div className="detail-value">{order.paymentMethod || 'Credit Card'}</div>
                </div>
              </div>
            </div>
            
            <div className="section-panel">
              <div className="order-items">
                {order.items?.map((item, idx) => (
                   <div key={idx} className="order-item">
                    <div className="item-img">
                      <img src={item.image || 'https://via.placeholder.com/48'} alt={item.name} />
                    </div>
                    <div className="item-details">
                      <div className="item-name">{item.name}</div>
                      <div className="item-meta">Qty: {item.quantity} • {item.variant || 'Default'}</div>
                    </div>
                    <div className="item-price">{item.price}</div>
                  </div>
                ))}
              </div>
              <div className="order-totals">
                <div className="total-row"><span>Subtotal</span><span>{order.subtotal || order.total}</span></div>
                <div className="total-row"><span>Shipping</span><span>$0.00</span></div>
                <div className="total-row total-final"><span>Total</span><span>{order.total}</span></div>
              </div>
            </div>
          </div>

          <div className="section">
            <div className="section-header">
              <div className="section-title">Update Order Status</div>
            </div>
            <div className="section-panel">
              <div className="form-grid-custom">
                <div className="form-group">
                  <div className="form-label">Payment Status</div>
                  <div className="select-wrapper">
                    <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}>
                      <option value="Paid">Paid</option>
                      <option value="Pending">Pending</option>
                      <option value="Refunded">Refunded</option>
                      <option value="Failed">Failed</option>
                    </select>
                    <ChevronDown className="chevron-icon" size={16} />
                  </div>
                </div>
                <div className="form-group">
                  <div className="form-label">Order Status</div>
                  <div className="select-wrapper">
                    <select value={orderStatus} onChange={(e) => setOrderStatus(e.target.value)}>
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                    <ChevronDown className="chevron-icon" size={16} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="section">
            <div className="section-header">
              <div className="section-title">Payment Gateway (Paystack)</div>
            </div>
            <div className="section-panel paystack-panel">
              <div className="paystack-actions">
                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <div className="form-label">Transaction Reference</div>
                  <div className="form-input">
                    <input 
                       type="text" 
                       placeholder="Click Generate or enter reference..." 
                       value={paymentReference}
                       onChange={(e) => setPaymentReference(e.target.value)}
                    />
                  </div>
                </div>
                <div className="paystack-buttons" style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    className="btn btn-outline" 
                    style={{ flex: 1 }}
                    onClick={handleInitializePaystack}
                    disabled={isPaystackProcessing}
                  >
                    {isPaystackProcessing ? <Loader2 className="animate-spin" size={16} /> : <CreditCard size={16} />}
                    Generate Link
                  </button>
                  <button 
                    className="btn btn-primary" 
                    style={{ flex: 1 }}
                    onClick={handleVerifyPaystack}
                    disabled={isPaystackProcessing || !paymentReference}
                  >
                    {isPaystackProcessing ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                    Verify Payment
                  </button>
                </div>
              </div>
              <p className="section-subtitle mt-2" style={{ fontSize: '12px', marginTop: '12px' }}>
                Generate a secure Paystack checkout link or manually verify a reference for this order.
              </p>
            </div>
          </div>

          <div className="section">
            <div className="section-header">
              <div className="section-title">Order History</div>
            </div>
            <div className="section-panel">
              <div className="timeline">
                <div className="timeline-item">
                  <div className="timeline-icon success">
                    <Check size={14} />
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-title">Payment Verified</div>
                    <div className="timeline-time">Automatically Syncing...</div>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-icon">
                    <ShoppingBag size={14} />
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-title">Order Placed</div>
                    <div className="timeline-time">Original Recording</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <div className="flex gap-2">
            <button className="btn btn-outline" onClick={() => setShowInvoice(true)}>
              <Printer size={16} />
              Print Invoice
            </button>
            <button className="btn btn-outline" onClick={() => console.log('Notify')}>
              <Mail size={16} />
              Notify User
            </button>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-subtle" onClick={onClose} disabled={loading}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Saving...
                </>
              ) : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      <InvoiceModal 
        isOpen={showInvoice}
        onClose={() => setShowInvoice(false)}
        order={order}
      />
    </div>
  );
};

export default OrderManagementModal;

