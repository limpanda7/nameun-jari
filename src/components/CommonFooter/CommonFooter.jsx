import React from 'react';
import './CommonFooter.css';

const CommonFooter = () => {
  return (
    <footer className="common-footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>나믄자리</h3>
          <p>당신을 위해 남은 자리</p>
        </div>
        <div className="footer-section business-info">
          <h4>사업자 정보</h4>
          <div className="business-details">
            <p><strong>상호명:</strong> 온오프 스페이스</p>
            <p><strong>대표자:</strong> 남은비</p>
            <p><strong>주소:</strong> 서울특별시 성북구 정릉로40길 11, 1층(정릉동)</p>
            <p><strong>사업자등록번호:</strong> 170-57-00870</p>
            <p><strong>통신판매업신고:</strong> 2025-서울성북-1226</p>
            <p><strong>이메일:</strong> limpanda7@naver.com</p>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2025 온오프 스페이스. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default CommonFooter;
