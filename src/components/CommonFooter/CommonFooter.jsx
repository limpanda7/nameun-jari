import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './CommonFooter.css';

const CommonFooter = () => {
  const navigate = useNavigate();



  return (
    <footer className="common-footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>나믄자리</h3>
          <p>당신을 위해 남은 자리</p>
        </div>
        <div className="footer-section">
          <h4>소개</h4>
          <ul>
            <li>
              <button 
                onClick={() => navigate('/#spaces')}
                className="footer-link-button"
              >
                공간들
              </button>
            </li>
            <li>
              <button 
                onClick={() => navigate('/#host-message')}
                className="footer-link-button"
              >
                호스트
              </button>
            </li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>둘러보기</h4>
          <ul>
              <li>
                <button
                  onClick={() => navigate('/forest')}
                  className="footer-link-button"
                >
                  백년한옥별채
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/blon')}
                  className="footer-link-button"
                >
                  블로뉴숲
                </button>
              </li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default CommonFooter;
