import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
      <div style={{ color: 'var(--accent-primary)', marginBottom: '24px' }}>
        <AlertTriangle size={64} />
      </div>
      <h1 style={{ fontSize: '3rem', marginBottom: '16px' }}>404</h1>
      <h2 style={{ marginBottom: '24px', color: 'var(--text-secondary)' }}>Page Not Found</h2>
      <p style={{ maxWidth: '400px', margin: '0 auto 32px', color: 'var(--text-light)' }}>
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link to="/" style={{ 
        display: 'inline-block',
        padding: '12px 32px', 
        backgroundColor: 'var(--accent-primary)', 
        color: 'white', 
        borderRadius: '30px',
        fontWeight: 500,
        textDecoration: 'none'
      }}>
        Return to Home
      </Link>
    </div>
  );
};

export default NotFound;
