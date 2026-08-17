import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, CheckCircle, Truck, XCircle, ChevronRight } from 'lucide-react';
import { api } from '../utils/api';
import type { Order } from '../types';
import Loader from '../components/ui/Loader';
import EmptyState from '../components/ui/EmptyState';
import './Orders.css';

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await api.get('/orders/', true);
        setOrders(data);
      } catch (error) {
        console.error("Failed to load orders", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending': return <Clock size={18} className="text-warning" />;
      case 'Confirmed': return <CheckCircle size={18} className="text-info" />;
      case 'Processing': return <Package size={18} className="text-info" />;
      case 'Shipped': return <Truck size={18} className="text-primary" />;
      case 'Delivered': return <CheckCircle size={18} className="text-success" />;
      case 'Cancelled': return <XCircle size={18} className="text-error" />;
      default: return <Clock size={18} />;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Pending': return 'status-warning';
      case 'Confirmed':
      case 'Processing': return 'status-info';
      case 'Shipped': return 'status-primary';
      case 'Delivered': return 'status-success';
      case 'Cancelled': return 'status-error';
      default: return '';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (isLoading) return <Loader fullScreen />;

  if (orders.length === 0) {
    return (
      <div className="container section-padding">
        <EmptyState 
          icon={Package}
          title="No orders yet"
          description="You haven't placed any orders yet. Once you do, you can track their status here."
          actionText="Start Shopping"
          actionLink="/books"
        />
      </div>
    );
  }

  return (
    <div className="orders-page container section-padding">
      <h1 className="page-title mb-4">Order History</h1>
      
      <div className="orders-list">
        {orders.map(order => (
          <div key={order.id} className="order-card animate-fade-in">
            <div className="order-header">
              <div className="order-meta">
                <div className="order-id">Order #{order.id}</div>
                <div className="order-date">{new Date(order.created_at).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric'
                })}</div>
              </div>
              <div className={`order-status-badge ${getStatusClass(order.status)}`}>
                {getStatusIcon(order.status)}
                {order.status}
              </div>
            </div>
            
            <div className="order-items-preview">
              <div className="items-images">
                {order.items.slice(0, 4).map(item => (
                  <div key={item.id} className="item-image-mini-wrapper" title={item.title}>
                    {item.image ? (
                      <img src={item.image} alt={item.title} className="item-image-mini" />
                    ) : (
                      <div className="item-image-placeholder-mini">{item.title.charAt(0)}</div>
                    )}
                    {item.quantity > 1 && <span className="item-qty-badge">{item.quantity}</span>}
                  </div>
                ))}
                {order.items.length > 4 && (
                  <div className="more-items-badge">+{order.items.length - 4}</div>
                )}
              </div>
              
              <div className="order-total-info">
                <span className="total-label">Total Amount</span>
                <span className="total-value">{formatPrice(order.total)}</span>
              </div>
            </div>
            
            <div className="order-footer">
              <div className="order-payment">
                Payment: <span className={order.payment_status === 'Paid' ? 'text-success' : 'text-warning'}>
                  {order.payment_status}
                </span> ({order.payment_method})
              </div>
              <Link to={`/order-success/${order.id}`} className="view-details-btn">
                View Details <ChevronRight size={16} />
              </Link>
              <Link to={`/orders/${order.id}/track`} className="track-order-btn" style={{ marginLeft: '8px', padding: '6px 12px', backgroundColor: '#C5A880', color: '#fff', borderRadius: '6px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                Track Order <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
