import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { api } from '../utils/api';
import type { Book } from '../types';
import BookCard from '../components/ui/BookCard';
import Loader from '../components/ui/Loader';
import EmptyState from '../components/ui/EmptyState';
import './Books.css';

const Books: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [sort, setSort] = useState(searchParams.get('sort') || 'rating');
  const [inStock, setInStock] = useState(searchParams.get('in_stock') === 'true');

  useEffect(() => {
    // Fetch categories once
    const fetchCategories = async () => {
      try {
        const data = await api.get('/books/categories');
        setCategories(data);
      } catch (error) {
        console.error("Failed to load categories", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setIsLoading(true);
        let endpoint = '/books/?limit=100';
        
        if (searchQuery) endpoint += `&q=${encodeURIComponent(searchQuery)}`;
        if (category && category !== 'all') endpoint += `&category=${encodeURIComponent(category)}`;
        if (sort) endpoint += `&sort=${sort}`;
        if (inStock) endpoint += `&in_stock=true`;

        const data = await api.get(endpoint);
        setBooks(data);
      } catch (error) {
        console.error("Failed to load books", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, [searchQuery, category, sort, inStock]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams();
  };

  const updateParams = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (category !== 'all') params.set('category', category);
    if (sort !== 'rating') params.set('sort', sort);
    if (inStock) params.set('in_stock', 'true');
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setCategory('all');
    setSort('rating');
    setInStock(false);
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="books-page container section-padding">
      <div className="page-header">
        <h1 className="page-title">Shop Collection</h1>
        <p className="page-subtitle">Discover our entire catalog of premium books</p>
      </div>

      <div className="catalog-layout">
        {/* Mobile Filter Toggle */}
        <button 
          className="btn-secondary mobile-filter-toggle"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
        >
          <SlidersHorizontal size={20} />
          {isFilterOpen ? 'Close Filters' : 'Filters & Sorting'}
        </button>

        {/* Sidebar Filters */}
        <aside className={`catalog-sidebar ${isFilterOpen ? 'open' : ''}`}>
          <div className="sidebar-header mobile-only">
            <h3>Filters</h3>
            <button className="icon-button" onClick={() => setIsFilterOpen(false)}>
              <X size={24} />
            </button>
          </div>

          <div className="filter-group">
            <h4 className="filter-title">Search</h4>
            <form onSubmit={handleSearch} className="search-form">
              <div className="input-with-icon">
                <Search className="input-icon" size={18} />
                <input 
                  type="text" 
                  placeholder="Title, author, or keyword..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>
          </div>

          <div className="filter-group">
            <h4 className="filter-title">Sort By</h4>
            <select 
              value={sort} 
              onChange={(e) => {
                setSort(e.target.value);
                // We'll let the useEffect handle fetching, but we should update URL
                setTimeout(updateParams, 0);
              }}
              className="filter-select"
            >
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="title">Title: A-Z</option>
            </select>
          </div>

          <div className="filter-group">
            <h4 className="filter-title">Categories</h4>
            <div className="category-list">
              <button 
                className={`category-btn ${category === 'all' ? 'active' : ''}`}
                onClick={() => {
                  setCategory('all');
                  setTimeout(updateParams, 0);
                }}
              >
                All Categories
              </button>
              {categories.map(c => (
                <button 
                  key={c}
                  className={`category-btn ${category === c ? 'active' : ''}`}
                  onClick={() => {
                    setCategory(c);
                    setTimeout(updateParams, 0);
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <h4 className="filter-title">Availability</h4>
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={inStock}
                onChange={(e) => {
                  setInStock(e.target.checked);
                  setTimeout(updateParams, 0);
                }}
              />
              In Stock Only
            </label>
          </div>

          <button className="btn-secondary w-100 mt-4" onClick={clearFilters}>
            Clear All Filters
          </button>
        </aside>

        {/* Main Content */}
        <main className="catalog-main">
          {isLoading ? (
            <Loader />
          ) : books.length > 0 ? (
            <>
              <div className="catalog-meta">
                Showing {books.length} result{books.length !== 1 ? 's' : ''}
              </div>
              <div className="books-grid">
                {books.map(book => (
                  <BookCard key={book._id} book={book} />
                ))}
              </div>
            </>
          ) : (
            <EmptyState 
              icon={Search}
              title="No books found"
              description="Try adjusting your filters or search terms to find what you're looking for."
              actionText="Clear Filters"
              actionLink="/books"
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default Books;
