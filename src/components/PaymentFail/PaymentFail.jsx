import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../CommonReservation/CommonReservation.css';

const PaymentFail = () => {
  const navigate = useNavigate();

  const getCalendarPath = () => {
    // 세션 스토리지에서 propertyType 가져오기
    const storedData = sessionStorage.getItem('kakaoPayReservation');
    if (storedData) {
      try {
        const reservationData = JSON.parse(storedData);
        const propertyType = reservationData.propertyType;
        
        const paths = {
          forest: '/forest/calendar',
          blon: '/blon/calendar',
          mukho: '/mukho/calendar',
          on_off: '/on-off/calendar',
          space: '/space/calendar',
        };
        
        if (paths[propertyType]) {
          return paths[propertyType];
        }
      } catch (error) {
        console.error('예약 정보 파싱 오류:', error);
      }
    }
    return '/';
  };

  const handleNavigate = () => {
    const calendarPath = getCalendarPath();
    // 세션 스토리지 정리
    sessionStorage.removeItem('kakaoPayReservation');
    navigate(calendarPath);
  };

  return (
    <div className="common-reservation">
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
        <h1 style={{ color: '#e74c3c', marginBottom: '10px', fontSize: '2.8rem' }}>결제가 실패했습니다</h1>
        <p style={{ color: '#666', marginBottom: '40px', fontSize: '18px' }}>
          결제 처리 중 오류가 발생했습니다. 다시 시도해주세요.
        </p>

        <button
          className="reservation-btn"
          onClick={handleNavigate}
          style={{ maxWidth: '300px', margin: '0 auto' }}
        >
          캘린더로 이동
        </button>
      </div>
    </div>
  );
};

export default PaymentFail;

