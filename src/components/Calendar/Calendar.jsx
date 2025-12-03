import ReactCalendar from "react-calendar";
import {useMemo, useState, useRef, useEffect} from "react";
import {formatDate} from "../../utils/date";
import "./Calendar.css";

const SWIPE_THRESHOLD = 50; // px

const Calendar = ({isContinuous, picked, setPicked, reserved}) => {
  const [selected, setSelected] = useState(null);
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

  const maxDate = useMemo(() => {
    // 오늘로부터 12개월 후 날짜 계산 (오늘 날짜에서 1년 후 같은 날짜의 전날까지)
    const twelveMonthsLater = new Date();
    twelveMonthsLater.setMonth(twelveMonthsLater.getMonth() + 12);
    twelveMonthsLater.setDate(twelveMonthsLater.getDate() - 1); // 하루 전날까지
    twelveMonthsLater.setHours(23, 59, 59, 999); // 하루 종료 시각으로 설정

    let maxDate = twelveMonthsLater.valueOf();

    if (selected) {
      reserved.forEach(({checkin_date, checkout_date}) => {
        const checkinTimestamp = new Date(checkin_date).valueOf();
        const checkoutTimestamp = new Date(checkout_date).valueOf();
        if (selected?.valueOf() < checkinTimestamp.valueOf()) {
          const reservedMaxDate = Math.min(checkinTimestamp.valueOf(), twelveMonthsLater.valueOf());
          if (!maxDate || maxDate > reservedMaxDate) {
            maxDate = reservedMaxDate;
          }
        }
      });
    }

    return new Date(maxDate);
  }, [reserved, selected]);

  const calcRange = (value) => {
    if (selected) {
      let tempArr = [];

      // 모든 날짜 계산
      let startDate = new Date(value[0]);
      let endDate = new Date(value[1]);

      // 같은 날짜 선택 시 alert
      if (startDate.getDate() === endDate.getDate()) {
        alert("체크인과 체크아웃 날짜는 같을 수 없습니다. 다시 선택해주세요.");
        setPicked([]);
        setSelected(null);
        return false;
      }

      // 날짜를 정규화하여 비교
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);

      // 체크인 날짜와 체크아웃 날짜만 포함 (로컬 시간대 기준)
      tempArr.push(formatDate(startDate));
      tempArr.push(formatDate(endDate));

      // 체크인 날짜부터 체크아웃 날짜 전날까지의 날짜가 마감되었는지 확인
      let checkDate = new Date(startDate);
      checkDate.setDate(checkDate.getDate() + 1);
      while (checkDate < endDate) {
        const dateStr = formatDate(checkDate);
        if (reserved.includes(dateStr)) {
          alert(
            "예약할 수 없는 날짜가 포함되어 있습니다. 날짜를 다시 선택해주세요."
          );
          setPicked([]);
          setSelected(null);
          return false;
        }
        checkDate.setDate(checkDate.getDate() + 1);
      }

      // 체크인과 체크아웃 날짜가 마감되었는지 확인
      const startDateStr = formatDate(startDate);
      const endDateStr = formatDate(endDate);
      if (reserved.includes(startDateStr) || reserved.includes(endDateStr)) {
        alert(
          "예약할 수 없는 날짜가 포함되어 있습니다. 날짜를 다시 선택해주세요."
        );
        setPicked([]);
        setSelected(null);
        return false;
      }

      setPicked(tempArr);
      setSelected(null);
    }
  };

  const tileDisabled = () => {
    // 오늘로부터 12개월 후 날짜 계산 (오늘 날짜에서 1년 후 같은 날짜의 전날까지)
    const twelveMonthsLater = new Date();
    twelveMonthsLater.setMonth(twelveMonthsLater.getMonth() + 12);
    twelveMonthsLater.setDate(twelveMonthsLater.getDate() - 1); // 하루 전날까지
    twelveMonthsLater.setHours(23, 59, 59, 999);
    const twelveMonthsLaterTimestamp = twelveMonthsLater.valueOf();

    if (isContinuous) {
      return ({date}) => {
        // 날짜를 정규화하여 비교
        const normalizedDate = new Date(date);
        normalizedDate.setHours(0, 0, 0, 0);
        const dateTimestamp = normalizedDate.valueOf();
        
        // 12개월 제한 확인
        if (dateTimestamp > twelveMonthsLaterTimestamp) {
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
          reserved.find(({checkin_date, checkout_date}) => {
            const checkinDate = new Date(checkin_date);
            checkinDate.setHours(0, 0, 0, 0);
            const checkinTimestamp = checkinDate.valueOf();
            
            const checkoutDate = new Date(checkout_date);
            checkoutDate.setHours(0, 0, 0, 0);
            const checkoutTimestamp = checkoutDate.valueOf();
            
            return (
              (checkinTimestamp < dateTimestamp &&
                checkoutTimestamp > dateTimestamp) ||
              (checker[dateTimestamp]?.checkIn &&
                checker[dateTimestamp]?.checkOut)
            );
          })
        ) {
          return true;
        }
        if (
          selected &&
          ((selected < dateTimestamp &&
              checker[dateTimestamp]?.checkOut) ||
            (selected > dateTimestamp && checker[dateTimestamp]?.checkIn))
        ) {
          return true;
        } else if (!selected && checker[dateTimestamp]?.checkIn && !checker[dateTimestamp]?.checkOut) {
          // 체크인 날짜이지만 체크아웃 날짜가 아닌 경우만 비활성화 (체크아웃만 가능한 날짜)
          return true;
        }
      }
    } else {
      return ({date}) => {
        // 날짜를 정규화하여 비교
        const normalizedDate = new Date(date);
        normalizedDate.setHours(0, 0, 0, 0);
        const dateTimestamp = normalizedDate.valueOf();
        
        // 12개월 제한 확인
        if (dateTimestamp > twelveMonthsLaterTimestamp) {
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
          reserved.find(({checkin_date, checkout_date}) => {
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
      }
    }
  }

  const tileClassname = () => {
    if (isContinuous) {
      return ({date}) => {
        // 날짜를 정규화하여 비교
        const normalizedDate = new Date(date);
        normalizedDate.setHours(0, 0, 0, 0);
        const dateTimestamp = normalizedDate.valueOf();
        
        // 선택된 날짜 범위 확인
        if (picked.length > 0) {
          const dateStr = formatDate(date);
          const isPicked = picked.includes(dateStr);
          
          // 선택된 날짜 범위 내의 날짜인 경우 브라운 색으로 표시 (체크아웃 날짜 포함)
          if (isPicked) {
            return "react-calendar__tile--select-date";
          }
        }
        
        // 체크아웃만 가능한 날짜 표시 (선택되지 않은 경우에만)
        if (
          !selected &&
          !checker[dateTimestamp]?.checkOut &&
          checker[dateTimestamp]?.checkIn
        )
          return "react-calendar__tile--checkout-only";
      };
    } else {
      return ({date}) => {
        // 날짜를 정규화하여 비교
        const normalizedDate = new Date(date);
        normalizedDate.setHours(0, 0, 0, 0);
        const dateTimestamp = normalizedDate.valueOf();
        
        // 선택된 날짜 범위 확인
        if (picked.length > 0) {
          const dateStr = formatDate(date);
          const isPicked = picked.includes(dateStr);
          
          // 선택된 날짜 범위 내의 날짜인 경우 브라운 색으로 표시 (체크아웃 날짜 포함)
          if (isPicked) {
            return "react-calendar__tile--select-date";
          }
        }
        
        // 체크아웃만 가능한 날짜 표시 (선택되지 않은 경우에만)
        if (
          !selected &&
          !checker[dateTimestamp]?.checkOut &&
          checker[dateTimestamp]?.checkIn
        )
          return "react-calendar__tile--checkout-only";
      };
    }
  }

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
          onClick={() => {
            setPicked([]);
            setSelected(null);
          }}
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
          maxDate={maxDate && maxDate.valueOf() ? maxDate : (() => {
            const twelveMonthsLater = new Date();
            twelveMonthsLater.setMonth(twelveMonthsLater.getMonth() + 12);
            twelveMonthsLater.setDate(twelveMonthsLater.getDate() - 1); // 하루 전날까지
            return twelveMonthsLater;
          })()}
          tileDisabled={tileDisabled()}
          tileClassName={tileClassname()}
          selectRange={!!selected || !!picked.length}
          onClickDay={(value) => {
            // 날짜를 정규화하여 비교
            const normalizedDate = new Date(value);
            normalizedDate.setHours(0, 0, 0, 0);
            const dateTimestamp = normalizedDate.valueOf();
            
            if (!checker[dateTimestamp]?.checkIn) {
              setSelected(new Date(value));
            }
            if (picked.length) {
              setPicked([]);
            }
          }}
          onChange={(value) => {
            calcRange(value);
          }}
          value={
            picked.length
              ? [new Date(picked[0]), new Date(picked[picked.length - 1])]
              : null
          }
          activeStartDate={activeStartDate}
          onActiveStartDateChange={({activeStartDate}) => setActiveStartDate(activeStartDate)}
          locale="ko-KR"
        />
      </div>
    </div>
  );
}

export default Calendar;
