import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Search, ShoppingCart, User, Menu, X, LogOut, Shield, Heart, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import './Navbar.css';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Books', path: '/books' },
    { name: 'Categories', path: '/books?category=all' },
    { name: 'About', path: '/about' },
  ];

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled glass' : ''}`}>
      <div className="container navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-brand">
          <BookOpen className="brand-icon" />
          <span className="brand-text">ShelfVerse</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="navbar-links desktop-only">
          {navLinks.map((link) => (
            <Link 
              key={link.path} 
              to={link.path}
              className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Actions (Search, Cart, Profile) */}
        <div className="navbar-actions">
            <button className="icon-button" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} aria-label="Toggle Theme">
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            <button className="icon-button" onClick={() => navigate('/books')} aria-label="Search">
              <Search size={20} />
            </button>
            
            {user && (
              <Link to="/wishlist" className="icon-button" aria-label="Wishlist">
                <Heart size={20} />
              </Link>
            )}
            
            <Link to="/cart" className="icon-button cart-button" aria-label="Cart">
              <ShoppingCart size={20} />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>

            {user ? (
              <div className="profile-dropdown-container">
                <button 
                  className="icon-button profile-trigger" 
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  aria-expanded={isProfileMenuOpen}
                >
                  <div className="avatar-small">
                    {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                  </div>
                </button>
                
                {isProfileMenuOpen && (
                  <div className="profile-dropdown">
                    <div className="dropdown-header">
                      <p className="dropdown-name">{user.name || user.email.split('@')[0]}</p>
                      <p className="dropdown-email">{user.email}</p>
                    </div>
                    <div className="dropdown-divider"></div>
                    
                    {user.role === 'ADMIN' && (
                      <Link to="/admin" className="dropdown-item">
                        <Shield size={16} /> Admin Dashboard
                      </Link>
                    )}
                    
                    <Link to="/profile" className="dropdown-item">
                      <User size={16} /> Profile
                    </Link>
                    {user.role !== 'ADMIN' && (
                      <Link to="/orders" className="dropdown-item">
                        <ShoppingCart size={16} /> Orders
                      </Link>
                    )}
                    
                    <div className="dropdown-divider"></div>
                    <button onClick={handleLogout} className="dropdown-item text-error">
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="login-button desktop-only">
                Sign In
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button 
              className="icon-button mobile-only" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-menu">
          {navLinks.map((link) => (
            <Link 
              key={link.path} 
              to={link.path}
              className="mobile-nav-link"
            >
              {link.name}
            </Link>
          ))}
          {!user && (
            <Link to="/login" className="mobile-nav-link login-mobile">
              Sign In / Register
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
