import React from 'react';
import { ON_OFF_PRICE } from '../../constants/price';
import WeeklyReservation from '../WeeklyReservation/WeeklyReservation';

const OnOffReservation = () => {
  return (
    <WeeklyReservation
      propertyType="on_off"
      priceConfig={ON_OFF_PRICE}
      backPath="/on-off"
      calendarPath="/on-off/calendar"
      bankAccount="카카오 3333053810252 채민기"
    />
  );
};

export default OnOffReservation;

