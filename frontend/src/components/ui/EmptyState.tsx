import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import './EmptyState.css';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  actionLink?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon: Icon, 
  title, 
  description, 
  actionText, 
  actionLink 
}) => {
  return (
    <div className="empty-state animate-fade-in">
      <div className="empty-icon-wrapper">
        <Icon size={48} className="empty-icon" strokeWidth={1.5} />
      </div>
      <h3 className="empty-title">{title}</h3>
      <p className="empty-description">{description}</p>
      {actionText && actionLink && (
        <Link to={actionLink} className="btn-primary mt-4">
          {actionText}
        </Link>
      )}
    </div>
  );
};

export default EmptyState;
