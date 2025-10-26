import { HOLIDAYS } from '../constants/price';

export const formatDate = (date) => {
  return date?.toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" });
}

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

