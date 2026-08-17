import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, Star, ShieldCheck, Truck } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../utils/api';
import type { Book } from '../types';
import BookCard from '../components/ui/BookCard';
import Loader from '../components/ui/Loader';
import './Home.css';

const Home: React.FC = () => {
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
  const [recentBooks, setRecentBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setIsLoading(true);
        // Fetch top rated books
        const featured = await api.get('/books/featured?limit=4');
        setFeaturedBooks(featured);
        
        // Fetch newest books
        const recent = await api.get('/books/?sort=newest&limit=4');
        setRecentBooks(recent);
      } catch (error) {
        console.error("Failed to load home data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const categories = [
    { name: 'Fiction', image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop' },
    { name: 'Science Fiction', image: 'https://images.unsplash.com/photo-1614729939124-03290b56c9ce?q=80&w=600&auto=format&fit=crop' },
    { name: 'Business', image: 'https://images.unsplash.com/photo-1554200876-56c2f25224fa?q=80&w=600&auto=format&fit=crop' },
    { name: 'Self Help', image: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?q=80&w=600&auto=format&fit=crop' },
  ];

  if (isLoading) return <Loader fullScreen />;

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container hero-container">
          <motion.div 
            className="hero-content"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="hero-subtitle">Premium Curated Collection</span>
            <h1 className="hero-title">Discover Stories That Stay With You</h1>
            <p className="hero-description">
              Immerse yourself in our carefully selected library of masterpieces. From gripping thrillers to profound non-fiction, find your next great read today.
            </p>
            <div className="hero-actions">
              <Link to="/books" className="btn-primary hero-btn">
                Shop Collection <ArrowRight size={18} />
              </Link>
            </div>
          </motion.div>
          <motion.div 
            className="hero-image-wrapper"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            <div className="hero-image-bg"></div>
            <img 
              src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=800&auto=format&fit=crop" 
              alt="Premium collection of books" 
              className="hero-image"
            />
          </motion.div>
        </div>
      </section>

      {/* Features Banner */}
      <motion.section 
        className="features-banner"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
      >
        <div className="container features-container">
          <div className="feature-item">
            <Truck className="feature-icon" />
            <div>
              <h4 className="feature-title">Free Shipping</h4>
              <p className="feature-desc">On orders over ₹999</p>
            </div>
          </div>
          <div className="feature-item">
            <ShieldCheck className="feature-icon" />
            <div>
              <h4 className="feature-title">Secure Checkout</h4>
              <p className="feature-desc">100% protected payments</p>
            </div>
          </div>
          <div className="feature-item">
            <Star className="feature-icon" />
            <div>
              <h4 className="feature-title">Premium Quality</h4>
              <p className="feature-desc">Carefully curated collection</p>
            </div>
          </div>
          <div className="feature-item">
            <BookOpen className="feature-icon" />
            <div>
              <h4 className="feature-title">Vast Selection</h4>
              <p className="feature-desc">Over 10,000+ titles</p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Featured Books Section */}
      <motion.section 
        className="section-padding"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Trending Now</h2>
              <p className="section-subtitle">Our highest rated masterpieces</p>
            </div>
            <Link to="/books?sort=rating" className="view-all-link">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          
          <div className="books-grid">
            {featuredBooks.map(book => (
              <BookCard key={book._id} book={book} />
            ))}
          </div>
        </div>
      </motion.section>

      {/* Categories Showcase */}
      <motion.section 
        className="categories-section section-padding bg-secondary"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <div className="container">
          <div className="section-header text-center">
            <h2 className="section-title">Explore Categories</h2>
            <p className="section-subtitle">Find books that match your interests</p>
          </div>
          
          <div className="categories-grid">
            {categories.map((cat, index) => (
              <div 
                key={index} 
                className="category-card"
                onClick={() => navigate(`/books?category=${cat.name}`)}
              >
                <img src={cat.image} alt={cat.name} className="category-image" />
                <div className="category-overlay">
                  <h3 className="category-name">{cat.name}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* New Arrivals Section */}
      <motion.section 
        className="section-padding"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">New Arrivals</h2>
              <p className="section-subtitle">Fresh additions to our library</p>
            </div>
            <Link to="/books?sort=newest" className="view-all-link">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          
          <div className="books-grid">
            {recentBooks.map(book => (
              <BookCard key={book._id} book={book} />
            ))}
          </div>
        </div>
      </motion.section>

      {/* Newsletter */}
      <motion.section 
        className="newsletter-section"
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <div className="container newsletter-container">
          <div className="newsletter-content">
            <h2 className="newsletter-title">Join the ShelfVerse Community</h2>
            <p className="newsletter-desc">Subscribe to receive updates, access to exclusive deals, and more.</p>
            <form className="newsletter-form" onSubmit={(e) => { e.preventDefault(); alert('Subscribed!'); }}>
              <input type="email" placeholder="Enter your email address" required className="newsletter-input" />
              <button type="submit" className="btn-primary">Subscribe</button>
            </form>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default Home;
