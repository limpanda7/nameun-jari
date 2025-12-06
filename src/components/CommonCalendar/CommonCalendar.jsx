import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Calendar from '../Calendar/Calendar';
import { getReservations, getIcalReservations } from '../../utils/firestore';
import { FOREST_PRICE, BLON_PRICE } from '../../constants/price';
import { isFriday, isHoliday, isSummer, isWeekday, isSaturday, formatDate, getBlonSpecialDatePrice } from '../../utils/date';
import '../../styles/CommonPage.css';
import './CommonCalendar.css';

const CommonCalendar = ({ propertyType, title, backPath, reservationPath }) => {
  const navigate = useNavigate();
  const [picked, setPicked] = useState([]);
  const [isContinuous] = useState(true);
  const [reserved, setReserved] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [basePrice, setBasePrice] = useState(0);
  const [days, setDays] = useState(0);

  // Firestore에서 예약 데이터 가져오기
  useEffect(() => {
    const fetchReservations = async () => {
      setIsLoading(true);
      try {
        // Firestore에서 내부 예약 데이터와 iCal 데이터 가져오기
        const [internalData, icalData] = await Promise.all([
          getReservations(propertyType).catch(err => {
            console.warn('Firestore 예약 데이터 조회 실패, 빈 배열 반환:', err);
            return [];
          }),
          getIcalReservations(propertyType).catch(err => {
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
  }, [propertyType]);

  // 가격 계산
  const priceConfig = useMemo(() => {
    return propertyType === 'forest' ? FOREST_PRICE : BLON_PRICE;
  }, [propertyType]);

  useEffect(() => {
    calcBasePrice();
  }, [picked, propertyType, priceConfig]);

  const calcBasePrice = () => {
    if (picked.length < 2) {
      setBasePrice(0);
      setDays(0);
      return;
    }

    // 체크인 날짜부터 체크아웃 전날까지의 모든 날짜 계산
    const checkinDate = new Date(picked[0]);
    const checkoutDate = new Date(picked[picked.length - 1]);
    
    let currentDate = new Date(checkinDate);
    let calculatedDays = 0; // 실제 숙박 일수
    let tempBasePrice = 0;
    
    while (currentDate < checkoutDate) {
      const date = formatDate(currentDate);
      let dayPrice = 0;

      if (propertyType === 'blon') {
        // 블로뉴숲: 특수일 가격 우선 적용
        const specialPrice = getBlonSpecialDatePrice(date);
        if (specialPrice !== null) {
          dayPrice = specialPrice;
        } else {
          // 특수일이 아닌 경우 일반 가격 계산
          const prices = isSummer(date) ? priceConfig.SUMMER : priceConfig.NORMAL;

          if (isHoliday(date)) {
            dayPrice = prices.HOLIDAY;
          } else if (isWeekday(date)) {
            dayPrice = prices.WEEKDAY;
          } else if (isFriday(date)) {
            dayPrice = prices.FRIDAY;
          } else if (isSaturday(date)) {
            dayPrice = prices.SATURDAY;
          }
        }
      } else {
        // 백년한옥별채 (forest): 평일/주말 구분만
        const prices = isSummer(date) ? priceConfig.SUMMER : priceConfig.NORMAL;

        if (isHoliday(date)) {
          dayPrice = prices.HOLIDAY;
        } else if (isWeekday(date)) {
          dayPrice = prices.WEEKDAY;
        } else {
          dayPrice = prices.WEEKEND;
        }
      }

      tempBasePrice += dayPrice;
      calculatedDays++; // 숙박 일수 증가
      
      // 다음 날로 이동
      currentDate.setDate(currentDate.getDate() + 1);
    }

    setDays(calculatedDays);
    setBasePrice(tempBasePrice);
  };

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

        {/* 가격 및 예약하기 버튼 */}
        {!error && !isLoading && (
          <div className="price-button-container">
            {picked.length >= 2 && basePrice > 0 ? (
              <div className="base-price-simple">
                <span className="price-label">기본가격</span>
                <span className="price-value">{basePrice.toLocaleString()}원</span>
              </div>
            ) : (
              <div className="base-price-simple"></div>
            )}
            <button
              className="reservation-btn"
              onClick={handleReservation}
              disabled={picked.length === 0}
            >
              예약하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommonCalendar;
