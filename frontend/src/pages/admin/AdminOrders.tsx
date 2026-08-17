import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
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

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await api.get('/admin/orders', true);
      setOrders(data);
    } catch (error) {
      toast.error('Failed to load orders');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (orderId: number, status: string) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status }, true);
      setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
      toast.success('Order status updated');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update order');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ color: adminColors.textDark, margin: 0 }}>Order Management</h1>
      </div>

      <div style={{ backgroundColor: adminColors.card, borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
            <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 12px auto' }} />
            <p>Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
            <p>No orders found.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa', borderBottom: `2px solid ${adminColors.border}`, textAlign: 'left' }}>
                <th style={{ padding: '16px', fontWeight: '600', color: adminColors.textDark }}>Order ID</th>
                <th style={{ padding: '16px', fontWeight: '600', color: adminColors.textDark }}>Date</th>
                <th style={{ padding: '16px', fontWeight: '600', color: adminColors.textDark }}>Total</th>
                <th style={{ padding: '16px', fontWeight: '600', color: adminColors.textDark }}>Payment</th>
                <th style={{ padding: '16px', fontWeight: '600', color: adminColors.textDark }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} style={{ borderBottom: `1px solid ${adminColors.border}` }}>
                  <td style={{ padding: '16px', fontWeight: '500' }}>#{order.id}</td>
                  <td style={{ padding: '16px', color: '#666' }}>{new Date(order.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: '16px', color: '#666' }}>₹{order.total}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', backgroundColor: order.payment_status === 'PAID' ? `${adminColors.success}20` : `${adminColors.warning}20`, color: order.payment_status === 'PAID' ? adminColors.success : adminColors.warning }}>
                      {order.payment_status}
                    </span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      style={{ padding: '6px 12px', borderRadius: '4px', border: `1px solid ${adminColors.border}`, outline: 'none' }}
                    >
                      <option value="PENDING">Pending</option>
                      <option value="SHIPPED">Shipped</option>
                      <option value="DELIVERED">Delivered</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
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

export default AdminOrders;
