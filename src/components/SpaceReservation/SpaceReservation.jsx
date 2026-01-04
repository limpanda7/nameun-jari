import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { SPACE_PRICE } from '../../constants/price';
import { formatDateWithDay } from '../../utils/date';
import { saveSpaceReservation } from '../../utils/firestore';
import kakaopayIcon from '../../assets/kakaopay/payment_icon_yellow_small.png';
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
  const [paymentMethod, setPaymentMethod] = useState('bank');

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

        // 카카오페이 결제인 경우
        if (paymentMethod === 'kakaopay') {
          const timeRange = `${Math.min(...time)}:00 ~ ${Math.max(...time) + 1}:00`;
          const itemName = `스페이스 예약 (${formatDateWithDay(date)} ${timeRange})`;
          const vatAmount = Math.floor(totalPrice / 11);
          const taxFreeAmount = 0;

          const baseUrl = window.location.origin;
          const approvalUrl = `${baseUrl}/payment/approval`;
          const cancelUrl = `${baseUrl}/payment/cancel`;
          const failUrl = `${baseUrl}/payment/fail`;
          
          try {
            // ready API와 approve API에서 동일한 partner_order_id 사용
            const partnerOrderId = `order_${Date.now()}_space`;
            
            const kakaoPayResponse = await fetch('/api/kakaopay/ready', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                cid: 'CT50278261',
                partner_order_id: partnerOrderId,
                partner_user_id: phone,
                item_name: itemName,
                quantity: '1',
                total_amount: totalPrice.toString(),
                vat_amount: vatAmount.toString(),
                tax_free_amount: taxFreeAmount.toString(),
                approval_url: approvalUrl,
                cancel_url: cancelUrl,
                fail_url: failUrl,
              })
            });

            const kakaoPayResult = await kakaoPayResponse.json();
            console.log('카카오페이 API 응답:', kakaoPayResult);

            if (!kakaoPayResult.tid) {
              throw new Error('카카오페이 결제 준비 실패: tid를 받을 수 없습니다.');
            }

            // 세션 스토리지에 예약 정보 저장 (결제 승인 후 사용)
            const reservationData = {
              propertyType: 'space',
              name,
              phone,
              person,
              purpose,
              price: totalPrice,
              date,
              time,
              checkin_time: Math.min(...time),
              checkout_time: Math.max(...time) + 1,
              tid: kakaoPayResult.tid,
              partner_order_id: partnerOrderId,
              partner_user_id: phone,
            };
            sessionStorage.setItem('kakaoPayReservation', JSON.stringify(reservationData));

            // 모바일/PC 환경에 맞는 redirect URL 선택
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            let redirectUrl = null;

            if (isMobile) {
              // 모바일: 앱 URL 우선, 없으면 모바일 웹 URL
              redirectUrl = kakaoPayResult.next_redirect_app_url || kakaoPayResult.next_redirect_mobile_url;
            } else {
              // PC: PC 웹 URL
              redirectUrl = kakaoPayResult.next_redirect_pc_url;
            }

            if (redirectUrl) {
              // 결제 페이지로 리다이렉트
              window.location.href = redirectUrl;
            } else {
              throw new Error('카카오페이 결제 준비 실패: redirect URL을 찾을 수 없습니다.');
            }
          } catch (kakaoPayError) {
            isRequested = false;
            setIsLoading(false);
            alert('카카오페이 결제 준비 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
            console.error('카카오페이 결제 에러:', kakaoPayError);
            return;
          }
        } else {
          // 계좌이체인 경우 기존 로직
          const startTime = Math.min(...time);
          const endTime = Math.max(...time) + 1;

          // Firestore에 예약 저장
          const result = await saveSpaceReservation({
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

          const reservationNumber = result.reservationNumber;

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
                  reservationNumber,
                  paymentMethod: 'bank',
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
        }
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

      {/* 결제수단 선택 - 당분간 숨김 */}
      <section className="payment-method-section" style={{ display: 'none' }}>
        <h2>결제수단 선택</h2>
        <div className="price-option-group">
          <label className="radio-label">
            <input
              type="radio"
              name="paymentMethod"
              value="bank"
              checked={paymentMethod === 'bank'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            <span>계좌이체</span>
          </label>
          <label className="radio-label">
            <input
              type="radio"
              name="paymentMethod"
              value="kakaopay"
              checked={paymentMethod === 'kakaopay'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              카카오페이
              <img 
                src={kakaopayIcon} 
                alt="카카오페이" 
                style={{ width: '50px' }}
              />
            </span>
          </label>
        </div>
      </section>

      {/* 입금 정보 */}
      <section className={`deposit-section ${paymentMethod === 'kakaopay' ? 'hidden' : ''}`}>
        <h2>입금하기</h2>
        <div className="bank-account">카카오 3333058451192 남은비</div>
        <p>
          위 계좌로 <b>{totalPrice.toLocaleString()}원</b>을 입금해주세요.<br/>
          3시간 내에 입금 해 주셔야 예약이 확정됩니다.
        </p>
      </section>

      {/* 예약하기 버튼 */}
      <section className="reservation-button-section">
        <div className="input-group">
          <label>
            <span className="input-label">예약자 성함:</span>
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
          {isLoading ? '예약 처리 중...' : paymentMethod === 'kakaopay' ? '결제하기' : '예약하기'}
        </button>
      </section>
    </div>
  );
};

export default SpaceReservation;

