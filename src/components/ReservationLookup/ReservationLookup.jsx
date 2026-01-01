import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import { getReservationByNumber } from '../../utils/firestore';
import { formatDateWithDay } from '../../utils/date';
import './ReservationLookup.css';

const PROPERTY_TYPE_LABELS = {
  'forest': '백년한옥별채',
  'blon': '블로뉴숲',
  'on_off': '온오프스테이',
  'mukho': '묵호쉴래',
  'space': '온오프스페이스'
};

const ReservationLookup = () => {
  const navigate = useNavigate();
  const [reservationNumber, setReservationNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [reservation, setReservation] = useState(null);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!reservationNumber || reservationNumber.trim().length !== 5) {
      setError('예약번호 5자리를 정확히 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');
    setReservation(null);

    try {
      const result = await getReservationByNumber(reservationNumber.trim().toUpperCase());
      if (result) {
        setReservation(result);
      } else {
        setError('예약을 찾을 수 없습니다. 예약번호를 다시 확인해주세요.');
      }
    } catch (err) {
      console.error('예약 조회 오류:', err);
      setError('예약 조회 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (time) => {
    if (typeof time === 'number') {
      return `${time}:00`;
    }
    return time;
  };

  return (
    <div className="reservation-lookup">
      <button
        className="back-button"
        onClick={() => navigate('/')}
      >
        <ArrowLeft size={20} />
        홈으로
      </button>

      <div className="lookup-container">
        <h1>예약 조회</h1>
        <p className="lookup-description">
          예약 완료 시 발급받은 5자리 예약번호를 입력해주세요.
        </p>

        <div className="lookup-form">
          <div className="form-group">
            <label>
              예약번호 <span className="required">*</span>
            </label>
            <input
              type="text"
              value={reservationNumber}
              onChange={(e) => {
                const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                if (value.length <= 5) {
                  setReservationNumber(value);
                }
              }}
              maxLength={5}
              style={{ textTransform: 'uppercase', fontSize: '1.2rem', letterSpacing: '0.2em', textAlign: 'center' }}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && reservationNumber.length === 5) {
                  handleSearch();
                }
              }}
            />
          </div>

          <button
            className="search-button"
            onClick={handleSearch}
            disabled={isLoading || !reservationNumber || reservationNumber.length !== 5}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                조회 중...
              </>
            ) : (
              <>
                <Search size={20} />
                조회하기
              </>
            )}
          </button>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
        </div>

        {/* 예약 결과 */}
        {reservation && (
          <div className="reservation-result">
            <h2>예약 정보</h2>
            <div className="reservation-card">
              {reservation.propertyType && (
                <div className="property-type-badge">
                  {PROPERTY_TYPE_LABELS[reservation.propertyType] || reservation.propertyType}
                </div>
              )}

              <div className="reservation-details">
                <div className="detail-row">
                  <span className="detail-label">예약자명</span>
                  <span className="detail-value">{reservation.name}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">전화번호</span>
                  <span className="detail-value">{reservation.phone}</span>
                </div>
                {reservation.checkin_date && (
                  <div className="detail-row">
                    <span className="detail-label">체크인</span>
                    <span className="detail-value">
                      {formatDateWithDay(reservation.checkin_date)}
                    </span>
                  </div>
                )}
                {reservation.checkout_date && (
                  <div className="detail-row">
                    <span className="detail-label">체크아웃</span>
                    <span className="detail-value">
                      {formatDateWithDay(reservation.checkout_date)}
                    </span>
                  </div>
                )}
                {reservation.date && (
                  <div className="detail-row">
                    <span className="detail-label">예약 날짜</span>
                    <span className="detail-value">
                      {formatDateWithDay(reservation.date)}
                    </span>
                  </div>
                )}
                {reservation.checkin_time && reservation.checkout_time && (
                  <div className="detail-row">
                    <span className="detail-label">이용 시간</span>
                    <span className="detail-value">
                      {formatTime(reservation.checkin_time)} ~ {formatTime(reservation.checkout_time)}
                    </span>
                  </div>
                )}
                {reservation.person !== undefined && (
                  <div className="detail-row">
                    <span className="detail-label">인원</span>
                    <span className="detail-value">{reservation.person}명</span>
                  </div>
                )}
                {reservation.price !== undefined && (
                  <div className="detail-row highlight">
                    <span className="detail-label">예약 금액</span>
                    <span className="detail-value">{reservation.price.toLocaleString()}원</span>
                  </div>
                )}
                {reservation.createdAt && (
                  <div className="detail-row">
                    <span className="detail-label">예약 일시</span>
                    <span className="detail-value">
                      {new Date(reservation.createdAt).toLocaleString('ko-KR')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReservationLookup;





