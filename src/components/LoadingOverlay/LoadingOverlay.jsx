import React from 'react';
import './LoadingOverlay.css';

const LoadingOverlay = ({ message = '처리 중입니다' }) => {
  return (
    <div className="loading-overlay">
      <div className="loading-spinner-container">
        <div className="spinner"></div>
        <div className="loading-text">{message}</div>
      </div>
    </div>
  );
};

export default LoadingOverlay;

