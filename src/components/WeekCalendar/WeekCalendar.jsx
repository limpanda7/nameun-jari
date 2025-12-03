import ReactCalendar from "react-calendar";
import React, {useMemo, useState, useRef, useEffect} from "react";
import ReactModal from "react-modal";
import {formatDate} from "../../utils/date";
import "./WeekCalendar.css";

const SWIPE_THRESHOLD = 50; // px

const WeekCalendar = ({picked, setPicked, reserved}) => {
  const [selected, setSelected] = useState(null);
  const [duration, setDuration] = useState(null);
  const [maxDate, setMaxDate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeStartDate, setActiveStartDate] = useState(new Date());
  const [touchStartX, setTouchStartX] = useState(null);
  const calendarRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  const checker = useMemo(() => {
    const map = {};
    reserved.forEach(({checkin_date, checkout_date}) => {
      // 날짜를 정규화 (시간 부분 제거)
      const checkinDate = new Date(checkin_date);
      checkinDate.setHours(0, 0, 0, 0);
      const checkinTimestamp = checkinDate.valueOf();
      
      const checkoutDate = new Date(checkout_date);
      checkoutDate.setHours(0, 0, 0, 0);
      const checkoutTimestamp = checkoutDate.valueOf();
      
      map[checkinTimestamp] = {
        ...map[checkinTimestamp],
        checkIn: true,
      };
      map[checkoutTimestamp] = {
        ...map[checkoutTimestamp],
        checkOut: true,
      };
    });
    return map;
  }, [reserved]);

  const handleClickDay = (value) => {
    // 날짜를 정규화하여 비교
    const normalizedDate = new Date(value);
    normalizedDate.setHours(0, 0, 0, 0);
    const dateTimestamp = normalizedDate.valueOf();
    
    if (checker[dateTimestamp]?.checkIn) return;
    setSelected(value);
    setShowModal(true);
  };

  const handleDurationSelect = (weeks) => {
    const days = weeks * 7;
    const startDate = new Date(selected);
    const endDate = new Date(selected);
    endDate.setDate(startDate.getDate() + days - 1);

    // 오늘로부터 12개월 후 날짜 계산 (오늘 날짜에서 1년 후 같은 날짜의 전날까지)
    const twelveMonthsLater = new Date();
    twelveMonthsLater.setMonth(twelveMonthsLater.getMonth() + 12);
    twelveMonthsLater.setDate(twelveMonthsLater.getDate() - 1); // 하루 전날까지
    twelveMonthsLater.setHours(23, 59, 59, 999);

    // 12개월 제한 확인
    if (endDate > twelveMonthsLater) {
      alert("예약 가능한 날짜는 오늘로부터 12개월 이내입니다.");
      setPicked([]);
      setSelected(null);
      setShowModal(false);
      return;
    }

    const blocked = reserved.find(({ checkin_date, checkout_date }) => {
      const checkIn = new Date(checkin_date);
      const checkOut = new Date(checkout_date);
      return startDate < checkOut && endDate >= checkIn;
    });

    if (blocked) {
      alert("해당 기간에는 예약이 불가능합니다.");
      setPicked([]);
      setSelected(null);
      setShowModal(false);
      return;
    }

    const tempArr = [];
    const iterDate = new Date(startDate);
    for (let i = 0; i < days; i++) {
      tempArr.push(formatDate(iterDate));
      iterDate.setDate(iterDate.getDate() + 1);
    }

    setPicked(tempArr);
    setDuration(days);
    setMaxDate(endDate);
    setShowModal(false);
  };

  const tileDisabled = () => {
    return ({ date }) => {
      // 날짜를 정규화하여 비교
      const normalizedDate = new Date(date);
      normalizedDate.setHours(0, 0, 0, 0);
      const dateTimestamp = normalizedDate.valueOf();
      
      // 오늘로부터 12개월 후 날짜 계산 (오늘 날짜에서 1년 후 같은 날짜의 전날까지)
      const twelveMonthsLater = new Date();
      twelveMonthsLater.setMonth(twelveMonthsLater.getMonth() + 12);
      twelveMonthsLater.setDate(twelveMonthsLater.getDate() - 1); // 하루 전날까지
      twelveMonthsLater.setHours(23, 59, 59, 999);
      
      // 12개월 제한 확인
      if (dateTimestamp > twelveMonthsLater.valueOf()) {
        return true;
      }
      
      // 선택된 날짜 범위에 포함된 날짜는 비활성화하지 않음
      if (picked.length > 0) {
        const dateStr = formatDate(date);
        if (picked.includes(dateStr)) {
          return false;
        }
      }
      
      if (
        reserved.find(({ checkin_date, checkout_date }) => {
          const checkinDate = new Date(checkin_date);
          checkinDate.setHours(0, 0, 0, 0);
          const checkinTimestamp = checkinDate.valueOf();
          
          const checkoutDate = new Date(checkout_date);
          checkoutDate.setHours(0, 0, 0, 0);
          const checkoutTimestamp = checkoutDate.valueOf();
          
          return (
            checkinTimestamp <= dateTimestamp &&
            checkoutTimestamp >= dateTimestamp
          );
        })
      ) {
        return true;
      }

      if (picked.length > 0) {
        const lastPicked = new Date(picked[picked.length - 1]);
        if (date > lastPicked) {
          return true;
        }
      }

      if (
        selected &&
        checker[selected]?.checkIn &&
        dateTimestamp > selected
      ) {
        return true;
      } else if (selected && checker[selected]?.checkOut && dateTimestamp < selected) {
        return true;
      } else if (!selected && checker[dateTimestamp]?.checkIn && !checker[dateTimestamp]?.checkOut) {
        // 체크인 날짜이지만 체크아웃 날짜가 아닌 경우만 비활성화 (체크아웃만 가능한 날짜)
        return true;
      }
    };
  };

  const tileClassName = ({ date }) => {
    // 날짜를 정규화하여 비교
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);
    const dateTimestamp = normalizedDate.valueOf();
    
    const dateStr = formatDate(date);
    const isPicked = picked.includes(dateStr);
    
    // 선택된 날짜 범위 내의 날짜인 경우 브라운 색으로 표시 (체크아웃 날짜 포함)
    if (isPicked) return "highlight";

    // 체크아웃만 가능한 날짜 표시 (선택되지 않은 경우에만)
    if (
      !selected &&
      !checker[dateTimestamp]?.checkOut &&
      checker[dateTimestamp]?.checkIn
    ) {
      return "react-calendar__tile--checkout-only";
    }

    return "";
  };

  const resetCalendar = () => {
    setPicked([]);
    setSelected(null);
    setMaxDate(null);
    setDuration(null);
  }

  const modalStyle = {
    content: {
      width: '90%',
      maxWidth: '400px',
      maxHeight: '80%',
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      padding: '12px',
      borderRadius: '12px',
      border: '1px solid #ccc',
      boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
      backgroundColor: '#fff',
    },
    info: {
      marginBottom: '16px',
      fontSize: '16px',
      fontWeight: '500',
      textAlign: 'center',
    },
    durationOptions: {
      textAlign: 'center',
    },
    durationButton: {
      display: 'inline-block',
      margin: '6px',
      padding: '10px 14px',
      fontSize: '14px',
      borderRadius: '8px',
      border: '1px solid #ccc',
      backgroundColor: '#f8f8f8',
      color: '#333',
      cursor: 'pointer',
      transition: 'all 0.2s ease-in-out',
      width: '95px',
      minWidth: '95px',
      maxWidth: '95px',
    },
    selectedDurationButton: {
      backgroundColor: '#005fff',
      color: '#fff',
      borderColor: '#005fff',
    },
    closeButton: {
      position: 'absolute',
      top: '8px',
      right: '8px',
      width: '32px',
      height: '32px',
      backgroundColor: 'transparent',
      border: 'none',
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#999',
      cursor: 'pointer',
      lineHeight: '1',
      transition: 'color 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    durationSub: {
      display: 'block',
      fontSize: '11px',
      marginTop: '4px',
      color: '#777'
    }
  };

  useEffect(() => {
    // 모바일 환경 감지
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const el = calendarRef.current;
    if (!el) return;
    const handleTouchMove = (e) => {
      if (touchStartX !== null) {
        e.preventDefault();
      }
    };
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    return () => {
      el.removeEventListener('touchmove', handleTouchMove);
    };
  }, [touchStartX]);

  // 터치 이벤트 핸들러
  const handleTouchStart = (e) => {
    if (e.touches && e.touches.length === 1) {
      setTouchStartX(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = (e) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchEndX - touchStartX;
    if (Math.abs(diffX) > SWIPE_THRESHOLD) {
      // 왼쪽 스와이프(다음달)
      if (diffX < 0) {
        setActiveStartDate((prev) => {
          const next = new Date(prev);
          next.setMonth(next.getMonth() + 1);
          return next;
        });
      }
      // 오른쪽 스와이프(이전달)
      else if (diffX > 0) {
        setActiveStartDate((prev) => {
          const prevMonth = new Date(prev);
          prevMonth.setMonth(prevMonth.getMonth() - 1);
          return prevMonth;
        });
      }
    }
    setTouchStartX(null);
  };

  return (
    <div className='Calendar'>
      <div className='DateAndBtnWrap'>
        <div className='PickedDate'>
          <div className='DateWrap'>
            <div className='DateTitle'>체크인</div>
            <div className='DateContent'>{picked[0] || "-"}</div>
          </div>
          <div className='DateWrap'>
            <div className='DateTitle'>체크아웃</div>
            <div className='DateContent'>{picked[picked.length - 1] || "-"}</div>
          </div>
        </div>
        <button
          className='DateResetBtn'
          onClick={resetCalendar}
        >
          초기화
        </button>
      </div>
      <div
        ref={calendarRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{position:'relative'}}
      >
        <ReactCalendar
          className="calendar"
          calendarType="gregory"
          prev2Label={null}
          next2Label={null}
          formatDay={(localeDay, date) => date.getDate()}
          minDate={selected ? new Date(selected) : (() => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            return tomorrow;
          })()}
          maxDate={maxDate || (() => {
            const twelveMonthsLater = new Date();
            twelveMonthsLater.setMonth(twelveMonthsLater.getMonth() + 12);
            twelveMonthsLater.setDate(twelveMonthsLater.getDate() - 1); // 하루 전날까지
            return twelveMonthsLater;
          })()}
          tileDisabled={tileDisabled()}
          tileClassName={tileClassName}
          onClickDay={handleClickDay}
          value={picked.length ? [new Date(picked[0]), new Date(picked[picked.length - 1])] : null}
          activeStartDate={activeStartDate}
          onActiveStartDateChange={({activeStartDate}) => setActiveStartDate(activeStartDate)}
          locale="ko-KR"
        />
      </div>
      <ReactModal isOpen={showModal} ariaHideApp={false} style={modalStyle}>
        <div className="DurationModalContent">
          <div style={modalStyle.info}>{formatDate(selected)} ~</div>
          <h3 style={modalStyle.info}>이용할 기간을 선택해 주세요.</h3>
          <div style={modalStyle.durationOptions}>
            {[...Array(12)].map((_, i) => {
              const startDate = new Date(selected);
              const endDate = new Date(selected);
              endDate.setDate(startDate.getDate() + (i + 1) * 7 - 1);
              return (
                <button
                  key={i + 1}
                  onClick={() => handleDurationSelect(i + 1)}
                  style={{
                    ...modalStyle.durationButton,
                    ...(duration === (i + 1) * 7 ? modalStyle.selectedDurationButton : {}),
                  }}
                >
                  {i + 1}주
                  <span style={modalStyle.durationSub}>{formatDate(endDate)}</span>
                </button>
              );
            })}
          </div>
        </div>
        <button
          style={modalStyle.closeButton}
          onClick={() => {
            setSelected(null);
            setShowModal(false);
          }}
          aria-label="Close"
        >
          ×
        </button>
      </ReactModal>
    </div>
  );
};

export default WeekCalendar;

