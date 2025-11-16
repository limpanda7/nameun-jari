import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import WeekCalendar from '../WeekCalendar/WeekCalendar';
import { getReservations, getIcalReservations } from '../../utils/firestore';
import '../../styles/CommonPage.css';
import '../CommonCalendar/CommonCalendar.css';

const OnOffCalendar = () => {
  const navigate = useNavigate();
  const [picked, setPicked] = useState([]);
  const [reserved, setReserved] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Firestore에서 예약 데이터 가져오기
  useEffect(() => {
    const fetchReservations = async () => {
      setIsLoading(true);
      try {
        // Firestore에서 내부 예약 데이터와 iCal 데이터 가져오기
        const [internalData, icalData] = await Promise.all([
          getReservations('on_off').catch(err => {
            console.warn('Firestore 예약 데이터 조회 실패, 빈 배열 반환:', err);
            return [];
          }),
          getIcalReservations('on_off').catch(err => {
            console.warn('Firestore iCal 데이터 조회 실패, 빈 배열 반환:', err);
            return [];
          })
        ]);

        // Firestore 내부 DB 데이터를 캘린더 형식으로 변환
        const internalReservations = internalData.map(reservation => ({
          checkin_date: reservation.checkin_date,
          checkout_date: reservation.checkout_date
        }));

        // iCal 데이터를 캘린더 형식으로 변환
        const icalReservations = icalData.map(reservation => ({
          checkin_date: reservation.start_dt,
          checkout_date: reservation.end_dt
        }));

        // 두 데이터를 합치기
        const allReservations = [...internalReservations, ...icalReservations];
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
  }, []);

  const handleReservation = () => {
    if (picked.length === 0) {
      alert('체크인과 체크아웃 날짜를 선택해주세요.');
      return;
    }

    // Reservation 페이지로 이동하면서 선택된 날짜 전달
    navigate('/on-off/reservation', {
      state: { picked }
    });
  };

  return (
    <div className="common-calendar">
      {/* Header */}
      <div className="common-calendar-header-section">
        <button
          className="back-button"
          onClick={() => navigate('/on-off')}
        >
          <ArrowLeft size={20} />
          돌아가기
        </button>
      </div>

      <div className="common-calendar-header">
        <h1>온오프스테이 예약</h1>
        <p>원하시는 날짜를 선택해주세요 (최소 1주 이상)</p>
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
          <WeekCalendar
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

export default OnOffCalendar;

