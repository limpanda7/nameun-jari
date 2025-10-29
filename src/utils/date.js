import { HOLIDAYS } from '../constants/price';

export const formatDateWithDay = (date) => {
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const dayIdx = new Date(date).getDay();
  const month = date.slice(5, 7);
  const day = date.slice(8, 10);
  return `${month}/${day}(${dayNames[dayIdx]})`;
};

export const isSummer = (date) => {
  return date.slice(5, 7) === '07' || date.slice(5, 7) === '08'
}

export const isWeekday = (date) => {
  const dayIdx = new Date(date).getDay();
  return dayIdx !== 5 && dayIdx !== 6;
}

export const isFriday = (date) => {
  const dayIdx = new Date(date).getDay();
  return dayIdx === 5;
}

export const isSaturday = (date) => {
  const dayIdx = new Date(date).getDay();
  return dayIdx === 6;
}

export const isHoliday = (date) => {
  return HOLIDAYS.includes(date);
}

