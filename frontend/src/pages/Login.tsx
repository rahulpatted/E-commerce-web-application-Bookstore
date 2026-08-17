import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Auth.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'USER' | 'ADMIN'>('USER');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const data = await api.post('/auth/login', { email, password, role });
      login(data.access_token, data.user);
      toast.success('Welcome back!');
      navigate(data.user.role === 'ADMIN' ? '/admin' : from, { replace: true });
    } catch (error: any) {
      toast.error(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container animate-fade-in">
        <div className="auth-header">
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to your User or Admin account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '10px', textAlign: 'center', backgroundColor: '#f0f7ff', padding: '8px', borderRadius: '4px' }}>
              <strong>Admin Login:</strong> admin@bookstore.com / admin123
            </p>
            
            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 500 }}>
                <input 
                  type="radio" 
                  name="role" 
                  value="USER" 
                  checked={role === 'USER'} 
                  onChange={() => setRole('USER')} 
                  style={{ cursor: 'pointer' }}
                />
                User
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 500 }}>
                <input 
                  type="radio" 
                  name="role" 
                  value="ADMIN" 
                  checked={role === 'ADMIN'} 
                  onChange={() => setRole('ADMIN')} 
                  style={{ cursor: 'pointer' }}
                />
                Admin
              </label>
            </div>

            <label htmlFor="email">Email Address</label>
            <div className="input-with-icon">
              <Mail className="input-icon" size={20} />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-group">
            <div className="password-header">
              <label htmlFor="password">Password</label>
              <Link to="/forgot-password" className="forgot-password-link">Forgot Password?</Link>
            </div>
            <div className="input-with-icon">
              <Lock className="input-icon" size={20} />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={isLoading}
              />
              <button 
                type="button" 
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-primary auth-submit"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account? <Link to="/register" className="auth-link">Create one</Link></p>
        </div>
      </div>
      
      <div className="auth-image-side">
        <img src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1000&auto=format&fit=crop" alt="Library" />
      </div>
    </div>
  );
};

export default Login;
