import React, { useState, useEffect } from 'react';
import { Search, Loader2, Trash2 } from 'lucide-react';
import { api } from '../../utils/api';
import toast from 'react-hot-toast';
import type { Book } from '../../types';

const adminColors = {
  bg: '#f8f9fa',
  sidebar: '#1a1a1a',
  textLight: '#ffffff',
  textDark: '#333333',
  primary: '#C5A880',
  border: '#e9ecef',
  card: '#ffffff',
  danger: '#ff4d4f',
  success: '#52c41a'
};

const AdminBooks: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchBooks = async (query = '') => {
    try {
      setLoading(true);
      const endpoint = query ? `/admin/books?q=${encodeURIComponent(query)}` : '/admin/books';
      const data = await api.get(endpoint, true);
      setBooks(data);
    } catch (error) {
      toast.error('Failed to load books');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBooks(searchQuery);
  };

  const deleteBook = async (bookId: string) => {
    if (!window.confirm("Are you sure you want to delete this book?")) return;
    try {
      await api.delete(`/admin/books/${bookId}`, true);
      setBooks(books.filter(b => b.id !== bookId));
      toast.success('Book deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete book');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ color: adminColors.textDark, margin: 0 }}>Books Management</h1>
        
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
            <input 
              type="text" 
              placeholder="Search books..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ padding: '10px 12px 10px 40px', borderRadius: '6px', border: `1px solid ${adminColors.border}`, outline: 'none', minWidth: '250px' }}
            />
          </div>
          <button type="submit" style={{ padding: '10px 16px', backgroundColor: adminColors.primary, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
            Search
          </button>
        </form>
      </div>

      <div style={{ backgroundColor: adminColors.card, borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
            <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 12px auto' }} />
            <p>Loading books...</p>
          </div>
        ) : books.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
            <p>No books found.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa', borderBottom: `2px solid ${adminColors.border}`, textAlign: 'left' }}>
                <th style={{ padding: '16px', fontWeight: '600', color: adminColors.textDark }}>ID</th>
                <th style={{ padding: '16px', fontWeight: '600', color: adminColors.textDark }}>Title</th>
                <th style={{ padding: '16px', fontWeight: '600', color: adminColors.textDark }}>Author</th>
                <th style={{ padding: '16px', fontWeight: '600', color: adminColors.textDark }}>Price</th>
                <th style={{ padding: '16px', fontWeight: '600', color: adminColors.textDark }}>Stock</th>
                <th style={{ padding: '16px', fontWeight: '600', color: adminColors.textDark, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book._id} style={{ borderBottom: `1px solid ${adminColors.border}` }}>
                  <td style={{ padding: '16px' }}>#{book._id}</td>
                  <td style={{ padding: '16px', fontWeight: '500' }}>{book.title}</td>
                  <td style={{ padding: '16px', color: '#666' }}>{book.author}</td>
                  <td style={{ padding: '16px', color: '#666' }}>₹{book.price}</td>
                  <td style={{ padding: '16px', color: '#666' }}>{book.stock}</td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <button
                      onClick={() => deleteBook(book._id)}
                      title="Delete Book"
                      style={{ padding: '6px', borderRadius: '4px', border: 'none', cursor: 'pointer', backgroundColor: `${adminColors.danger}15`, color: adminColors.danger }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminBooks;
