import React, { useState } from 'react';
import { User as UserIcon, Mail, Phone, MapPin, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import toast from 'react-hot-toast';
import './Profile.css';

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    postal_code: user?.postal_code || '',
    country: user?.country || 'India',
  });

  if (!user) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const updatedUser = await api.put('/auth/profile', formData, true);
      updateUser(updatedUser);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="profile-page container section-padding">
      <div className="profile-layout">
        <div className="profile-sidebar">
          <div className="profile-avatar-large">
            {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
          </div>
          <h2 className="profile-name">{user.name || 'User'}</h2>
          <p className="profile-email">{user.email}</p>
          <div className="profile-role-badge">
            {user.role === 'ADMIN' ? 'Administrator' : 'Customer'}
          </div>
        </div>

        <div className="profile-content">
          <div className="profile-header">
            <h1 className="page-title">My Profile</h1>
            <button 
              className="btn-secondary"
              onClick={() => setIsEditing(!isEditing)}
              disabled={isSaving}
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          <form onSubmit={handleSubmit} className={`profile-form ${isEditing ? 'editing' : 'view-only'}`}>
            <div className="form-section">
              <h3 className="form-section-title">Personal Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label><UserIcon size={16} /> Full Name</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange}
                    readOnly={!isEditing}
                    className={!isEditing ? 'input-readonly' : ''}
                  />
                </div>
                <div className="form-group">
                  <label><Mail size={16} /> Email Address</label>
                  <input 
                    type="email" 
                    value={user.email} 
                    readOnly 
                    className="input-readonly"
                    title="Email cannot be changed"
                  />
                </div>
                <div className="form-group">
                  <label><Phone size={16} /> Phone Number</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleChange}
                    readOnly={!isEditing}
                    className={!isEditing ? 'input-readonly' : ''}
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="form-section-title"><MapPin size={18} /> Shipping Address</h3>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Street Address</label>
                  <input 
                    type="text" 
                    name="address" 
                    value={formData.address} 
                    onChange={handleChange}
                    readOnly={!isEditing}
                    className={!isEditing ? 'input-readonly' : ''}
                  />
                </div>
                <div className="form-group">
                  <label>City</label>
                  <input 
                    type="text" 
                    name="city" 
                    value={formData.city} 
                    onChange={handleChange}
                    readOnly={!isEditing}
                    className={!isEditing ? 'input-readonly' : ''}
                  />
                </div>
                <div className="form-group">
                  <label>State/Province</label>
                  <input 
                    type="text" 
                    name="state" 
                    value={formData.state} 
                    onChange={handleChange}
                    readOnly={!isEditing}
                    className={!isEditing ? 'input-readonly' : ''}
                  />
                </div>
                <div className="form-group">
                  <label>Postal Code</label>
                  <input 
                    type="text" 
                    name="postal_code" 
                    value={formData.postal_code} 
                    onChange={handleChange}
                    readOnly={!isEditing}
                    className={!isEditing ? 'input-readonly' : ''}
                  />
                </div>
                <div className="form-group">
                  <label>Country</label>
                  <input 
                    type="text" 
                    name="country" 
                    value={formData.country} 
                    onChange={handleChange}
                    readOnly={!isEditing}
                    className={!isEditing ? 'input-readonly' : ''}
                  />
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={isSaving}>
                  <Save size={18} /> {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
