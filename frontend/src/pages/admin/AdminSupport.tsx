import React, { useState, useEffect } from 'react';
import { Loader2, MessageSquare } from 'lucide-react';
import { api } from '../../utils/api';
import toast from 'react-hot-toast';

const adminColors = {
  bg: '#f8f9fa',
  sidebar: '#1a1a1a',
  textLight: '#ffffff',
  textDark: '#333333',
  primary: '#C5A880',
  border: '#e9ecef',
  card: '#ffffff',
  danger: '#ff4d4f',
  success: '#52c41a',
  warning: '#faad14'
};

const AdminSupport: React.FC = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTicket, setActiveTicket] = useState<number | null>(null);
  const [response, setResponse] = useState('');

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const data = await api.get('/admin/support', true);
      setTickets(data);
    } catch (error) {
      toast.error('Failed to load tickets');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const updateTicket = async (ticketId: number, status: string, admin_response?: string) => {
    try {
      const payload: any = { status };
      if (admin_response !== undefined) payload.admin_response = admin_response;
      
      await api.put(`/admin/support/${ticketId}`, payload, true);
      setTickets(tickets.map(t => t.id === ticketId ? { ...t, status, admin_response: admin_response ?? t.admin_response } : t));
      toast.success('Ticket updated');
      setActiveTicket(null);
      setResponse('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update ticket');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ color: adminColors.textDark, margin: 0 }}>Support Tickets</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666', backgroundColor: adminColors.card, borderRadius: '8px' }}>
            <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 12px auto' }} />
            <p>Loading tickets...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666', backgroundColor: adminColors.card, borderRadius: '8px' }}>
            <p>No support tickets found.</p>
          </div>
        ) : (
          tickets.map((ticket) => (
            <div key={ticket.id} style={{ backgroundColor: adminColors.card, borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ margin: '0 0 8px 0' }}>{ticket.subject}</h3>
                  <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>Ticket #{ticket.id} • {new Date(ticket.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <select
                    value={ticket.status}
                    onChange={(e) => updateTicket(ticket.id, e.target.value)}
                    style={{ padding: '6px 12px', borderRadius: '4px', border: `1px solid ${adminColors.border}`, outline: 'none', backgroundColor: ticket.status === 'RESOLVED' ? `${adminColors.success}20` : '#fff' }}
                  >
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                  </select>
                </div>
              </div>

              <div style={{ backgroundColor: '#f8f9fa', padding: '16px', borderRadius: '6px', marginBottom: '16px' }}>
                <p style={{ margin: 0 }}>{ticket.message}</p>
              </div>

              {ticket.admin_response && (
                <div style={{ backgroundColor: `${adminColors.primary}15`, padding: '16px', borderRadius: '6px', marginBottom: '16px', borderLeft: `4px solid ${adminColors.primary}` }}>
                  <strong>Admin Response:</strong>
                  <p style={{ margin: '8px 0 0 0' }}>{ticket.admin_response}</p>
                </div>
              )}

              {activeTicket === ticket.id ? (
                <div style={{ marginTop: '16px' }}>
                  <textarea
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    placeholder="Type your response..."
                    style={{ width: '100%', padding: '12px', borderRadius: '6px', border: `1px solid ${adminColors.border}`, minHeight: '100px', marginBottom: '12px', resize: 'vertical' }}
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => updateTicket(ticket.id, 'RESOLVED', response)}
                      style={{ padding: '8px 16px', backgroundColor: adminColors.primary, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Send & Resolve
                    </button>
                    <button 
                      onClick={() => setActiveTicket(null)}
                      style={{ padding: '8px 16px', backgroundColor: 'transparent', color: '#666', border: `1px solid ${adminColors.border}`, borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => setActiveTicket(ticket.id)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: 'transparent', color: adminColors.primary, border: `1px solid ${adminColors.primary}`, borderRadius: '4px', cursor: 'pointer' }}
                >
                  <MessageSquare size={16} /> {ticket.admin_response ? 'Edit Response' : 'Reply'}
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminSupport;
