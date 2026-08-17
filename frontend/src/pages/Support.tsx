import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, MessageSquare, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import toast from 'react-hot-toast';
import Loader from '../components/ui/Loader';
import type { SupportTicket } from '../types';

const Support: React.FC = () => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    subject: '',
    message: ''
  });

  useEffect(() => {
    if (user) {
      fetchTickets();
    }
  }, [user]);

  const fetchTickets = async () => {
    try {
      setIsLoadingTickets(true);
      const data = await api.get('/support/', true);
      setTickets(data);
    } catch (error) {
      console.error("Failed to load tickets", error);
    } finally {
      setIsLoadingTickets(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // API call works for both authenticated and guest users
      await api.post('/support/', formData, !!user);
      toast.success('Your message has been sent successfully!');
      setFormData(prev => ({ ...prev, subject: '', message: '' }));
      if (user) fetchTickets();
    } catch (error: any) {
      toast.error(error.message || 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'var(--status-warning)';
      case 'In Progress': return 'var(--status-info)';
      case 'Resolved': return 'var(--status-success)';
      default: return 'var(--text-secondary)';
    }
  };

  return (
    <div className="support-page container section-padding">
      <div className="page-header text-center mb-5">
        <h1 className="page-title">Contact & Support</h1>
        <p className="page-subtitle">We're here to help. Reach out to us for any questions or concerns.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '40px', alignItems: 'start' }}>
        {/* Contact Info */}
        <div style={{ backgroundColor: 'var(--bg-card)', padding: '30px', borderRadius: 'var(--radius-lg)', border: 'var(--border-light)' }}>
          <h3 style={{ marginBottom: '24px', fontFamily: 'var(--font-heading)', fontSize: '1.5rem' }}>Get in Touch</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ backgroundColor: 'rgba(197, 168, 128, 0.1)', padding: '12px', borderRadius: '50%', color: 'var(--accent-primary)' }}>
                <MapPin size={24} />
              </div>
              <div>
                <h4 style={{ marginBottom: '4px' }}>Visit Us</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>123 Literary Avenue, Book District<br/>BK 10001, India</p>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ backgroundColor: 'rgba(197, 168, 128, 0.1)', padding: '12px', borderRadius: '50%', color: 'var(--accent-primary)' }}>
                <Phone size={24} />
              </div>
              <div>
                <h4 style={{ marginBottom: '4px' }}>Call Us</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>+1 (555) 123-4567<br/>Mon-Fri, 9am to 6pm</p>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ backgroundColor: 'rgba(197, 168, 128, 0.1)', padding: '12px', borderRadius: '50%', color: 'var(--accent-primary)' }}>
                <Mail size={24} />
              </div>
              <div>
                <h4 style={{ marginBottom: '4px' }}>Email Us</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>support@shelfverse.com<br/>info@shelfverse.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div style={{ backgroundColor: 'var(--bg-card)', padding: '40px', borderRadius: 'var(--radius-lg)', border: 'var(--border-light)' }}>
          <h3 style={{ marginBottom: '24px', fontFamily: 'var(--font-heading)', fontSize: '1.5rem' }}>Send a Message</h3>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input 
                  type="text" 
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required 
                  readOnly={!!user && !!user.name}
                  style={!!user && !!user.name ? { backgroundColor: 'var(--bg-secondary)', borderColor: 'transparent' } : {}}
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input 
                  type="email" 
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required 
                  readOnly={!!user}
                  style={!!user ? { backgroundColor: 'var(--bg-secondary)', borderColor: 'transparent' } : {}}
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="subject">Subject</label>
              <select 
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                style={{ padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: 'var(--border-medium)', backgroundColor: 'var(--bg-card)', fontFamily: 'inherit', fontSize: '1rem' }}
              >
                <option value="" disabled>Select a subject</option>
                <option value="Order Inquiry">Order Inquiry</option>
                <option value="Return / Refund">Return / Refund</option>
                <option value="Product Question">Product Question</option>
                <option value="Technical Issue">Technical Issue</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea 
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={5}
                required 
                style={{ resize: 'vertical' }}
              ></textarea>
            </div>
            
            <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ alignSelf: 'flex-start', padding: '14px 32px' }}>
              <MessageSquare size={18} style={{ marginRight: '8px' }} />
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>

      {/* User's Support History (Only if logged in) */}
      {user && (
        <div style={{ marginTop: '60px' }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '24px' }}>My Support Tickets</h2>
          
          {isLoadingTickets ? (
            <Loader />
          ) : tickets.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {tickets.map(ticket => (
                <div key={ticket.id} style={{ backgroundColor: 'var(--bg-card)', padding: '24px', borderRadius: 'var(--radius-md)', border: 'var(--border-light)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
                    <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{ticket.subject}</h4>
                    <span style={{ 
                      padding: '4px 12px', 
                      borderRadius: '20px', 
                      fontSize: '0.85rem', 
                      fontWeight: 600,
                      backgroundColor: `${getStatusColor(ticket.status)}20`, // 20% opacity
                      color: getStatusColor(ticket.status)
                    }}>
                      {ticket.status}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '16px', lineHeight: 1.6 }}>{ticket.message}</p>
                  
                  {ticket.admin_response && (
                    <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid var(--accent-primary)' }}>
                      <span style={{ display: 'block', fontWeight: 600, marginBottom: '8px', fontSize: '0.9rem' }}>Support Team Reply:</span>
                      <p style={{ color: 'var(--text-primary)', fontSize: '0.95rem', margin: 0 }}>{ticket.admin_response}</p>
                    </div>
                  )}
                  
                  <div style={{ marginTop: '16px', fontSize: '0.8rem', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={14} /> Created on {new Date(ticket.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-secondary)' }}>You don't have any support tickets yet.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Support;
