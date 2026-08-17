import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import EmptyState from '../components/ui/EmptyState';
import Loader from '../components/ui/Loader';
import './Cart.css';

const Cart: React.FC = () => {
  const { items, isLoading, updateQuantity, removeFromCart, clearCart, cartTotal } = useCart();
  const navigate = useNavigate();

  if (isLoading && items.length === 0) return <Loader />;

  if (items.length === 0) {
    return (
      <div className="container section-padding">
        <EmptyState 
          icon={ShoppingCart}
          title="Your cart is empty"
          description="Looks like you haven't added any books to your cart yet. Explore our collection to find your next great read."
          actionText="Browse Books"
          actionLink="/books"
        />
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const shippingFee = cartTotal >= 999 ? 0 : 49;
  const finalTotal = cartTotal + shippingFee;

  return (
    <div className="cart-page container section-padding">
      <h1 className="page-title mb-4">Your Shopping Cart</h1>
      
      <div className="cart-layout">
        <div className="cart-items-section">
          <div className="cart-header">
            <span>Product</span>
            <span>Quantity</span>
            <span>Total</span>
          </div>
          
          <div className="cart-items-list">
            {items.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-product">
                  <Link to={`/books/${item.book_id}`}>
                    <img 
                      src={item.book.image || ''} 
                      alt={item.book.title} 
                      className="cart-item-image" 
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  </Link>
                  <div className="cart-item-info">
                    <Link to={`/books/${item.book_id}`} className="cart-item-title">
                      {item.book.title}
                    </Link>
                    <div className="cart-item-author">{item.book.author}</div>
                    <div className="cart-item-price">{formatPrice(item.book.price || 0)}</div>
                  </div>
                </div>
                
                <div className="cart-item-actions">
                  <div className="quantity-selector small">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                    <input type="number" value={item.quantity} readOnly />
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.book.stock !== null && item.quantity >= item.book.stock}
                    >+</button>
                  </div>
                  <button 
                    className="remove-btn" 
                    onClick={() => removeFromCart(item.id)}
                    title="Remove item"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                
                <div className="cart-item-total">
                  {formatPrice((item.book.price || 0) * item.quantity)}
                </div>
              </div>
            ))}
          </div>
          
          <div className="cart-actions mt-4">
            <Link to="/books" className="btn-secondary">Continue Shopping</Link>
            <button className="btn-secondary text-error" onClick={clearCart}>Clear Cart</button>
          </div>
        </div>
        
        <div className="cart-summary-section">
          <div className="cart-summary">
            <h3>Order Summary</h3>
            
            <div className="summary-row">
              <span>Subtotal ({items.reduce((acc, item) => acc + item.quantity, 0)} items)</span>
              <span>{formatPrice(cartTotal)}</span>
            </div>
            
            <div className="summary-row">
              <span>Shipping</span>
              <span>{shippingFee === 0 ? <span className="text-success">Free</span> : formatPrice(shippingFee)}</span>
            </div>
            
            {shippingFee > 0 && (
              <div className="shipping-notice">
                Add {formatPrice(999 - cartTotal)} more for free shipping
              </div>
            )}
            
            <div className="summary-divider"></div>
            
            <div className="summary-row total-row">
              <span>Total</span>
              <span>{formatPrice(finalTotal)}</span>
            </div>
            
            <button 
              className="btn-primary w-100 mt-4 checkout-btn"
              onClick={() => navigate('/checkout')}
            >
              Proceed to Checkout <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
