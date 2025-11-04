import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ON_OFF_PRICE } from '../../constants/price';
import { formatDateWithDay } from '../../utils/date';
import { FOREST_API_BASE } from '../../utils/api';
import '../CommonReservation/CommonReservation.css';

const OnOffReservation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const picked = location.state?.picked || [];

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [weeks, setWeeks] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [usagePrice, setUsagePrice] = useState(0);
  const [person, setPerson] = useState(2);
  const [baby, setBaby] = useState(0);
  const [dog, setDog] = useState(0);

  let isRequested = false;

  useEffect(() => {
    if (picked.length > 0) {
      // 일주일 단위로 계산 (7일 = 1주)
      const calculatedWeeks = Math.ceil(picked.length / 7);
      setWeeks(calculatedWeeks);

      // 가격 계산: (임대료 + 관리비) * 주수 + 청소비 + 보증금
      const pricePerWeek = ON_OFF_PRICE.RENT_PER_WEEK + ON_OFF_PRICE.MANAGEMENT_PER_WEEK;
      const calculatedUsagePrice = pricePerWeek * calculatedWeeks + ON_OFF_PRICE.CLEANING_FEE;
      const calculatedTotal = calculatedUsagePrice + ON_OFF_PRICE.DEPOSIT;
      setUsagePrice(calculatedUsagePrice);
      setTotalPrice(calculatedTotal);
    }
  }, [picked]);

  const saveReservation = async () => {
    if (isRequested) {
      return;
    }

    if (name === '' || phone === '') {
      alert('정보를 모두 입력해주세요.');
      return;
    }

    if (window.confirm(`성함: ${name}, 전화번호: ${phone}가 맞습니까?`)) {
      try {
        isRequested = true;
        setIsLoading(true);

        const response = await fetch(`${FOREST_API_BASE}/reservation/on_off`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            picked,
            name,
            phone,
            person,
            baby,
            dog,
            price: totalPrice,
            weeks: weeks
          })
        });

        if (response.ok) {
          alert(`예약해주셔서 감사합니다! 입금하실 금액은 ${totalPrice.toLocaleString()}원입니다.`);
          navigate('/on-off');
        } else {
          throw new Error('예약 요청에 실패했습니다.');
        }
      } catch (e) {
        isRequested = false;
        setIsLoading(false);
        alert('오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        console.error('예약 에러:', e);
      }
    }
  };

  if (picked.length === 0) {
    return (
      <div className="common-reservation">
        <div className="common-reservation-header">
          <button
            className="back-button"
            onClick={() => navigate('/on-off/calendar')}
          >
            <ArrowLeft size={20} />
            돌아가기
          </button>
        </div>
        <div className="no-dates-selected">
          <h2>날짜를 선택해주세요</h2>
          <p>예약하려면 먼저 체크인과 체크아웃 날짜를 선택해주세요.</p>
          <button
            className="select-dates-btn"
            onClick={() => navigate('/on-off/calendar')}
          >
            날짜 선택하기
          </button>
        </div>
      </div>
    );
  }

  const pricePerWeek = ON_OFF_PRICE.RENT_PER_WEEK + ON_OFF_PRICE.MANAGEMENT_PER_WEEK;

  return (
    <div className="common-reservation">
      <button
        className="back-button"
        onClick={() => navigate('/on-off/calendar')}
      >
        <ArrowLeft size={20} />
        돌아가기
      </button>

      {/* 예약 정보 */}
      <section className="reservation-info-section">
        <h2>예약 정보</h2>
        <div className="info-grid">
          <div className="info-item">
            <span className="label">체크인</span>
            <span className="value">{formatDateWithDay(picked[0])}</span>
          </div>
          <div className="info-item">
            <span className="label">체크아웃</span>
            <span className="value">{formatDateWithDay(picked[picked.length - 1])}</span>
          </div>
          <div className="info-item">
            <span className="label">이용 기간</span>
            <span className="value">{weeks}주 ({picked.length - 1}박)</span>
          </div>
        </div>
      </section>

      {/* 인원 및 옵션 선택 */}
      <section className="guest-options-section">
        <h2>인원수 선택 (최대 6인)</h2>

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
                onClick={() => setPerson(Math.min(6, person + 1))}
                disabled={person >= 6}
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className="option-group">
          <div className="option-header">
            <span className="option-title">영유아(36개월 미만)</span>
            <div className="counter-container">
              <button
                type="button"
                className="counter-btn"
                onClick={() => setBaby(Math.max(0, baby - 1))}
                disabled={baby <= 0}
              >
                -
              </button>
              <span className="counter-value">{baby}</span>
              <button
                type="button"
                className="counter-btn"
                onClick={() => setBaby(baby + 1)}
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className="option-group">
          <div className="option-header">
            <span className="option-title">반려견</span>
            <div className="counter-container">
              <button
                type="button"
                className="counter-btn"
                onClick={() => setDog(Math.max(0, dog - 1))}
                disabled={dog <= 0}
              >
                -
              </button>
              <span className="counter-value">{dog}</span>
              <button
                type="button"
                className="counter-btn"
                onClick={() => setDog(dog + 1)}
              >
                +
              </button>
            </div>
          </div>
        </div>

      </section>

      {/* 총 요금 */}
      <section className="price-total-section">
        <h2>요금 정보</h2>
        <div className="price-detail">
          <p style={{fontSize: '15px'}}><b>임대료:</b> {ON_OFF_PRICE.RENT_PER_WEEK.toLocaleString()}원 x {weeks}주 = {(ON_OFF_PRICE.RENT_PER_WEEK * weeks).toLocaleString()}원</p>
          <p style={{fontSize: '15px'}}><b>관리비:</b> {ON_OFF_PRICE.MANAGEMENT_PER_WEEK.toLocaleString()}원 x {weeks}주 = {(ON_OFF_PRICE.MANAGEMENT_PER_WEEK * weeks).toLocaleString()}원</p>
          <p style={{fontSize: '15px'}}><b>청소비:</b> {ON_OFF_PRICE.CLEANING_FEE.toLocaleString()}원</p>
          <div style={{marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #eee'}}>
            <p style={{fontSize: '15px', fontWeight: '600', marginBottom: '8px'}}><b>실제 이용요금:</b> {usagePrice.toLocaleString()}원</p>
            <p style={{fontSize: '15px', color: '#666', marginBottom: '8px'}}><b>보증금:</b> {ON_OFF_PRICE.DEPOSIT.toLocaleString()}원</p>
            <p style={{fontSize: '20px', fontWeight: 'bold', marginTop: '12px', color: '#2c3e50'}}><b>총 입금액:</b> {totalPrice.toLocaleString()}원</p>
          </div>
        </div>
      </section>

      {/* 입금 정보 */}
      <section className="deposit-section">
        <h2>입금하기</h2>
        <div className="bank-account">카카오 3333053810252 채민기</div>
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

export default OnOffReservation;

