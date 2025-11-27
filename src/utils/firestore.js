import { collection, getDocs, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Firestore에서 숙소 예약 내역을 조회합니다.
 * @param {string} propertyType - 숙소 타입 ('forest', 'blon' 등)
 * @returns {Promise<Array>} 예약 내역 배열
 */
export const getReservations = async (propertyType) => {
  try {
    const collectionName = `${propertyType}_reservation`;
    const reservationsRef = collection(db, collectionName);
    
    // createdAt 필드가 있으면 정렬, 없으면 그냥 가져오기
    let querySnapshot;
    try {
      const q = query(reservationsRef, orderBy('createdAt', 'desc'));
      querySnapshot = await getDocs(q);
    } catch (orderError) {
      // createdAt 필드가 없거나 인덱스가 없는 경우 정렬 없이 가져오기
      console.warn('createdAt 필드로 정렬 실패, 정렬 없이 조회:', orderError);
      querySnapshot = await getDocs(reservationsRef);
    }
    
    const reservations = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      reservations.push({
        id: doc.id,
        ...data,
        // Firestore Timestamp를 문자열로 변환
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
        checkin_date: data.checkin_date || data.checkinDate,
        checkout_date: data.checkout_date || data.checkoutDate,
      });
    });
    
    return reservations;
  } catch (error) {
    console.error(`Firestore에서 ${propertyType} 예약 데이터 조회 실패:`, error);
    throw error;
  }
};

/**
 * 특정 날짜 범위의 예약 내역을 조회합니다.
 * @param {string} propertyType - 숙소 타입
 * @param {string} startDate - 시작 날짜 (YYYY-MM-DD)
 * @param {string} endDate - 종료 날짜 (YYYY-MM-DD)
 * @returns {Promise<Array>} 예약 내역 배열
 */
export const getReservationsByDateRange = async (propertyType, startDate, endDate) => {
  try {
    const allReservations = await getReservations(propertyType);
    
    // 날짜 범위에 해당하는 예약만 필터링
    return allReservations.filter(reservation => {
      const checkin = reservation.checkin_date || reservation.checkinDate;
      const checkout = reservation.checkout_date || reservation.checkoutDate;
      
      if (!checkin || !checkout) return false;
      
      // 체크인 날짜가 endDate 이전이고, 체크아웃 날짜가 startDate 이후인 예약
      return checkin <= endDate && checkout >= startDate;
    });
  } catch (error) {
    console.error(`날짜 범위별 ${propertyType} 예약 데이터 조회 실패:`, error);
    throw error;
  }
};

/**
 * Firestore에서 iCal 예약 내역을 조회합니다.
 * @param {string} propertyType - 숙소 타입 ('forest', 'blon' 등)
 * @returns {Promise<Array>} iCal 예약 내역 배열
 */
export const getIcalReservations = async (propertyType) => {
  try {
    const collectionName = `${propertyType}_ical`;
    const icalRef = collection(db, collectionName);
    
    // updated_at 기준으로 정렬 시도, 실패하면 정렬 없이 조회
    let querySnapshot;
    try {
      const q = query(icalRef, orderBy('updated_at', 'desc'));
      querySnapshot = await getDocs(q);
    } catch (orderError) {
      // updated_at 필드가 없거나 인덱스가 없는 경우 정렬 없이 가져오기
      console.warn('updated_at 필드로 정렬 실패, 정렬 없이 조회:', orderError);
      querySnapshot = await getDocs(icalRef);
    }
    
    const reservations = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      reservations.push({
        id: doc.id,
        ...data,
        // Firestore Timestamp를 문자열로 변환
        updated_at: data.updated_at?.toDate ? data.updated_at.toDate().toISOString() : data.updated_at,
        // start_dt, end_dt는 이미 YYYY-MM-DD 형식으로 저장되어 있음
        start_dt: data.start_dt,
        end_dt: data.end_dt,
      });
    });
    
    return reservations;
  } catch (error) {
    console.error(`Firestore에서 ${propertyType} iCal 데이터 조회 실패:`, error);
    throw error;
  }
};

/**
 * Firestore에 예약 내역을 저장합니다.
 * @param {string} propertyType - 숙소 타입 ('forest', 'blon' 등)
 * @param {Object} reservationData - 예약 데이터
 * @returns {Promise<string>} 저장된 문서 ID
 */
export const saveReservation = async (propertyType, reservationData) => {
  try {
    const collectionName = `${propertyType}_reservation`;
    const reservationsRef = collection(db, collectionName);
    
    // 날짜 형식 변환 (picked 배열에서 checkin_date, checkout_date 추출)
    const checkinDate = reservationData.picked && reservationData.picked.length > 0
      ? new Date(reservationData.picked[0]).toISOString().split('T')[0]
      : null;
    const checkoutDate = reservationData.picked && reservationData.picked.length > 1
      ? new Date(reservationData.picked[reservationData.picked.length - 1]).toISOString().split('T')[0]
      : null;
    
    // Firestore에 저장할 데이터 구성
    const dataToSave = {
      name: reservationData.name,
      phone: reservationData.phone,
      person: reservationData.person || 0,
      baby: reservationData.baby || 0,
      dog: reservationData.dog || 0,
      bedding: reservationData.bedding || 0,
      barbecue: reservationData.barbecue || 'N',
      price: reservationData.price || 0,
      price_option: reservationData.priceOption || 'refundable',
      checkin_date: checkinDate,
      checkout_date: checkoutDate,
      createdAt: serverTimestamp()
    };
    
    const docRef = await addDoc(reservationsRef, dataToSave);
    console.log(`${propertyType} 예약이 성공적으로 저장되었습니다. 문서 ID:`, docRef.id);
    
    return docRef.id;
  } catch (error) {
    console.error(`Firestore에 ${propertyType} 예약 저장 실패:`, error);
    throw error;
  }
};

/**
 * Space 예약 내역을 저장합니다 (시간 단위 예약).
 * @param {Object} reservationData - 예약 데이터
 * @returns {Promise<string>} 저장된 문서 ID
 */
export const saveSpaceReservation = async (reservationData) => {
  try {
    const collectionName = 'space_reservation';
    const reservationsRef = collection(db, collectionName);
    
    // Firestore에 저장할 데이터 구성
    const dataToSave = {
      name: reservationData.name,
      phone: reservationData.phone,
      person: reservationData.person || 0,
      purpose: reservationData.purpose || '',
      price: reservationData.price || 0,
      date: reservationData.date, // YYYY-MM-DD 형식
      time: reservationData.time, // 시간 배열 [9, 10, 11]
      checkin_time: reservationData.checkin_time, // 시작 시간 (숫자)
      checkout_time: reservationData.checkout_time, // 종료 시간 (숫자)
      createdAt: serverTimestamp()
    };
    
    const docRef = await addDoc(reservationsRef, dataToSave);
    console.log('Space 예약이 성공적으로 저장되었습니다. 문서 ID:', docRef.id);
    
    return docRef.id;
  } catch (error) {
    console.error('Firestore에 Space 예약 저장 실패:', error);
    throw error;
  }
};

