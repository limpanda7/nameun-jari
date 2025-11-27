import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ReactCalendar from 'react-calendar';
import { SPACE_PRICE } from '../../constants/price';
import { getReservations } from '../../utils/firestore';
import { formatDate } from '../../utils/date';
import './SpaceCalendar.css';

const SpaceCalendar = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState(null);
  const [time, setTime] = useState([]);
  const [reserved, setReserved] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [showRefund, setShowRefund] = useState(false);

  // Firestore에서 예약 데이터 가져오기
  useEffect(() => {
    const fetchReservations = async () => {
      setIsLoading(true);
      setIsError(false);
      try {
        const reservations = await getReservations('space').catch(err => {
          console.warn('Firestore 예약 데이터 조회 실패, 빈 배열 반환:', err);
          return [];
        });
        setReserved(reservations);
      } catch (err) {
        console.error('예약 데이터 로딩 에러:', err);
        setIsError(true);
        setReserved([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReservations();
  }, []);

  const handleTimeChange = (hour) => {
    let updatedTime;

    if (time.includes(hour)) {
      updatedTime = time.filter((h) => h !== hour);
    } else {
      updatedTime = [...time, hour];
    }

    updatedTime.sort((a, b) => a - b);

    let isContinuous = true;
    for (let i = 1; i < updatedTime.length; i++) {
      if (updatedTime[i] - updatedTime[i - 1] !== 1) {
        isContinuous = false;
        break;
      }
    }

    if (isContinuous) {
      setTime(updatedTime);
    } else {
      alert('연속된 시간을 선택해주세요!');
      setTime(time);
    }
  };

  const handleDateChange = (value) => {
    setDate(formatDate(value));
    setTime([]);
  };

  // Function to check if a time slot is blocked
  const isTimeSlotBlocked = (date, hour) => {
    if (!reserved || !date) return false;

    const formattedDate = formatDate(date);
    const reservationOnDate = reserved.filter((reservation) => {
      const reservationDate = reservation.date || reservation.checkin_date;
      return formatDate(reservationDate) === formattedDate;
    });

    if (!reservationOnDate || reservationOnDate.length === 0) return false;

    return reservationOnDate.find(reservation => {
      const startTime = parseInt(reservation.checkin_time || reservation.start_time);
      const endTime = parseInt(reservation.checkout_time || reservation.end_time);

      return hour >= startTime && hour < endTime;
    });
  };

  const renderTimeSlots = (startHour, endHour) => {
    const timeSlots = [];
    for (let hour = startHour; hour <= endHour; hour++) {
      const isBlocked = isTimeSlotBlocked(date, hour);
      const isChecked = time.includes(hour) && !isBlocked;
      timeSlots.push(
        <div key={hour} className='time-slot'>
          <input
            id={`time-${hour}`}
            type='checkbox'
            checked={isChecked}
            disabled={isBlocked}
            onChange={() => handleTimeChange(hour)}
          />
          <label 
            htmlFor={`time-${hour}`}
            className={`${isChecked ? 'checked' : ''} ${isBlocked ? 'disabled' : ''}`}
          >
            {hour < 10 ? `0${hour}` : hour}:00 - {hour < 9 ? `0${hour + 1}` : hour + 1}:00
          </label>
        </div>
      );
    }
    return timeSlots;
  };

  const moveToReservation = () => {
    if (time.length === 0) {
      alert('예약 시간을 선택해주세요!');
      return false;
    } else {
      navigate('/space/reservation', {
        state: { date, time }
      });
      window.scrollTo(0, 0);
    }
  };

  const manualRetry = () => {
    setIsLoading(true);
    setIsError(false);
    const fetchReservations = async () => {
      try {
        const reservations = await getReservations('space').catch(err => {
          console.warn('Firestore 예약 데이터 조회 실패, 빈 배열 반환:', err);
          return [];
        });
        setReserved(reservations);
        setIsError(false);
      } catch (err) {
        console.error('예약 데이터 로딩 에러:', err);
        setIsError(true);
        setReserved([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReservations();
  };

  return (
    <div className='SpaceCalendar contents'>
      <div className="space-calendar-header-section">
        <button
          className="back-button"
          onClick={() => navigate('/space')}
        >
          <ArrowLeft size={20} />
          돌아가기
        </button>
      </div>

      <section>
        <div className='DescTitle'>Price</div>

        <table className='PriceTable'>
          <thead>
            <tr>
              <th width='1'>월~목</th>
              <th width='1'>금~일 및 공휴일</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{SPACE_PRICE.WEEKDAY.toLocaleString()}원/시간</td>
              <td>{SPACE_PRICE.WEEKEND.toLocaleString()}원/시간</td>
            </tr>
          </tbody>
        </table>

        <ul>
          <li>2인 초과 시 1인당: {SPACE_PRICE.OVER_TWO.toLocaleString()}원/시간</li>
          <li>입금계좌: 카카오 3333058451192 남은비</li>
          <li><span className='anchor' onClick={() => setShowRefund(!showRefund)}>환불 규정 보기</span></li>
          {showRefund && (
            <ul className='List Refund'>
              <li>입실 8일 전까지: 총 결제금액의 100% 환불</li>
              <li>입실 7일 전: 총 결제금액의 50% 환불</li>
              <li>입실 6일 전: 총 결제금액의 40% 환불</li>
              <li>입실 5일 전: 총 결제금액의 30% 환불</li>
              <li>입실 4일 전: 총 결제금액의 20% 환불</li>
              <li>입실 3일 전: 총 결제금액의 10% 환불</li>
              <li>입실 2일 전부터 환불불가</li>
            </ul>
          )}
        </ul>
      </section>

      <section>
        <div className='DescTitle'>Reservation</div>
        {
          isLoading ? (
            <div className='calendar'>
              <div className='loading'>
                <div className='spinner' />
              </div>
            </div>
          ) : isError ? (
            <div className="calendar">
              <p style={{ marginTop: "20px" }}>
                예약 내역을 불러오지 못했습니다.
              </p>
              <div style={{ marginTop: "20px", textAlign: "center" }}>
                <button 
                  className="large-btn" 
                  onClick={manualRetry}
                  style={{ marginBottom: "15px" }}
                >
                  다시 시도하기
                </button>
                <p style={{ fontSize: "14px", color: "#666" }}>
                  DM으로 문의해주세요.
                  <br/>
                  카카오톡 ID: eunbibi1001
                  <br/>
                  인스타그램:&nbsp;
                  <a href='https://www.instagram.com/onoff_space_/' target='_blank' className='anchor'>
                    @onoff_space_
                  </a>
                </p>
              </div>
            </div>
          ) : (
            <>
              <ReactCalendar
                className='calendar'
                calendarType="gregory"
                prev2Label={null}
                next2Label={null}
                formatDay={(localeDay, date) => date.getDate()}
                minDate={new Date()}
                onClickDay={(value) => handleDateChange(value)}
              />

              {date && (
                <>
                  <div className='time-slots'>
                    <div className='column'>
                      <h2>오전</h2>
                      {renderTimeSlots(0, 11)}
                    </div>
                    <div className='column'>
                      <h2>오후</h2>
                      {renderTimeSlots(12, 23)}
                    </div>
                  </div>

                  <button className='large-btn' onClick={moveToReservation}>
                    선택한 시간으로 예약하기
                  </button>
                </>
              )}
            </>
          )
        }
      </section>
    </div>
  );
};

export default SpaceCalendar;

