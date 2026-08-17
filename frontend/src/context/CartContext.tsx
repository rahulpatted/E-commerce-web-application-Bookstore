import React, { createContext, useContext, useState, useEffect } from 'react';
import type { CartItem } from '../types';
import { api } from '../utils/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface CartContextType {
  items: CartItem[];
  isLoading: boolean;
  addToCart: (bookId: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (token) {
      fetchCart();
    } else {
      setItems([]);
    }
  }, [token]);

  const fetchCart = async () => {
    try {
      setIsLoading(true);
      const data = await api.get('/cart/', true);
      setItems(data);
    } catch (error) {
      console.error('Failed to fetch cart', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (bookId: string, quantity = 1) => {
    if (!token) {
      toast.error('Please log in to add items to your cart');
      return;
    }
    try {
      await api.post('/cart/add', { book_id: bookId, quantity }, true);
      await fetchCart();
      toast.success('Added to cart');
    } catch (error: any) {
      toast.error(error.message || 'Failed to add to cart');
      throw error;
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    try {
      await api.put(`/cart/${itemId}`, { quantity }, true);
      await fetchCart();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update quantity');
      throw error;
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      await api.delete(`/cart/${itemId}`, true);
      await fetchCart();
      toast.success('Removed from cart');
    } catch (error: any) {
      toast.error('Failed to remove item');
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/cart/', true);
      setItems([]);
    } catch (error: any) {
      toast.error('Failed to clear cart');
      throw error;
    }
  };

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = items.reduce((sum, item) => sum + ((item.book.price || 0) * item.quantity), 0);

  return (
    <CartContext.Provider 
      value={{ 
        items, 
        isLoading, 
        addToCart, 
        updateQuantity, 
        removeFromCart, 
        clearCart,
        cartCount,
        cartTotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
