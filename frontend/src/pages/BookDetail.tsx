import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, ArrowLeft, Check, AlertCircle } from 'lucide-react';
import { api } from '../utils/api';
import type { Book } from '../types';
import { useCart } from '../context/CartContext';
import Rating from '../components/ui/Rating';
import Loader from '../components/ui/Loader';
import BookCard from '../components/ui/BookCard';
import toast from 'react-hot-toast';
import './BookDetail.css';

const BookDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [relatedBooks, setRelatedBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [ratingVal, setRatingVal] = useState(5);
  const [wishlisted, setWishlisted] = useState(false);

  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookData = async () => {
      try {
        setIsLoading(true);
        window.scrollTo(0, 0);
        
        const bookData = await api.get(`/books/${id}`);
        setBook(bookData);
        
        // Log view
        try {
          // Fire and forget, don't wait for it
          api.post(`/books/${id}/view`, {}, true);
        } catch (e) {
          // Ignore if not logged in or fails
        }
        
        // Fetch related books
        const relatedData = await api.get(`/books/${id}/related?limit=4`);
        setRelatedBooks(relatedData);
      } catch (error) {
        console.error("Failed to load book details", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchBookData();
    }
  }, [id]);

  const handleAddToCart = async () => {
    if (!book) return;
    try {
      setIsAdding(true);
      await addToCart(book._id, quantity);
    } finally {
      setIsAdding(false);
    }
  };

  const handleRate = async () => {
    if (!book) return;
    try {
      const res = await api.post(`/books/${book._id}/rate`, { rating: ratingVal }, true);
      alert('Thank you for rating!');
      setBook({ ...book, rating: res.new_average_rating });
    } catch (error: any) {
      alert(error.message || 'Failed to rate. Please log in.');
    }
  };

  if (isLoading) return <Loader fullScreen />;
  if (!book) return (
    <div className="container section-padding text-center">
      <h2>Book not found</h2>
      <Link to="/books" className="btn-primary mt-4">Return to Catalog</Link>
    </div>
  );

  const formatPrice = (price: number | null) => {
    if (price === null) return 'N/A';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="book-detail-page">
      <div className="container">
        <Link to="/books" className="back-link">
          <ArrowLeft size={16} /> Back to Catalog
        </Link>
        
        <div className="book-detail-layout">
          {/* Image Section */}
          <div className="book-detail-image-wrapper">
            {book.image ? (
              <img src={book.image} alt={book.title} className="book-detail-image" />
            ) : (
              <div className="book-image-placeholder">
                <span>{book.title.charAt(0)}</span>
              </div>
            )}
          </div>
          
          {/* Info Section */}
          <div className="book-detail-info">
            <div className="book-category-tag">{book.category || 'Uncategorized'}</div>
            <h1 className="book-title-lg">{book.title}</h1>
            <h2 className="book-author-lg">by {book.author}</h2>
            
            <div className="book-rating-row">
              <Rating value={book.rating || 0} readonly size={18} />
              <span className="rating-text">
                {book.rating ? `${book.rating.toFixed(1)} / 5.0` : 'No reviews yet'}
              </span>
            </div>
            
            <div className="book-price-lg">
              <span className="current-price-lg">{formatPrice(book.price)}</span>
              {book.original_price && book.price && book.original_price > book.price && (
                <span className="original-price-lg">{formatPrice(book.original_price)}</span>
              )}
            </div>
            
            <div className="book-description">
              <p>{book.description || 'No description available for this book.'}</p>
            </div>
            
            <div className="book-meta-grid">
              {book.publisher && (
                <div className="meta-item">
                  <span className="meta-label">Publisher</span>
                  <span className="meta-value">{book.publisher}</span>
                </div>
              )}
              {book.language && (
                <div className="meta-item">
                  <span className="meta-label">Language</span>
                  <span className="meta-value">{book.language}</span>
                </div>
              )}
              {book.pages && (
                <div className="meta-item">
                  <span className="meta-label">Pages</span>
                  <span className="meta-value">{book.pages}</span>
                </div>
              )}
              {book.isbn && (
                <div className="meta-item">
                  <span className="meta-label">ISBN</span>
                  <span className="meta-value">{book.isbn}</span>
                </div>
              )}
            </div>
            
            <div className="stock-status-container">
              {book.stock !== null && book.stock > 10 ? (
                <div className="stock-status in-stock">
                  <Check size={18} /> In Stock ({book.stock} available)
                </div>
              ) : book.stock !== null && book.stock > 0 ? (
                <div className="stock-status low-stock">
                  <AlertCircle size={18} /> Low Stock (Only {book.stock} left)
                </div>
              ) : (
                <div className="stock-status out-of-stock">
                  <AlertCircle size={18} /> Out of Stock
                </div>
              )}
            </div>
            
            <div className="purchase-actions">
              <div className="quantity-selector">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || book.stock === 0}
                >-</button>
                <input 
                  type="number" 
                  value={quantity} 
                  readOnly 
                />
                <button 
                  onClick={() => setQuantity(Math.min(book.stock || 99, quantity + 1))}
                  disabled={book.stock === null || quantity >= book.stock}
                >+</button>
              </div>
              
              <button 
                className="btn-primary add-to-cart-btn"
                onClick={handleAddToCart}
                disabled={isAdding || book.stock === 0}
              >
                <ShoppingCart size={20} /> 
                {isAdding ? 'Adding...' : 'Add to Cart'}
              </button>
              
              <button 
                className={`btn-secondary wishlist-icon-btn ${wishlisted ? 'wishlisted' : ''}`}
                title={wishlisted ? "Added to Wishlist" : "Add to Wishlist"}
                onClick={async () => {
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
                }}
              >
                <Heart size={20} fill={wishlisted ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Simple Rating Interface */}
            <div className="rate-book-section">
              <h4>Rate this book</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                <Rating value={ratingVal} onChange={setRatingVal} size={24} />
                <button onClick={handleRate} className="btn-secondary" style={{ padding: '6px 16px', fontSize: '0.85rem' }}>Submit</button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Related Books */}
        {relatedBooks.length > 0 && (
          <div className="related-books section-padding">
            <h2 className="section-title">You might also like</h2>
            <div className="books-grid mt-4">
              {relatedBooks.map(b => (
                <BookCard key={b.id} book={b} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookDetail;
