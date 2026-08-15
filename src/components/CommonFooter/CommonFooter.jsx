import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CommonFooter.css';

const CommonFooter = () => {
  const navigate = useNavigate();

  return (
    <footer className="common-footer">
      <div className="footer-content">
        <button className="footer-link-button" onClick={() => navigate('/terms')}>
          이용약관
        </button>
        <span className="footer-divider" aria-hidden="true">·</span>
        <button className="footer-link-button" onClick={() => navigate('/admin')}>
          관리자
        </button>
      </div>
    </footer>
  );
};

export default CommonFooter;
