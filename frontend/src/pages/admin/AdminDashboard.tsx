import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Book, Users, ShoppingCart, MessageSquare, Package, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import AdminUsers from './AdminUsers';
import AdminBooks from './AdminBooks';
import AdminOrders from './AdminOrders';
import AdminSupport from './AdminSupport';

// We'll use inline styles for the admin section for speed, since it's an internal tool
const adminColors = {
  bg: '#f8f9fa',
  sidebar: '#1a1a1a',
  textLight: '#ffffff',
  textDark: '#333333',
  primary: '#C5A880',
  border: '#e9ecef',
  card: '#ffffff'
};

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.get('/admin/dashboard', true);
        setStats(data);
      } catch (error) {
        console.error("Failed to load admin stats", error);
      }
    };
    fetchStats();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Books', path: '/admin/books', icon: Book },
    { name: 'Inventory', path: '/admin/inventory', icon: Package },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Support', path: '/admin/support', icon: MessageSquare },
  ];

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 80px)', backgroundColor: adminColors.bg }}>
      {/* Sidebar */}
      <aside style={{ width: '250px', backgroundColor: adminColors.sidebar, color: adminColors.textLight, padding: '20px 0', flexShrink: 0 }}>
        <div style={{ padding: '0 20px', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '1.2rem', margin: 0, color: adminColors.primary }}>Admin Portal</h2>
          <p style={{ fontSize: '0.8rem', color: '#aaa', margin: 0 }}>Welcome, {user?.name}</p>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column' }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link 
                key={item.path} 
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 20px',
                  color: isActive ? adminColors.primary : '#ccc',
                  backgroundColor: isActive ? 'rgba(197, 168, 128, 0.1)' : 'transparent',
                  textDecoration: 'none',
                  borderLeft: `4px solid ${isActive ? adminColors.primary : 'transparent'}`,
                  transition: 'all 0.2s'
                }}
              >
                <Icon size={18} />
                {item.name}
              </Link>
            );
          })}
          
          <button 
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 20px',
              color: '#ff6b6b',
              backgroundColor: 'transparent',
              border: 'none',
              borderLeft: '4px solid transparent',
              cursor: 'pointer',
              marginTop: 'auto',
              textAlign: 'left',
              width: '100%'
            }}
          >
            <LogOut size={18} />
            Logout
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main style={{ flexGrow: 1, padding: '30px', overflowY: 'auto' }}>
        <Routes>
          <Route path="/" element={
            <div>
              <h1 style={{ marginBottom: '24px', color: adminColors.textDark }}>Dashboard Overview</h1>
              
              {stats ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                  <StatCard title="Total Books" value={stats.total_books} icon={<Book />} color="#4a7c59" />
                  <StatCard title="Total Users" value={stats.total_users} icon={<Users />} color="#4a6e8c" />
                  <StatCard title="Total Orders" value={stats.total_orders} icon={<ShoppingCart />} color="#c5a880" />
                  <StatCard title="Revenue" value={`₹${stats.total_revenue}`} icon={<LayoutDashboard />} color="#d98324" />
                  <StatCard title="Pending Orders" value={stats.pending_orders} icon={<Package />} color="#b84a4a" />
                  <StatCard title="Low Stock" value={stats.low_stock_books} icon={<Package />} color="#d98324" />
                </div>
              ) : (
                <p>Loading stats...</p>
              )}
              
              <div style={{ backgroundColor: adminColors.card, padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <h2>Quick Actions</h2>
                <p style={{ color: '#666' }}>Select an option from the sidebar to manage books, inventory, orders, users, and support tickets.</p>
                <p style={{ color: '#666' }}>Note: Admin module UI is simplified for this prototype to focus on core functionality. In a full production app, each section would have extensive data tables, forms, and charts.</p>
              </div>
            </div>
          } />
          <Route path="/books" element={<AdminBooks />} />
          <Route path="/inventory" element={<PlaceholderView title="Inventory Management" desc="Update stock levels, track low stock items." />} />
          <Route path="/orders" element={<AdminOrders />} />
          <Route path="/users" element={<AdminUsers />} />
          <Route path="/support" element={<AdminSupport />} />
        </Routes>
      </main>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }: any) => (
  <div style={{ 
    backgroundColor: adminColors.card, 
    padding: '20px', 
    borderRadius: '8px', 
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    borderLeft: `4px solid ${color}`,
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  }}>
    <div style={{ backgroundColor: `${color}20`, color: color, padding: '12px', borderRadius: '50%', display: 'flex' }}>
      {icon}
    </div>
    <div>
      <h3 style={{ margin: '0 0 4px 0', fontSize: '0.9rem', color: '#666', fontWeight: 'normal' }}>{title}</h3>
      <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: adminColors.textDark }}>{value}</p>
    </div>
  </div>
);

const PlaceholderView = ({ title, desc }: { title: string, desc: string }) => (
  <div>
    <h1 style={{ marginBottom: '16px', color: adminColors.textDark }}>{title}</h1>
    <div style={{ backgroundColor: adminColors.card, padding: '40px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', textAlign: 'center' }}>
      <h3 style={{ color: adminColors.primary }}>Module In Development</h3>
      <p style={{ color: '#666', maxWidth: '500px', margin: '16px auto' }}>{desc}</p>
      <p style={{ color: '#999', fontSize: '0.9rem' }}>The backend APIs for this module are fully implemented (see <code>backend/api/admin.py</code>). The frontend view will be built in the next iteration.</p>
    </div>
  </div>
);

export default AdminDashboard;
