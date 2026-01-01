import React from 'react';
import { MUKHO_PRICE } from '../../constants/price';
import WeeklyReservation from '../WeeklyReservation/WeeklyReservation';

const MukhoReservation = () => {
  return (
    <WeeklyReservation
      propertyType="mukho"
      priceConfig={MUKHO_PRICE}
      backPath="/mukho"
      calendarPath="/mukho/calendar"
      bankAccount="카카오 79420205681 남은비"
    />
  );
};

export default MukhoReservation;

