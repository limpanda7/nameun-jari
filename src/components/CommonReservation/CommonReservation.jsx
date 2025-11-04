import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { FOREST_PRICE, BLON_PRICE } from '../../constants/price';
import { isFriday, isHoliday, isSummer, isWeekday, isSaturday, formatDateWithDay } from '../../utils/date';
import { FOREST_API_BASE } from '../../utils/api';
import './CommonReservation.css';

const CommonReservation = ({
  propertyType,
  title,
  calendarPath,
  backPath,
  priceConfig,
  maxPerson = 6,
  maxBaby = 4,
  maxDog = 2,
  basePerson = 2,
  bankAccount = "카카오 79420205681 남은비"
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const picked = location.state?.picked || [];

  const [person, setPerson] = useState(basePerson);
  const [baby, setBaby] = useState(0);
  const [dog, setDog] = useState(0);
  const [barbecue, setBarbecue] = useState('N');
  const [basePrice, setBasePrice] = useState(0);
  const [price, setPrice] = useState(0);
  const [priceOption, setPriceOption] = useState('refundable');
  const [discount, setDiscount] = useState(0);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  let isRequested = false;

  useEffect(() => {
    calcPrice();
  }, [person, dog, barbecue, priceOption, picked]);

  const calcPrice = () => {
    let tempBasePrice = 0;

    for (let i = 0; i < picked.length - 1; i++) {
      const date = picked[i];
      let dayPrice = 0;

      if (propertyType === 'blon') {
        // 블로뉴숲: 토요일, 금요일을 별도로 계산
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
    }

    let totalPrice = tempBasePrice;
    const days = picked.length - 1;

    // 인원 초과 요금
    if (propertyType === 'blon') {
      // 블로뉴숲: 최소 4인 기준 (4인 미만이어도 4인으로 계산)
      const personCnt = person >= 4 ? person : 4;
      const overPersonPrice = priceConfig.OVER_FOUR * (personCnt - 4) * days;
      totalPrice += overPersonPrice;

      // 반려견 요금
      if (dog > 0) {
        const dogPrice = priceConfig.DOG * dog * days;
        totalPrice += dogPrice;
      }
    } else {
      // 백년한옥별채: 2인 초과 기준
      if (person > 2) {
        const overPersonPrice = priceConfig.OVER_TWO * (person - 2) * days;
        totalPrice += overPersonPrice;
      }

      // 반려견 요금
      if (dog > 0) {
        const dogPrice = priceConfig.DOG * dog * days;
        totalPrice += dogPrice;
      }
    }

    // 바베큐 요금
    if (barbecue === 'Y') {
      totalPrice += priceConfig.BARBECUE;
    }

    // 환불불가 할인
    if (priceOption === 'non-refundable') {
      const discountAmount = totalPrice * 0.1;
      setDiscount(discountAmount);
      totalPrice *= 0.9;
    } else {
      setDiscount(0);
    }

    setBasePrice(tempBasePrice);
    setPrice(totalPrice);
  };

  const saveReservation = async () => {
    if (isRequested) {
      return;
    }

    if (name === '' || phone === '') {
      alert('정보를 모두 입력해주세요.');
      return;
    }

    if (window.confirm(`성함: ${name}, 전화번호: ${phone}가 맞습니까?`)) {
      const bedding = person > 4 ? 1 : 0;
      try {
        isRequested = true;
        setIsLoading(true);

        const response = await fetch(`${FOREST_API_BASE}/reservation/${propertyType}`, {
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
            bedding,
            barbecue,
            price,
            priceOption
          })
        });

        if (response.ok) {
          alert(`예약해주셔서 감사합니다! 입금하실 금액은 ${price.toLocaleString()}원입니다.`);
          navigate(backPath);
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
            onClick={() => navigate(calendarPath)}
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
            onClick={() => navigate(calendarPath)}
          >
            날짜 선택하기
          </button>
        </div>
      </div>
    );
  }

  const overPersonKey = propertyType === 'forest' ? 'OVER_TWO' : 'OVER_FOUR';
  const overPersonThreshold = propertyType === 'forest' ? 2 : 4;

  return (
    <div className="common-reservation">
      <button
        className="back-button"
        onClick={() => navigate(calendarPath)}
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
              <span className="label">숙박일수</span>
              <span className="value">{picked.length - 1}박</span>
            </div>
          </div>
        </section>

        {/* 인원 및 옵션 선택 */}
        <section className="guest-options-section">
          <h2>인원수 선택 (최대 {maxPerson}인)</h2>

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
                  onClick={() => setPerson(Math.min(maxPerson, person + 1))}
                  disabled={person >= maxPerson}
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

        {/* 바베큐 선택 */}
        <section className="barbecue-option-section">
          <h2>바베큐 선택</h2>
          <div className="price-option-group">
            <label className="radio-label">
              <input
                type="radio"
                name="barbecue"
                value="Y"
                checked={barbecue === 'Y'}
                onChange={(e) => setBarbecue(e.target.value)}
              />
              <span>예</span>
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="barbecue"
                value="N"
                checked={barbecue === 'N'}
                onChange={(e) => setBarbecue(e.target.value)}
              />
              <span>아니오</span>
            </label>
          </div>
        </section>

        {/* 가격 옵션 */}
        <section className="price-option-section">
          <h2>가격 옵션</h2>
          <div className="price-option-group">
            <label className="radio-label">
              <input
                type="radio"
                name="priceOption"
                value="refundable"
                checked={priceOption === 'refundable'}
                onChange={(e) => setPriceOption(e.target.value)}
              />
              <span>환불 가능 (기본가)</span>
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="priceOption"
                value="non-refundable"
                checked={priceOption === 'non-refundable'}
                onChange={(e) => setPriceOption(e.target.value)}
              />
              <span>환불 불가 (10% 할인)</span>
            </label>
          </div>
        </section>

        {/* 총 요금 */}
        <section className="price-total-section">
          <h2>총 이용요금</h2>
          <div className="total-price">{price.toLocaleString()}원</div>
          <div className="price-detail">
            <p><b>숙박요금:</b> {basePrice.toLocaleString()}원 (총 {picked.length - 1}박)</p>
            {propertyType === 'blon' && (() => {
              const personCnt = person >= 4 ? person : 4;
              const overPerson = personCnt - 4;
              return overPerson > 0 && (
                <p><b>인원초과:</b> {priceConfig.OVER_FOUR.toLocaleString()}원 x {overPerson}명 x {picked.length - 1}박</p>
              );
            })()}
            {propertyType === 'forest' && person > 2 && (
              <p><b>인원초과:</b> {priceConfig.OVER_TWO.toLocaleString()}원 x {person - 2}명 x {picked.length - 1}박</p>
            )}
            {dog > 0 && (
              <p><b>반려견:</b> {priceConfig.DOG.toLocaleString()}원 x {dog}마리 x {picked.length - 1}박</p>
            )}
            {barbecue === 'Y' && (
              <p><b>바베큐:</b> {priceConfig.BARBECUE.toLocaleString()}원</p>
            )}
            {discount > 0 && (
              <p><b>환불불가 할인:</b> -{Math.floor(discount).toLocaleString()}원</p>
            )}
          </div>
        </section>

        {/* 입금 정보 */}
        <section className="deposit-section">
          <h2>입금하기</h2>
          <div className="bank-account">{bankAccount}</div>
          <p>
            위 계좌로 <b>{price.toLocaleString()}원</b>을 입금해주세요.<br/>
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

export default CommonReservation;
