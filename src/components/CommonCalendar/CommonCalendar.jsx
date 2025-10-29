import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Calendar from '../Calendar/Calendar';
import { FOREST_API_BASE } from '../../utils/api';
import '../../styles/CommonPage.css';
import './CommonCalendar.css';

const CommonCalendar = ({ propertyType, title, backPath, reservationPath }) => {
  const navigate = useNavigate();
  const [picked, setPicked] = useState([]);
  const [isContinuous] = useState(true);
  const [reserved, setReserved] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // API에서 예약 데이터 가져오기
  useEffect(() => {
    const fetchReservations = async () => {
      setIsLoading(true);
      try {
        // 환경에 따라 적절한 API URL 사용 (개발: 프록시, 프로덕션: 절대 URL)
        const [internalResponse, airbnbResponse] = await Promise.all([
          fetch(`${FOREST_API_BASE}/reservation/${propertyType}`),
          fetch(`${FOREST_API_BASE}/ical/${propertyType}`)
        ]);

        if (!internalResponse.ok) {
          throw new Error('내부 예약 데이터를 가져오는데 실패했습니다.');
        }
        if (!airbnbResponse.ok) {
          throw new Error('에어비앤비 예약 데이터를 가져오는데 실패했습니다.');
        }

        const internalData = await internalResponse.json();
        const airbnbData = await airbnbResponse.json();

        // 내부 DB 데이터를 캘린더 형식으로 변환
        const internalReservations = internalData.map(reservation => ({
          checkin_date: reservation.checkin_date,
          checkout_date: reservation.checkout_date
        }));

        // 에어비앤비 데이터를 캘린더 형식으로 변환
        const airbnbReservations = airbnbData.map(reservation => ({
          checkin_date: reservation.start_dt,
          checkout_date: reservation.end_dt
        }));

        // 두 데이터를 합치기
        const allReservations = [...internalReservations, ...airbnbReservations];
        setReserved(allReservations);
        setError(null);
      } catch (err) {
        console.error('예약 데이터 로딩 에러:', err);
        setError(err.message);
        // 에러 발생 시 빈 배열로 설정
        setReserved([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReservations();
  }, [propertyType]);

  const handleReservation = () => {
    if (picked.length === 0) {
      alert('체크인과 체크아웃 날짜를 선택해주세요.');
      return;
    }

    // Reservation 페이지로 이동하면서 선택된 날짜 전달
    navigate(reservationPath, {
      state: { picked }
    });
  };

  return (
    <div className="common-calendar">
      {/* Header */}
      <div className="common-calendar-header-section">
        <button
          className="back-button"
          onClick={() => navigate(backPath)}
        >
          <ArrowLeft size={20} />
          돌아가기
        </button>
      </div>

      <div className="common-calendar-header">
        <h1>{title}</h1>
        <p>원하시는 날짜를 선택해주세요</p>
      </div>

      <div className="common-calendar-content">
        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>예약 내역 불러오는 중...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p className="error-message">⚠️ {error}</p>
            <p className="error-note">예약 가능한 날짜를 확인할 수 없습니다. 잠시 후 다시 시도해주세요.</p>
          </div>
        ) : (
          <Calendar
            isContinuous={isContinuous}
            picked={picked}
            setPicked={setPicked}
            reserved={reserved}
          />
        )}

        {!error && !isLoading && (
          <button
            className="reservation-btn"
            onClick={handleReservation}
            disabled={picked.length === 0}
          >
            예약하기
          </button>
        )}
      </div>
    </div>
  );
};

export default CommonCalendar;
