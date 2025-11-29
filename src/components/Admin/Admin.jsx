import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactModal from 'react-modal';
import { getReservations, getIcalReservations, deleteReservation, confirmReservation } from '../../utils/firestore';
import { formatDate } from '../../utils/date';
import './Admin.css';

const BLON_PASSWORD = '0125';
const FOREST_PASSWORD = '8757';

const Admin = () => {
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(false);
  const [target, setTarget] = useState(null);
  const [targetKo, setTargetKo] = useState(null);
  const [reserved, setReserved] = useState([]);
  const [selected, setSelected] = useState(null);
  const [isInfoModal, setIsInfoModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    switch (password) {
      case FOREST_PASSWORD:
        setTarget('forest');
        setTargetKo('백년한옥별채');
        setIsLogin(true);
        break;
      case BLON_PASSWORD:
        setTarget('blon');
        setTargetKo('블로뉴숲');
        setIsLogin(true);
        break;
      default:
        break;
    }
  }, [password]);

  useEffect(() => {
    if (target) {
      init();
    }
  }, [target]);

  const init = async () => {
    setIsLoading(true);
    try {
      // 오늘 날짜 (YYYY-MM-DD 형식)
      const today = new Date();
      const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

      // 홈페이지 예약과 ical 예약을 동시에 조회
      const [homepageReserved, airbnbReserved] = await Promise.all([
        getReservations(target).catch(err => {
          console.warn('홈페이지 예약 데이터 조회 실패, 빈 배열 반환:', err);
          return [];
        }),
        getIcalReservations(target).catch(err => {
          console.warn('iCal 예약 데이터 조회 실패, 빈 배열 반환:', err);
          return [];
        })
      ]);

      let tempReserved = [];

      // 홈페이지 예약 데이터 변환
      for (const element of homepageReserved) {
        const checkinDate = element.checkin_date || element.checkinDate;
        // 오늘 이후의 체크인 날짜만 포함
        if (checkinDate && checkinDate >= todayString) {
          tempReserved.push({
            ...element,
            type: 'homepage',
            checkin_date: checkinDate,
            checkout_date: element.checkout_date || element.checkoutDate,
          });
        }
      }

      // iCal 예약 데이터 변환
      for (const element of airbnbReserved) {
        const checkinDate = element.start_dt;
        // 오늘 이후의 체크인 날짜만 포함
        if (checkinDate && checkinDate >= todayString) {
          tempReserved.push({
            ...element,
            type: 'airbnb',
            checkin_date: checkinDate,
            checkout_date: element.end_dt,
          });
        }
      }

      // 체크인 날짜 기준으로 정렬
      tempReserved.sort((a, b) => {
        const dateA = new Date(a.checkin_date);
        const dateB = new Date(b.checkin_date);
        return dateA - dateB;
      });

      setReserved(tempReserved);
    } catch (error) {
      console.error('예약 조회 실패:', error);
      alert('예약 조회 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const showDetail = (row) => {
    if (row.name) {
      setSelected(row);
      setIsInfoModal(true);
    } else if (row.reservation_id) {
      // 에어비앤비 예약인 경우 링크로 열기
      window.open(`https://www.airbnb.com/hosting/reservations/details/${row.reservation_id}`, '_blank');
    }
  };

  const handleDeleteClick = async (reservationId) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) {
      return;
    }

    try {
      setIsLoading(true);
      await deleteReservation(target, reservationId);
      alert('예약이 삭제되었습니다.');
      await init(); // 목록 새로고침
    } catch (error) {
      console.error('예약 삭제 실패:', error);
      alert('예약 삭제 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmClick = async (reservation) => {
    if (!reservation.id || !reservation.phone) {
      alert('예약 정보가 올바르지 않습니다.');
      return;
    }

    if (!window.confirm('예약을 확정하고 고객에게 문자를 보내시겠습니까?')) {
      return;
    }

    try {
      setIsLoading(true);

      // Firestore에 확정 상태 업데이트
      await confirmReservation(target, reservation.id);

      // 확정 문자 전송
      const response = await fetch('/api/confirm-reservation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: reservation.phone,
          propertyType: target,
          reservationId: reservation.id
        })
      });

      const result = await response.json();

      if (result.success) {
        alert('예약이 확정되었고 고객에게 문자를 발송했습니다.');
        await init(); // 목록 새로고침
      } else {
        throw new Error(result.error || '확정 문자 발송 실패');
      }
    } catch (error) {
      console.error('예약 확정 실패:', error);
      alert('예약 확정 중 오류가 발생했습니다: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    if (target) {
      setPassword('');
      setIsLogin(false);
      setTarget(null);
      setTargetKo(null);
      setReserved([]);
      setSelected(null);
    } else {
      navigate('/');
    }
  };

  const formatDateDisplay = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}-${day}`;
  };

  const formatDateFull = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const modalStyle = {
    content: {
      width: '80%',
      maxWidth: '600px',
      maxHeight: '80%',
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      padding: '20px',
      borderRadius: '8px',
    },
    info: {
      marginBottom: '10px',
    },
    closeButton: {
      position: 'absolute',
      top: '10px',
      right: '10px',
      backgroundColor: '#ddd',
      border: 'none',
      color: '#333',
      padding: '8px 16px',
      fontSize: '14px',
      cursor: 'pointer',
      borderRadius: '4px',
      transition: 'background-color 0.3s ease'
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <button className="admin-back-button" onClick={handleGoBack}>
          ← 돌아가기
        </button>
        <h1 className="admin-title">
          {targetKo ? `관리자 페이지 - ${targetKo}` : '관리자 페이지'}
        </h1>
      </div>

      <div className="admin-content">
        {!isLogin ? (
          <div className="admin-login">
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="admin-password-input"
              onKeyPress={e => {
                if (e.key === 'Enter') {
                  // 비밀번호 입력 후 자동으로 로그인 처리됨 (useEffect)
                }
              }}
            />
          </div>
        ) : (
          <>
            {isLoading && <div className="admin-loading">로딩 중...</div>}
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: '100px' }}>체크인</th>
                    <th style={{ width: '100px' }}>체크아웃</th>
                    <th style={{ width: '80px' }}>구분</th>
                    <th>이름/전화번호</th>
                    <th style={{ width: '80px' }}></th>
                    <th style={{ width: '80px' }}></th>
                    <th style={{ width: '80px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {reserved.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                        예약 내역이 없습니다.
                      </td>
                    </tr>
                  ) : (
                    reserved.map((row, i) => (
                      <tr key={i}>
                        <td>{formatDateDisplay(row.checkin_date)}</td>
                        <td>{formatDateDisplay(row.checkout_date)}</td>
                        <td className={row.type === 'homepage' ? 'homepage-cell' : 'airbnb-cell'}>
                          {row.type === 'homepage' ? '홈' : '에'}
                        </td>
                        <td>{row.name || row.phone_last_digits || '(막았음)'}</td>
                        <td>
                          {(row.name || row.reservation_id) && (
                            <button
                              className="admin-detail-btn"
                              onClick={() => showDetail(row)}
                            >
                              상세
                            </button>
                          )}
                        </td>
                        <td>
                          {row.name && row.type === 'homepage' && (
                            <button
                              className="admin-confirm-btn"
                              onClick={() => handleConfirmClick(row)}
                              disabled={row.confirmed === 'Y' || isLoading}
                            >
                              {row.confirmed === 'Y' ? '확정됨' : '확정'}
                            </button>
                          )}
                        </td>
                        <td>
                          {row.name && row.type === 'homepage' && (
                            <button
                              className="admin-delete-btn"
                              onClick={() => handleDeleteClick(row.id)}
                            >
                              삭제
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <ReactModal
        isOpen={isInfoModal}
        onRequestClose={() => setIsInfoModal(false)}
        style={modalStyle}
        ariaHideApp={false}
      >
        <div className="reservation-info">
          {selected && (
            <>
              <div style={modalStyle.info}>
                기간: {formatDateFull(selected.checkin_date)} ~ {formatDateFull(selected.checkout_date)}
              </div>
              <div style={modalStyle.info}>이름: {selected.name}</div>
              <div style={modalStyle.info}>전화번호: {selected.phone}</div>
              <div style={modalStyle.info}>
                인원수: {selected.person}명, 영유아 {selected.baby || 0}명, 반려견 {selected.dog || 0}마리
              </div>
              <div style={modalStyle.info}>추가침구: {selected.bedding || 0}개</div>
              <div style={modalStyle.info}>바베큐 이용여부: {selected.barbecue === 'Y' ? '예' : '아니오'}</div>
              <div style={modalStyle.info}>
                이용금액: {selected.price ? selected.price.toLocaleString() : 0}원
              </div>
              <div style={modalStyle.info}>
                환불옵션: {selected.price_option === 'refundable' ? '환불가능' : '환불불가'}
              </div>
            </>
          )}
        </div>
        <button
          style={modalStyle.closeButton}
          onClick={() => setIsInfoModal(false)}
        >
          X
        </button>
      </ReactModal>

    </div>
  );
};

export default Admin;

