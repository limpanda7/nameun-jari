import ReactCalendar from "react-calendar";
import {useMemo, useState, useRef, useEffect} from "react";
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
      const checkinTimestamp = new Date(checkin_date).valueOf();
      const checkoutTimestamp = new Date(checkout_date).valueOf();

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
    let maxDate;

    if (selected) {
      reserved.forEach(({checkin_date, checkout_date}) => {
        const checkinTimestamp = new Date(checkin_date).valueOf();
        const checkoutTimestamp = new Date(checkout_date).valueOf();
        if (selected?.valueOf() < checkinTimestamp.valueOf()) {
          if (!maxDate || maxDate > checkinTimestamp.valueOf()) {
            maxDate = checkinTimestamp.valueOf();
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

      startDate.setDate(startDate.getDate() + 1);
      endDate.setDate(endDate.getDate() + 1);
      while (startDate <= endDate) {
        tempArr.push(startDate.toISOString().split("T")[0]);
        startDate.setDate(startDate.getDate() + 1);
      }

      // 마감된 날짜와 겹치는지 여부
      for (const element of tempArr) {
        if (reserved.includes(element)) {
          alert(
            "예약할 수 없는 날짜가 포함되어 있습니다. 날짜를 다시 선택해주세요."
          );
          setPicked([]);
          return false;
        }
      }

      setPicked(tempArr);
      setSelected(null);
    }
  };

  const tileDisabled = () => {
    if (isContinuous) {
      return ({date}) => {
        if (
          reserved.find(({checkin_date, checkout_date}) => {
            const checkinTimestamp = new Date(checkin_date).valueOf();
            const checkoutTimestamp = new Date(checkout_date).valueOf();
            return (
              (checkinTimestamp.valueOf() < date.valueOf() &&
                checkoutTimestamp.valueOf() > date.valueOf()) ||
              (checker[date.valueOf()]?.checkIn &&
                checker[date.valueOf()]?.checkOut)
            );
          })
        ) {
          return true;
        }
        if (
          selected &&
          ((selected < date.valueOf() &&
              checker[date.valueOf()]?.checkOut) ||
            (selected > date.valueOf() && checker[date.valueOf()]?.checkIn))
        ) {
          return true;
        } else if (!selected && checker[date.valueOf()]?.checkIn) {
          return true;
        }
      }
    } else {
      return ({date}) => {
        if (
          reserved.find(({checkin_date, checkout_date}) => {
            const checkinTimestamp = new Date(checkin_date).valueOf();
            const checkoutTimestamp = new Date(checkout_date).valueOf();
            return (
              checkinTimestamp <= date.valueOf() &&
              checkoutTimestamp >= date.valueOf()
            );
          })
        ) {
          return true;
        }
        if (
          selected &&
          checker[selected]?.checkIn &&
          date.valueOf() > selected
        ) {
          return true;
        } else if (selected && checker[selected]?.checkOut && date.valueOf() < selected) {
          return true;
        } else if (!selected && checker[date.valueOf()]?.checkIn) {
          return true;
        }
      }
    }
  }

  const tileClassname = () => {
    if (isContinuous) {
      return ({date}) => {
        let start = null;
        let end = null;
        if (picked.length) {
          start = new Date(new Date(picked[0])?.toISOString().slice(0, -1));
          end = new Date(
            new Date(picked[picked.length - 1])?.toISOString().slice(0, -1)
          );
        }

        if (
          start?.valueOf() === date.valueOf() ||
          end?.valueOf() === date.valueOf()
        ) {
          return "react-calendar__tile--select-date";
        }
        if (
          !selected &&
          !checker[date.valueOf()]?.checkOut &&
          checker[date.valueOf()]?.checkIn
        )
          return "react-calendar__tile--checkout-only";
      };
    } else {
      return ({date}) => {
        let start = null;
        let end = null;
        if (picked.length) {
          start = new Date(new Date(picked[0])?.toISOString().slice(0, -1));
          end = new Date(
            new Date(picked[picked.length - 1])?.toISOString().slice(0, -1)
          );
        }

        if (
          start?.valueOf() === date.valueOf() ||
          end?.valueOf() === date.valueOf()
        ) {
          return "react-calendar__tile--select-date";
        }
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
          prev2Label={null}
          next2Label={null}
          formatDay={(localeDay, date) => date.getDate()}
          minDate={selected ? new Date(selected) : (() => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            return tomorrow;
          })()}
          maxDate={maxDate}
          tileDisabled={tileDisabled()}
          tileClassName={tileClassname()}
          selectRange={!!selected || !!picked.length}
          onClickDay={(value) => {
            if (!checker[value.valueOf()]?.checkIn) {
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
