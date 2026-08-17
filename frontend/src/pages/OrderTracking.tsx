import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, CheckCircle, Truck, MapPin, XCircle, ArrowLeft, Box } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../utils/api';
import type { Order } from '../types';
import Loader from '../components/ui/Loader';
import './OrderTracking.css';

const ORDER_STEPS = [
  { key: 'PENDING', label: 'Order Placed', icon: Clock, desc: 'Your order has been received and is awaiting confirmation.' },
  { key: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle, desc: 'Your order has been confirmed and is being prepared.' },
  { key: 'SHIPPED', label: 'Shipped', icon: Truck, desc: 'Your order is on its way to you.' },
  { key: 'DELIVERED', label: 'Delivered', icon: MapPin, desc: 'Your order has been delivered successfully.' },
];

const getStepIndex = (status: string): number => {
  const upper = status?.toUpperCase() || 'PENDING';
  if (upper === 'CANCELLED') return -1;
  const idx = ORDER_STEPS.findIndex(s => s.key === upper);
  return idx >= 0 ? idx : 0;
};

const OrderTracking: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await api.get(`/orders/${id}`, true);
        setOrder(data);
      } catch (error) {
        console.error('Failed to fetch order', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

  if (isLoading) return <Loader fullScreen />;

  if (!order) {
    return (
      <div className="container section-padding text-center">
        <h2>Order not found</h2>
        <Link to="/orders" className="btn-primary mt-4">View My Orders</Link>
      </div>
    );
  }

  const isCancelled = order.status?.toUpperCase() === 'CANCELLED';
  const currentStep = getStepIndex(order.status);
  const activeStep = ORDER_STEPS[currentStep];

  return (
      <div className="container section-padding">
        <Link to="/orders" className="tracking-back-link">
          <ArrowLeft size={18} /> Back to Orders
        </Link>

        <motion.div
          className="tracking-hero"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="tracking-hero-left">
            <span className="tracking-label">Order</span>
            <h1 className="tracking-order-id">#{order.id}</h1>
            <p className="tracking-date">
              Placed on {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="tracking-hero-right">
            <div className={`tracking-status-chip ${isCancelled ? 'cancelled' : ''}`}>
              {isCancelled ? <XCircle size={18} /> : activeStep?.icon ? React.createElement(activeStep.icon, { size: 18 }) : <Clock size={18} />}
              {isCancelled ? 'Cancelled' : activeStep?.label || order.status}
            </div>
          </div>
        </motion.div>

        {/* Tracking Timeline */}
        {!isCancelled && (
          <motion.div
            className="tracking-timeline-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <h2 className="tracking-section-title">Order Progress</h2>
            <div className="tracking-stepper">
              {ORDER_STEPS.map((step, idx) => {
                const isCompleted = idx <= currentStep;
                const isCurrent = idx === currentStep;
                const StepIcon = step.icon;
                return (
                  <div key={step.key} className={`stepper-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
                    <div className="stepper-icon-wrapper">
                      <div className="stepper-icon">
                        <StepIcon size={22} />
                      </div>
                      {idx < ORDER_STEPS.length - 1 && (
                        <div className={`stepper-line ${idx < currentStep ? 'filled' : ''}`} />
                      )}
                    </div>
                    <div className="stepper-content">
                      <h4 className="stepper-label">{step.label}</h4>
                      <p className="stepper-desc">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {isCancelled && (
          <motion.div
            className="tracking-cancelled-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <XCircle size={48} />
            <h2>This order has been cancelled</h2>
            <p>If you have any questions, please contact our support team.</p>
            <Link to="/support" className="btn-secondary">Contact Support</Link>
          </motion.div>
        )}

        {/* Order Details Grid */}
        <div className="tracking-details-grid">
          <motion.div
            className="tracking-detail-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="detail-card-title"><Box size={18} /> Items Ordered</h3>
            <div className="tracking-items-list">
              {order.items.map(item => (
                <div key={item.id} className="tracking-item">
                  <div className="tracking-item-image">
                    {item.image ? (
                      <img src={item.image} alt={item.title} />
                    ) : (
                      <div className="tracking-item-placeholder">{item.title.charAt(0)}</div>
                    )}
                  </div>
                  <div className="tracking-item-info">
                    <Link to={`/books/${item.book_id}`} className="tracking-item-title">{item.title}</Link>
                    <p className="tracking-item-author">{item.author}</p>
                    <p className="tracking-item-qty">Qty: {item.quantity}</p>
                  </div>
                  <div className="tracking-item-price">{formatPrice(item.price * item.quantity)}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="tracking-sidebar">
            <motion.div
              className="tracking-detail-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h3 className="detail-card-title">Payment Summary</h3>
              <div className="summary-rows">
                <div className="summary-row"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
                <div className="summary-row"><span>Shipping</span><span>{order.shipping_fee === 0 ? 'Free' : formatPrice(order.shipping_fee)}</span></div>
                {order.discount > 0 && <div className="summary-row discount"><span>Discount</span><span>-{formatPrice(order.discount)}</span></div>}
                <div className="summary-row total"><span>Total</span><span>{formatPrice(order.total)}</span></div>
              </div>
              <div className="payment-method-row">
                <span>Payment</span>
                <span className={order.payment_status === 'Paid' ? 'text-success-sm' : 'text-warning-sm'}>
                  {order.payment_status} · {order.payment_method}
                </span>
              </div>
            </motion.div>

            <motion.div
              className="tracking-detail-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <h3 className="detail-card-title"><MapPin size={18} /> Shipping Address</h3>
              <div className="shipping-address">
                <p className="address-name">{order.shipping_name}</p>
                <p>{order.shipping_address}</p>
                <p>{order.shipping_city}, {order.shipping_state} {order.shipping_postal_code}</p>
                <p>{order.shipping_country}</p>
                <p className="address-contact">{order.shipping_phone}</p>
                <p className="address-contact">{order.shipping_email}</p>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="tracking-actions">
          <Link to="/orders" className="btn-secondary">← All Orders</Link>
          <Link to="/books" className="btn-primary">Continue Shopping</Link>
        </div>
      </div>
  );
};

export default OrderTracking;
