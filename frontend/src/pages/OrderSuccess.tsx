import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { api } from '../utils/api';
import type { Order } from '../types';
import Loader from '../components/ui/Loader';
import './OrderSuccess.css';

const OrderSuccess: React.FC = () => {
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

  if (isLoading) return <Loader fullScreen />;

  if (!order) {
    return (
      <div className="container section-padding text-center">
        <h2>Order not found</h2>
        <Link to="/orders" className="btn-primary mt-4">View My Orders</Link>
      </div>
    );
  }

  return (
    <div className="order-success-page section-padding">
      <div className="container">
        <div className="success-card animate-slide-up">
          <div className="success-icon-wrapper">
            <CheckCircle size={64} className="success-icon" />
          </div>
          
          <h1 className="success-title">Order Confirmed!</h1>
          <p className="success-desc">
            Thank you for your purchase. Your order #{order.id} has been placed successfully and is being processed.
          </p>
          
          <div className="order-summary-box">
            <h3 className="box-title">Order Details</h3>
            <div className="box-row">
              <span>Order Number</span>
              <span className="font-medium">#{order.id}</span>
            </div>
            <div className="box-row">
              <span>Date</span>
              <span className="font-medium">{new Date(order.created_at).toLocaleDateString()}</span>
            </div>
            <div className="box-row">
              <span>Total Amount</span>
              <span className="font-medium">₹{order.total}</span>
            </div>
            <div className="box-row">
              <span>Payment Method</span>
              <span className="font-medium">{order.payment_method}</span>
            </div>
          </div>
          
          <div className="success-actions">
            <Link to="/orders" className="btn-primary">View Order Status</Link>
            <Link to="/books" className="btn-secondary">Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
