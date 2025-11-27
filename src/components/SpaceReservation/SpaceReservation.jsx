import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { SPACE_PRICE } from '../../constants/price';
import { formatDateWithDay } from '../../utils/date';
import { saveSpaceReservation } from '../../utils/firestore';
import '../CommonReservation/CommonReservation.css';

const SpaceReservation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { date, time } = location.state || {};

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [person, setPerson] = useState(2);
  const [purpose, setPurpose] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);

  let isRequested = false;

  useEffect(() => {
    if (date && time && time.length > 0) {
      calculatePrice();
    }
  }, [date, time, person]);

  const calculatePrice = () => {
    if (!date || !time || time.length === 0) return;

    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.getDay(); // 0 = 일요일, 6 = 토요일
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6; // 일, 금, 토

    // 시간당 가격 결정
    const pricePerHour = isWeekend ? SPACE_PRICE.WEEKEND : SPACE_PRICE.WEEKDAY;
    
    // 기본 가격 (2인 기준)
    let basePrice = pricePerHour * time.length;
    
    // 2인 초과 시 추가 요금
    if (person > 2) {
      const additionalPersons = person - 2;
      const additionalPrice = SPACE_PRICE.OVER_TWO * additionalPersons * time.length;
      basePrice += additionalPrice;
    }

    setTotalPrice(basePrice);
  };

  const saveReservation = async () => {
    if (isRequested) {
      return;
    }

    if (!date || !time || time.length === 0) {
      alert('날짜와 시간을 선택해주세요.');
      navigate('/space/calendar');
      return;
    }

    if (name === '' || phone === '') {
      alert('정보를 모두 입력해주세요.');
      return;
    }

    if (purpose === '') {
      alert('사용 목적을 입력해주세요.');
      return;
    }

    if (window.confirm(`성함: ${name}, 전화번호: ${phone}가 맞습니까?`)) {
      try {
        isRequested = true;
        setIsLoading(true);

        const startTime = Math.min(...time);
        const endTime = Math.max(...time) + 1;

        // Firestore에 예약 저장
        const reservationId = await saveSpaceReservation({
          date,
          time,
          name,
          phone,
          person,
          purpose: purpose,
          price: totalPrice,
          checkin_time: startTime,
          checkout_time: endTime
        });

        // 텔레그램 알림 및 MMS 발송
        try {
          const telegramResponse = await fetch('/api/telegram-webhook', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              reservationData: {
                propertyType: 'space',
                name,
                phone,
                person,
                purpose: purpose,
                price: totalPrice,
                date,
                time,
                checkin_time: startTime,
                checkout_time: endTime,
                createdAt: new Date().toISOString()
              }
            })
          });

          if (!telegramResponse.ok) {
            const errorText = await telegramResponse.text();
            console.warn('텔레그램 알림 전송 실패:', errorText);
          } else {
            console.log('텔레그램 알림 전송 성공');
          }
        } catch (telegramError) {
          // 텔레그램 알림 실패는 예약 저장을 막지 않음
          console.warn('텔레그램 알림 전송 중 오류:', telegramError);
        }

        alert(`예약해주셔서 감사합니다! 입금하실 금액은 ${totalPrice.toLocaleString()}원입니다.`);
        navigate('/space');
      } catch (e) {
        isRequested = false;
        setIsLoading(false);
        alert('오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        console.error('예약 에러:', e);
      }
    }
  };

  if (!date || !time || time.length === 0) {
    return (
      <div className="common-reservation">
        <div className="common-reservation-header">
          <button
            className="back-button"
            onClick={() => navigate('/space/calendar')}
          >
            <ArrowLeft size={20} />
            돌아가기
          </button>
        </div>
        <div className="no-dates-selected">
          <h2>날짜와 시간을 선택해주세요</h2>
          <p>예약하려면 먼저 날짜와 시간을 선택해주세요.</p>
          <button
            className="select-dates-btn"
            onClick={() => navigate('/space/calendar')}
          >
            날짜 선택하기
          </button>
        </div>
      </div>
    );
  }

  const timeRange = `${Math.min(...time)}:00 ~ ${Math.max(...time) + 1}:00`;
  const selectedDate = new Date(date);
  const dayOfWeek = selectedDate.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6;
  const pricePerHour = isWeekend ? SPACE_PRICE.WEEKEND : SPACE_PRICE.WEEKDAY;

  return (
    <div className="common-reservation">
      <button
        className="back-button"
        onClick={() => navigate('/space/calendar')}
      >
        <ArrowLeft size={20} />
        돌아가기
      </button>

      {/* 예약 정보 */}
      <section className="reservation-info-section">
        <h2>예약 정보</h2>
        <div className="info-grid">
          <div className="info-item">
            <span className="label">날짜</span>
            <span className="value">{formatDateWithDay(date)}</span>
          </div>
          <div className="info-item">
            <span className="label">시간</span>
            <span className="value">{timeRange}</span>
          </div>
          <div className="info-item">
            <span className="label">이용 시간</span>
            <span className="value">{time.length}시간</span>
          </div>
        </div>
      </section>

      {/* 인원 및 목적 선택 */}
      <section className="guest-options-section">
        <h2>인원수 선택</h2>

        <div className="option-group">
          <div className="option-header">
            <span className="option-title">인원</span>
            <div className="counter-container">
              <button
                type="button"
                className="counter-btn"
                onClick={() => setPerson(Math.max(1, person - 1))}
                disabled={person <= 1}
              >
                -
              </button>
              <span className="counter-value">{person}</span>
              <button
                type="button"
                className="counter-btn"
                onClick={() => setPerson(person + 1)}
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className="input-group" style={{ marginTop: '20px' }}>
          <label>
            <span className="input-label">사용 목적 <span style={{ color: '#e53e3e' }}>*</span></span>
            <input
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="예: 회의, 스터디, 작업 등"
            />
          </label>
        </div>
      </section>

      {/* 총 요금 */}
      <section className="price-total-section">
        <h2>요금 정보</h2>
        <div className="price-detail">
          <p style={{fontSize: '15px'}}>
            <b>시간당 요금:</b> {pricePerHour.toLocaleString()}원 ({isWeekend ? '금~일' : '월~목'})
          </p>
          <p style={{fontSize: '15px'}}>
            <b>기본 요금:</b> {pricePerHour.toLocaleString()}원 x {time.length}시간 = {(pricePerHour * time.length).toLocaleString()}원
          </p>
          {person > 2 && (
            <p style={{fontSize: '15px'}}>
              <b>추가 인원 요금:</b> {SPACE_PRICE.OVER_TWO.toLocaleString()}원 x {person - 2}명 x {time.length}시간 = {(SPACE_PRICE.OVER_TWO * (person - 2) * time.length).toLocaleString()}원
            </p>
          )}
          <div style={{marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #eee'}}>
            <p style={{fontSize: '20px', fontWeight: 'bold', marginTop: '12px', color: '#2c3e50'}}>
              <b>총 입금액:</b> {totalPrice.toLocaleString()}원
            </p>
          </div>
        </div>
      </section>

      {/* 입금 정보 */}
      <section className="deposit-section">
        <h2>입금하기</h2>
        <div className="bank-account">카카오 3333058451192 남은비</div>
        <p>
          위 계좌로 <b>{totalPrice.toLocaleString()}원</b>을 입금해주세요.<br/>
          3시간 내에 입금 해 주셔야 예약이 확정됩니다.
        </p>

        <div className="input-group">
          <label>
            <span className="input-label">입금하실 분 성함:</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="성함을 입력해주세요"
            />
          </label>
        </div>

        <div className="input-group">
          <label>
            <span className="input-label">전화번호:</span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '');
                if (value.length <= 11) {
                  setPhone(value);
                }
              }}
              placeholder="전화번호를 입력해주세요"
              maxLength={11}
            />
          </label>
        </div>

        <button
          className="reservation-btn"
          onClick={saveReservation}
          disabled={isLoading || !name || !phone}
        >
          {isLoading ? '예약 처리 중...' : '예약하기'}
        </button>
      </section>
    </div>
  );
};

export default SpaceReservation;

