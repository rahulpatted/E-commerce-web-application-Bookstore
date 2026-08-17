import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CreditCard, Truck, ArrowLeft, Lock } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import toast from 'react-hot-toast';
import './Cart.css'; // Reusing some cart layout styles
import './Checkout.css';

const Checkout: React.FC = () => {
  const { items, cartTotal, isLoading } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    shipping_name: user?.name || '',
    shipping_email: user?.email || '',
    shipping_phone: user?.phone || '',
    shipping_address: user?.address || '',
    shipping_city: user?.city || '',
    shipping_state: user?.state || '',
    shipping_postal_code: user?.postal_code || '',
    shipping_country: user?.country || 'India',
    payment_method: 'COD'
  });

  useEffect(() => {
    if (!isLoading && items.length === 0) {
      toast.error('Your cart is empty');
      navigate('/cart');
    }
  }, [items, isLoading, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const order = await api.post('/orders/', formData, true);
      toast.success('Order placed successfully!');
      navigate(`/order-success/${order.id}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to place order');
    } finally {
      setIsSubmitting(false);
    }
  };

  React.useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        shipping_name: user.name || '',
        shipping_email: user.email || '',
        shipping_phone: user.phone || '',
        shipping_address: user.address || '',
        shipping_city: user.city || '',
        shipping_state: user.state || '',
        shipping_postal_code: user.postal_code || '',
        shipping_country: user.country || 'India',
      }));
    }
  }, [user]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (items.length === 0) return null;

  const shippingFee = cartTotal >= 999 ? 0 : 49;
  const finalTotal = cartTotal + shippingFee;

  return (
    <div className="checkout-page container section-padding">
      <Link to="/cart" className="back-link">
        <ArrowLeft size={16} /> Back to Cart
      </Link>
      
      <h1 className="page-title mb-4">Checkout</h1>
      
      <div className="cart-layout">
        <div className="checkout-form-section">
          <form id="checkout-form" onSubmit={handleSubmit}>
            
            {/* Shipping Info */}
            <div className="checkout-section">
              <h3 className="checkout-section-title">
                <Truck size={20} /> Shipping Information
              </h3>
              
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="shipping_name">Full Name</label>
                  <input 
                    type="text" 
                    id="shipping_name" 
                    name="shipping_name"
                    value={formData.shipping_name}
                    onChange={handleChange}
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="shipping_phone">Phone Number</label>
                  <input 
                    type="tel" 
                    id="shipping_phone" 
                    name="shipping_phone"
                    value={formData.shipping_phone}
                    onChange={handleChange}
                    required 
                  />
                </div>
                
                <div className="form-group full-width">
                  <label htmlFor="shipping_address">Address</label>
                  <input 
                    type="text" 
                    id="shipping_address" 
                    name="shipping_address"
                    value={formData.shipping_address}
                    onChange={handleChange}
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="shipping_city">City</label>
                  <input 
                    type="text" 
                    id="shipping_city" 
                    name="shipping_city"
                    value={formData.shipping_city}
                    onChange={handleChange}
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="shipping_state">State</label>
                  <input 
                    type="text" 
                    id="shipping_state" 
                    name="shipping_state"
                    value={formData.shipping_state}
                    onChange={handleChange}
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="shipping_postal_code">Postal Code</label>
                  <input 
                    type="text" 
                    id="shipping_postal_code" 
                    name="shipping_postal_code"
                    value={formData.shipping_postal_code}
                    onChange={handleChange}
                    required 
                  />
                </div>
              </div>
            </div>
            
            {/* Payment Info */}
            <div className="checkout-section mt-4">
              <h3 className="checkout-section-title">
                <CreditCard size={20} /> Payment Method
              </h3>
              
              <div className="payment-options">
                <label className={`payment-option ${formData.payment_method === 'COD' ? 'selected' : ''}`}>
                  <input 
                    type="radio" 
                    name="payment_method" 
                    value="COD"
                    checked={formData.payment_method === 'COD'}
                    onChange={handleChange}
                  />
                  <div className="payment-option-content">
                    <span className="payment-name">Cash on Delivery</span>
                    <span className="payment-desc">Pay when your order arrives</span>
                  </div>
                </label>
                
                <label className={`payment-option ${formData.payment_method === 'RAZORPAY' ? 'selected' : ''}`}>
                  <input 
                    type="radio" 
                    name="payment_method" 
                    value="RAZORPAY"
                    checked={formData.payment_method === 'RAZORPAY'}
                    onChange={handleChange}
                  />
                  <div className="payment-option-content">
                    <span className="payment-name">Credit/Debit Card</span>
                    <span className="payment-desc">Secure online payment</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="cart-summary-section">
              <div className="cart-summary">
                <h3>Order Summary</h3>
                
                <div className="checkout-items-preview mb-4">
                  {items.map(item => (
                    <div key={item.id} className="checkout-item-preview">
                      <span className="checkout-item-title">{item.quantity}x {item.book.title}</span>
                      <span>{formatPrice((item.book.price || 0) * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                
                <div className="summary-divider"></div>
                
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                
                <div className="summary-row">
                  <span>Shipping</span>
                  <span>{shippingFee === 0 ? <span className="text-success">Free</span> : formatPrice(shippingFee)}</span>
                </div>
                
                <div className="summary-divider"></div>
                
                <div className="summary-row total-row">
                  <span>Total</span>
                  <span>{formatPrice(finalTotal)}</span>
                </div>
                
                <button 
                  type="submit"
                  className="btn-primary w-100 mt-4 checkout-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Processing...' : 'Place Order'}
                </button>
                <p className="secure-checkout-text">
                  <Lock size={14} /> Secure Checkout
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
