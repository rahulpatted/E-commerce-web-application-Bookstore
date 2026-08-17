import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Book } from '../../types';
import { useCart } from '../../context/CartContext';
import Rating from './Rating';
import { api } from '../../utils/api';
import toast from 'react-hot-toast';
import './BookCard.css';

interface BookCardProps {
  book: Book;
}

const BookCard: React.FC<BookCardProps> = ({ book }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [wishlisted, setWishlisted] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(book._id, 1);
  };

  const handleAddToWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to use the wishlist');
      navigate('/login');
      return;
    }
    try {
      await api.post(`/wishlist/${book._id}`, {}, true);
      setWishlisted(true);
      toast.success('Added to wishlist!');
    } catch (error: any) {
      if (error.message?.includes('already in wishlist')) {
        toast.error('Already in your wishlist');
      } else {
        toast.error(error.message || 'Failed to add to wishlist');
      }
    }
  };

  // Format price in INR
  const formatPrice = (price: number | null) => {
    if (price === null) return 'N/A';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <motion.div 
      className="book-card"
      whileHover={{ y: -8, scale: 1.02, boxShadow: 'var(--shadow-hover)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <Link to={`/books/${book._id}`} className="book-card-link">
        <div className="book-image-container">
          {book.image ? (
            <img src={book.image} alt={book.title} className="book-image" loading="lazy" />
          ) : (
            <div className="book-image-placeholder">
              <span>{book.title.charAt(0)}</span>
            </div>
          )}
          
          {/* Tags */}
          <div className="book-tags">
            {book.stock !== null && book.stock <= 5 && book.stock > 0 && (
              <span className="badge badge-warning">Only {book.stock} left</span>
            )}
            {book.stock === 0 && (
              <span className="badge badge-error">Out of Stock</span>
            )}
            {book.original_price && book.price && book.original_price > book.price && (
              <span className="badge badge-sale">
                {Math.round((1 - book.price / book.original_price) * 100)}% OFF
              </span>
            )}
          </div>

          {/* Quick Actions Hover */}
          <div className="book-quick-actions">
            <button 
              className={`action-btn wishlist-btn ${wishlisted ? 'wishlisted' : ''}`}
              onClick={handleAddToWishlist}
              title={wishlisted ? "Added to Wishlist" : "Add to Wishlist"}
            >
              <Heart size={20} fill={wishlisted ? 'currentColor' : 'none'} />
            </button>
            <button 
              className="action-btn cart-btn" 
              onClick={handleAddToCart}
              disabled={book.stock === 0}
              title={book.stock === 0 ? "Out of Stock" : "Add to Cart"}
            >
              <ShoppingCart size={20} />
            </button>
          </div>
        </div>

        <div className="book-details">
          <div className="book-category">{book.category || 'Uncategorized'}</div>
          <h3 className="book-title" title={book.title}>{book.title}</h3>
          <p className="book-author">{book.author}</p>
          
          <div className="book-rating-container">
            <Rating value={book.rating || 0} readonly size={14} />
            <span className="rating-value">{book.rating ? book.rating.toFixed(1) : 'No reviews'}</span>
          </div>
          
          <div className="book-price-row">
            <div className="book-price">
              <span className="current-price">{formatPrice(book.price)}</span>
              {book.original_price && book.price && book.original_price > book.price && (
                <span className="original-price">{formatPrice(book.original_price)}</span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default BookCard;
