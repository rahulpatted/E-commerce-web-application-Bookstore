import React, { useState, useEffect } from 'react';
import { Search, UserCheck, UserX, Loader2 } from 'lucide-react';
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
  success: '#52c41a'
};

interface User {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchUsers = async (query = '') => {
    try {
      setLoading(true);
      const endpoint = query ? `/admin/users?q=${encodeURIComponent(query)}` : '/admin/users';
      const data = await api.get(endpoint, true);
      setUsers(data);
    } catch (error) {
      toast.error('Failed to load users');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(searchQuery);
  };

  const toggleUserActive = async (userId: number) => {
    try {
      setActionLoading(userId);
      const result = await api.put(`/admin/users/${userId}/toggle-active`, {}, true);
      
      // Update local state
      setUsers(users.map(u => u.id === userId ? { ...u, is_active: result.is_active } : u));
      
      toast.success(result.message || `User ${result.is_active ? 'activated' : 'deactivated'} successfully`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user status');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ color: adminColors.textDark, margin: 0 }}>User Management</h1>
        
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
            <input 
              type="text" 
              placeholder="Search users..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '10px 12px 10px 40px',
                borderRadius: '6px',
                border: `1px solid ${adminColors.border}`,
                outline: 'none',
                minWidth: '250px'
              }}
            />
          </div>
          <button type="submit" style={{
            padding: '10px 16px',
            backgroundColor: adminColors.primary,
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600'
          }}>
            Search
          </button>
        </form>
      </div>

      <div style={{ backgroundColor: adminColors.card, borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
            <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 12px auto' }} />
            <p>Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
            <p>No users found.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa', borderBottom: `2px solid ${adminColors.border}`, textAlign: 'left' }}>
                <th style={{ padding: '16px', fontWeight: '600', color: adminColors.textDark }}>ID</th>
                <th style={{ padding: '16px', fontWeight: '600', color: adminColors.textDark }}>Name</th>
                <th style={{ padding: '16px', fontWeight: '600', color: adminColors.textDark }}>Email</th>
                <th style={{ padding: '16px', fontWeight: '600', color: adminColors.textDark }}>Joined</th>
                <th style={{ padding: '16px', fontWeight: '600', color: adminColors.textDark }}>Status</th>
                <th style={{ padding: '16px', fontWeight: '600', color: adminColors.textDark, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={{ borderBottom: `1px solid ${adminColors.border}` }}>
                  <td style={{ padding: '16px' }}>#{user.id}</td>
                  <td style={{ padding: '16px', fontWeight: '500' }}>{user.name}</td>
                  <td style={{ padding: '16px', color: '#666' }}>{user.email}</td>
                  <td style={{ padding: '16px', color: '#666' }}>{new Date(user.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      backgroundColor: user.is_active ? `${adminColors.success}20` : `${adminColors.danger}20`,
                      color: user.is_active ? adminColors.success : adminColors.danger,
                    }}>
                      {user.is_active ? 'Active' : 'Banned'}
                    </span>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <button
                      onClick={() => toggleUserActive(user.id)}
                      disabled={actionLoading === user.id}
                      title={user.is_active ? "Ban User" : "Unban User"}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: actionLoading === user.id ? 'not-allowed' : 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: user.is_active ? `${adminColors.danger}15` : `${adminColors.success}15`,
                        color: user.is_active ? adminColors.danger : adminColors.success,
                        fontWeight: '500',
                        transition: 'opacity 0.2s'
                      }}
                    >
                      {actionLoading === user.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : user.is_active ? (
                        <><UserX size={16} /> Ban</>
                      ) : (
                        <><UserCheck size={16} /> Unban</>
                      )}
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

export default AdminUsers;
