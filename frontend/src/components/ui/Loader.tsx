import React from 'react';
import './Loader.css';

interface LoaderProps {
  fullScreen?: boolean;
}

const Loader: React.FC<LoaderProps> = ({ fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div className="loader-overlay">
        <div className="loader-spinner"></div>
      </div>
    );
  }

  return (
    <div className="loader-container">
      <div className="loader-spinner"></div>
    </div>
  );
};

export default Loader;
