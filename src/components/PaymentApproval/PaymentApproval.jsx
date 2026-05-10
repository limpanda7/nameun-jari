import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { saveReservation as saveReservationToFirestore, saveSpaceReservation } from '../../utils/firestore';
import LoadingOverlay from '../LoadingOverlay/LoadingOverlay';
import '../CommonReservation/CommonReservation.css';

const PaymentApproval = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const processPayment = async () => {
      try {
        // URL에서 pg_token 가져오기
        const pgToken = searchParams.get('pg_token');
        if (!pgToken) {
          throw new Error('결제 토큰을 찾을 수 없습니다.');
        }

        // 세션 스토리지에서 예약 정보 가져오기
        const storedData = sessionStorage.getItem('kakaoPayReservation');
        if (!storedData) {
          throw new Error('예약 정보를 찾을 수 없습니다.');
        }

        const reservationData = JSON.parse(storedData);
        const { tid, partner_order_id, partner_user_id } = reservationData;

        // 카카오페이 결제 승인 API 호출
        const approveResponse = await fetch('/api/kakaopay/approve', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            cid: 'CT50278261',
            tid,
            partner_order_id,
            partner_user_id,
            pg_token: pgToken,
          })
        });

        const approveResult = await approveResponse.json();
        if (!approveResponse.ok) {
          throw new Error(approveResult.msg || '결제 승인 실패');
        }

        console.log('카카오페이 결제 승인 완료:', approveResult);

        // 예약 저장
        let reservationNumber;
        if (reservationData.propertyType === 'space') {
          const result = await saveSpaceReservation({
            date: reservationData.date,
            time: reservationData.time,
            name: reservationData.name,
            phone: reservationData.phone,
            person: reservationData.person,
            purpose: reservationData.purpose,
            price: reservationData.price,
            checkin_time: reservationData.checkin_time,
            checkout_time: reservationData.checkout_time
          });
          reservationNumber = result.reservationNumber;

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
                  name: reservationData.name,
                  phone: reservationData.phone,
                  person: reservationData.person,
                  purpose: reservationData.purpose,
                  price: reservationData.price,
                  date: reservationData.date,
                  time: reservationData.time,
                  checkin_time: reservationData.checkin_time,
                  checkout_time: reservationData.checkout_time,
                  reservationNumber,
                  paymentMethod: 'kakaopay',
                  createdAt: new Date().toISOString()
                }
              })
            });

            if (!telegramResponse.ok) {
              console.warn('텔레그램 알림 전송 실패:', await telegramResponse.text());
            }
          } catch (telegramError) {
            console.warn('텔레그램 알림 전송 중 오류:', telegramError);
          }
        } else {
          const checkinDate = reservationData.picked.length > 0 ? new Date(reservationData.picked[0]).toISOString().split('T')[0] : null;
          const checkoutDate = reservationData.picked.length > 1 ? new Date(reservationData.picked[reservationData.picked.length - 1]).toISOString().split('T')[0] : null;

          const result = await saveReservationToFirestore(reservationData.propertyType, {
            picked: reservationData.picked,
            name: reservationData.name,
            phone: reservationData.phone,
            person: reservationData.person,
            baby: reservationData.baby || 0,
            dog: reservationData.dog,
            bedding: reservationData.bedding || 0,
            barbecue: reservationData.barbecue || 'N',
            fire_pit: reservationData.fire_pit || 'N',
            price: reservationData.price,
            priceOption: reservationData.priceOption || 'refundable'
          });
          reservationNumber = result.reservationNumber;

          // 텔레그램 알림 전송
          try {
            const telegramResponse = await fetch('/api/telegram-webhook', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                reservationData: {
                  propertyType: reservationData.propertyType,
                  name: reservationData.name,
                  phone: reservationData.phone,
                  person: reservationData.person,
                  baby: reservationData.baby || 0,
                  dog: reservationData.dog,
                  bedding: reservationData.bedding || 0,
                  barbecue: reservationData.barbecue || 'N',
                  fire_pit: reservationData.fire_pit || 'N',
                  price: reservationData.price,
                  priceOption: reservationData.priceOption || 'refundable',
                  checkinDate,
                  checkoutDate,
                  reservationNumber,
                  paymentMethod: 'kakaopay',
                  createdAt: new Date().toISOString()
                }
              })
            });

            if (!telegramResponse.ok) {
              console.warn('텔레그램 알림 전송 실패:', await telegramResponse.text());
            }
          } catch (telegramError) {
            console.warn('텔레그램 알림 전송 중 오류:', telegramError);
          }
        }

        // 세션 스토리지에서 제거
        sessionStorage.removeItem('kakaoPayReservation');
        setIsLoading(false);
      } catch (error) {
        console.error('결제 승인 처리 중 오류:', error);
        setError(error.message);
        setIsLoading(false);
      }
    };

    processPayment();
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="common-reservation">
        <LoadingOverlay message="결제를 처리하고 있습니다" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="common-reservation">
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
          <h1 style={{ color: '#e74c3c', marginBottom: '10px', fontSize: '2.8rem' }}>결제 처리 중 오류가 발생했습니다</h1>
          <p style={{ color: '#666', marginBottom: '40px', fontSize: '18px' }}>
            {error}
          </p>
          <button
            className="reservation-btn"
            onClick={() => navigate('/')}
            style={{ maxWidth: '300px', margin: '0 auto' }}
          >
            홈으로 이동
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="common-reservation">
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>✅</div>
        <h1 style={{ color: '#2c3e50', marginBottom: '10px', fontSize: '2.8rem' }}>결제가 완료되었습니다!</h1>
        <p style={{ color: '#666', marginBottom: '40px', fontSize: '18px' }}>
          예약해주셔서 감사합니다.
        </p>

        <button
          className="reservation-btn"
          onClick={() => navigate('/')}
          style={{ maxWidth: '300px', margin: '0 auto' }}
        >
          홈으로 이동
        </button>
      </div>
    </div>
  );
};

export default PaymentApproval;

