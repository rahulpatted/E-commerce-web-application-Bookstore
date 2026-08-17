import React, { useState, useEffect } from 'react';
import { Heart, Trash2, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import { useCart } from '../context/CartContext';
import Loader from '../components/ui/Loader';
import EmptyState from '../components/ui/EmptyState';
import toast from 'react-hot-toast';

const Wishlist: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart } = useCart();

  const fetchWishlist = async () => {
    try {
      setIsLoading(true);
      const data = await api.get('/wishlist/', true);
      setItems(data);
    } catch (error) {
      console.error("Failed to fetch wishlist", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (bookId: string) => {
    try {
      await api.delete(`/wishlist/${bookId}`, true);
      toast.success('Removed from wishlist');
      fetchWishlist(); // refresh
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const handleMoveToCart = async (bookId: string) => {
    try {
      await addToCart(bookId, 1);
      await api.delete(`/wishlist/${bookId}`, true);
      fetchWishlist();
    } catch (error) {
      // Error handled in context
    }
  };

  const formatPrice = (price: number | null) => {
    if (price === null) return 'N/A';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (isLoading) return <Loader fullScreen />;

  if (items.length === 0) {
    return (
      <div className="container section-padding">
        <EmptyState 
          icon={Heart}
          title="Your wishlist is empty"
          description="Save books you'd like to read later by clicking the heart icon on any book."
          actionText="Explore Books"
          actionLink="/books"
        />
      </div>
    );
  }

  return (
    <div className="wishlist-page container section-padding">
      <h1 className="page-title mb-4">My Wishlist</h1>
      
      <div className="wishlist-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px' }}>
        {items.map(item => (
          <div key={item.id} className="wishlist-item-card" style={{ backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: 'var(--border-light)' }}>
            <div style={{ position: 'relative', aspectRatio: '2/3', backgroundColor: 'var(--bg-secondary)' }}>
              <Link to={`/books/${item.book_id}`}>
                {item.book.image ? (
                  <img src={item.book.image} alt={item.book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', color: 'var(--text-light)', fontFamily: 'var(--font-heading)' }}>
                    {item.book.title.charAt(0)}
                  </div>
                )}
              </Link>
              <button 
                onClick={() => handleRemove(item.book_id)}
                style={{ position: 'absolute', top: '12px', right: '12px', width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.9)', color: 'var(--status-error)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}
                title="Remove"
              >
                <Trash2 size={18} />
              </button>
            </div>
            
            <div style={{ padding: '20px' }}>
              <Link to={`/books/${item.book_id}`} style={{ color: 'var(--text-primary)' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.book.title}</h3>
              </Link>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>{item.book.author}</p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '1.2rem' }}>{formatPrice(item.book.price)}</span>
                <button 
                  className="btn-primary" 
                  onClick={() => handleMoveToCart(item.book_id)}
                  style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                  disabled={item.book.stock === 0}
                >
                  <ShoppingCart size={16} /> Add
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
