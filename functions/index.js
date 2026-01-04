const functions = require('firebase-functions');
const admin = require('firebase-admin');
const https = require('https');
const url = require('url');
const fetch = require('node-fetch');
const { updateIcal } = require('./updateIcal');
const { forestMMS, blonMMS, onOffMMS, mukhoMMS, spaceMMS } = require('./mms');

// Firebase Admin 초기화
if (!admin.apps.length) {
  admin.initializeApp();
}

// 환경변수 secrets 정의
const secrets = [
  'TELEGRAM_TOKEN',
  'TELEGRAM_CHAT_ID_APPLE',
  'TELEGRAM_CHAT_ID_SPACE',
  'TELEGRAM_CHAT_ID_FOREST',
  'TELEGRAM_CHAT_ID_BLON',
  'TELEGRAM_CHAT_ID_ON_OFF',
  'TELEGRAM_CHAT_ID_MUKHO',
  'MMS_APP_KEY',
  'MMS_SECRET_KEY',
  'MMS_SEND_NO',
  'KAKAOPAY_SECRET_KEY'
];

// 텔레그램 알림 함수
exports.telegramWebhook = functions.runWith({ secrets }).https.onRequest(async (req, res) => {
  console.log('=== telegramWebhook 함수 호출됨 ===');
  console.log('요청 메서드:', req.method);
  console.log('요청 URL:', req.url);

  // CORS 설정
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONS 요청 처리
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // POST 요청만 허용
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 디버깅: 요청 본문 로깅
    console.log('=== 요청 본문 확인 ===');
    console.log('요청 본문:', JSON.stringify({
      hasOrderData: !!req.body.orderData,
      hasSurveyData: !!req.body.surveyData,
      hasReservationData: !!req.body.reservationData,
      bodyKeys: Object.keys(req.body || {}),
      reservationDataKeys: req.body.reservationData ? Object.keys(req.body.reservationData) : null
    }));

    const { orderData, surveyData, reservationData } = req.body;

    // 텔레그램 봇 설정 (Firebase 환경변수 우선, 없으면 process.env fallback)
    // Firebase Secrets에서 가져온 값에 줄바꿈이 포함될 수 있으므로 trim() 처리
    const token = process.env.TELEGRAM_TOKEN?.trim();
    if (!token) {
      return res.status(500).json({ error: 'TELEGRAM_TOKEN이 설정되지 않았습니다.' });
    }
    const baseUrl = `https://api.telegram.org/bot${token}`;

    let message, chatId;

    if (orderData) {
      // 사과 주문 처리
      chatId = process.env.TELEGRAM_CHAT_ID_APPLE?.trim();
      if (!chatId) {
        return res.status(500).json({ error: 'TELEGRAM_CHAT_ID_APPLE이 설정되지 않았습니다.' });
      }
      message = createAppleOrderMessage(orderData);
    } else if (surveyData) {
      // 설문 데이터 처리
      chatId = process.env.TELEGRAM_CHAT_ID_SPACE?.trim();
      if (!chatId) {
        return res.status(500).json({ error: 'TELEGRAM_CHAT_ID_SPACE가 설정되지 않았습니다.' });
      }
      message = createSurveyMessage(surveyData);
    } else if (reservationData) {
      // 예약 데이터 처리
      const propertyType = reservationData.propertyType;
      if (propertyType === 'forest') {
        chatId = process.env.TELEGRAM_CHAT_ID_FOREST?.trim();
      } else if (propertyType === 'blon') {
        chatId = process.env.TELEGRAM_CHAT_ID_BLON?.trim();
      } else if (propertyType === 'on_off') {
        chatId = process.env.TELEGRAM_CHAT_ID_ON_OFF?.trim();
      } else if (propertyType === 'mukho') {
        chatId = process.env.TELEGRAM_CHAT_ID_MUKHO?.trim();
      } else if (propertyType === 'space') {
        chatId = process.env.TELEGRAM_CHAT_ID_SPACE?.trim();
      } else {
        return res.status(400).json({ error: '지원하지 않는 숙소 타입입니다.' });
      }

      if (!chatId) {
        return res.status(500).json({ error: `TELEGRAM_CHAT_ID_${propertyType.toUpperCase()}이 설정되지 않았습니다.` });
      }
      message = createReservationMessage(reservationData);
    } else {
      return res.status(400).json({ error: 'Order data, survey data, or reservation data is required' });
    }

    // 텔레그램 메시지 발송
    const telegramResponse = await fetch(`${baseUrl}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
      })
    });

    const telegramResult = await telegramResponse.json();

    // 예약 데이터인 경우 MMS 발송 (텔레그램 결과와 관계없이)
    if (reservationData) {
      try {
        console.log('MMS 발송 시작:', { propertyType: reservationData.propertyType, phone: reservationData.phone });
        await sendMMS(reservationData, chatId, token, baseUrl);
        console.log('MMS 발송 완료');
      } catch (mmsError) {
        console.error('MMS 발송 중 오류:', mmsError);
        console.error('MMS 발송 에러 상세:', {
          message: mmsError.message,
          stack: mmsError.stack,
          reservationData: {
            propertyType: reservationData?.propertyType,
            phone: reservationData?.phone
          }
        });
        // MMS 발송 실패는 전체 프로세스를 막지 않음
      }
    }

    if (telegramResult.ok) {
      console.log('텔레그램 알림 발송 성공:', telegramResult);
      res.status(200).json({
        success: true,
        message: '텔레그램 알림이 성공적으로 발송되었습니다.',
        telegramResult: telegramResult
      });
    } else {
      console.error('텔레그램 알림 발송 실패:', telegramResult);
      res.status(500).json({
        success: false,
        error: '텔레그램 알림 발송에 실패했습니다.',
        telegramError: telegramResult
      });
    }

  } catch (error) {
    console.error('API 처리 중 오류 발생:', error);
    res.status(500).json({
      success: false,
      error: '서버 오류가 발생했습니다.',
      details: error.message
    });
  }
});

// 사과 주문 알림 메시지 생성 함수
function createAppleOrderMessage(orderData) {
  const {
    recipientName,
    recipientPhone,
    recipientAddress,
    payerName,
    payerPhone,
    variety,
    quantity,
    message,
    totalPrice,
    orderDate
  } = orderData;

  let orderDateStr;
  if (orderDate) {
    try {
      if (typeof orderDate === 'string') {
        orderDateStr = new Date(orderDate).toLocaleString('ko-KR');
      } else if (orderDate.toDate) {
        orderDateStr = orderDate.toDate().toLocaleString('ko-KR');
      } else {
        orderDateStr = new Date(orderDate).toLocaleString('ko-KR');
      }
    } catch (error) {
      console.error('날짜 파싱 오류:', error);
      orderDateStr = new Date().toLocaleString('ko-KR');
    }
  } else {
    orderDateStr = new Date().toLocaleString('ko-KR');
  }

  return `🍎 <b>새로운 사과 주문이 들어왔습니다!</b> 🍎

📋 <b>주문 정보</b>
• 품종: ${variety}
• 수량: ${quantity}박스
• 총 금액: ${totalPrice.toLocaleString()}원
• 주문일시: ${orderDateStr}

👤 <b>받는 사람 정보</b>
• 이름: ${recipientName}
• 전화번호: ${recipientPhone}
• 주소: ${recipientAddress}

💳 <b>입금자 정보</b>
• 이름: ${payerName}
• 전화번호: ${payerPhone}

💬 <b>메시지</b>
${message || '메시지 없음'}

⏰ 주문 확인 후 처리해주세요!`;
}

// 설문 알림 메시지 생성 함수
function createSurveyMessage(surveyData) {
  const {
    recommendation,
    personalGrowth,
    eventParticipation,
    participantName,
    participantPhone,
    submittedAt
  } = surveyData;

  let submittedAtStr;
  if (submittedAt) {
    try {
      if (typeof submittedAt === 'string') {
        submittedAtStr = new Date(submittedAt).toLocaleString('ko-KR');
      } else if (submittedAt.toDate) {
        submittedAtStr = submittedAt.toDate().toLocaleString('ko-KR');
      } else {
        submittedAtStr = new Date(submittedAt).toLocaleString('ko-KR');
      }
    } catch (error) {
      console.error('날짜 파싱 오류:', error);
      submittedAtStr = new Date().toLocaleString('ko-KR');
    }
  } else {
    submittedAtStr = new Date().toLocaleString('ko-KR');
  }

  let message = `📋 <b>새로운 온오프 스페이스 설문이 제출되었습니다!</b> 📋

📊 <b>설문 정보</b>
• 추천 의향: ${recommendation}/7점
• 성장 기여도: ${personalGrowth}/7점`;

  if (eventParticipation && participantName && participantPhone) {
    message += `

🎁 <b>이벤트 참여자 정보</b>
• 이름: ${participantName}
• 전화번호: ${participantPhone}`;
  }

  message += `

⏰ 설문 확인 후 처리해주세요!`;

  return message;
}

// 예약 알림 메시지 생성 함수
function createReservationMessage(reservationData) {
  const {
    propertyType,
    name,
    phone,
    person,
    baby,
    dog,
    bedding,
    barbecue,
    price,
    priceOption,
    checkinDate,
    checkoutDate,
    paymentMethod
  } = reservationData;

  // 숙소 이름 매핑
  const propertyName = propertyType === 'forest' ? '백년한옥별채'
    : propertyType === 'blon' ? '블로뉴숲'
    : propertyType === 'on_off' ? '온오프스테이'
    : propertyType === 'mukho' ? '묵호쉴래'
    : propertyType === 'space' ? '온오프 스페이스'
    : propertyType;

  // 날짜 포맷팅 (YYYY-MM-DD 형식)
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      return dateStr;
    }
  };

  // 기간 포맷팅 (체크인, 체크아웃 또는 날짜/시간)
  let period;
  if (propertyType === 'space') {
    // Space는 날짜와 시간 배열 사용
    const date = reservationData.date;
    const time = reservationData.time;
    const checkinTime = reservationData.checkin_time;
    const checkoutTime = reservationData.checkout_time;
    if (date && checkinTime !== undefined && checkoutTime !== undefined) {
      period = `${formatDate(date)} ${checkinTime}:00 ~ ${checkoutTime}:00`;
    } else if (date && time && Array.isArray(time) && time.length > 0) {
      const startTime = Math.min(...time);
      const endTime = Math.max(...time) + 1;
      period = `${formatDate(date)} ${startTime}:00 ~ ${endTime}:00`;
    } else {
      period = date ? formatDate(date) : '날짜 없음';
    }
  } else {
    period = checkinDate && checkoutDate
      ? `${formatDate(checkinDate)},${formatDate(checkoutDate)}`
      : checkinDate
      ? formatDate(checkinDate)
      : '날짜 없음';
  }

  // 환불 옵션 텍스트
  const refundOption = priceOption === 'refundable' ? '환불가능' : '환불불가';

  // 결제수단 텍스트
  const paymentMethodText = paymentMethod === 'kakaopay' ? '카카오페이' : '계좌이체';

  // 금액 포맷팅 (천 단위 구분)
  const formattedPrice = price ? price.toLocaleString() : '0';

  let message = `${propertyName} 신규 예약이 들어왔습니다.

기간: ${period}

이름: ${name}

전화번호: ${phone}`;

  // on_off와 mukho는 person, dog만 표시
  if (propertyType === 'on_off' || propertyType === 'mukho') {
    message += `

인원수: ${person}명, 반려견 ${dog}마리

이용금액: ${formattedPrice}

결제수단: ${paymentMethodText}`;
  } else if (propertyType === 'space') {
    // Space는 person, purpose만 표시
    const purpose = reservationData.purpose || '미입력';
    message += `

인원수: ${person}명

사용목적: ${purpose}

이용금액: ${formattedPrice}

결제수단: ${paymentMethodText}`;
  } else {
    message += `

인원수: ${person}명, 영유아 ${baby}명, 반려견 ${dog}마리

추가침구: ${bedding}개

바베큐 이용여부: ${barbecue === 'Y' ? 'Y' : 'N'}

이용금액: ${formattedPrice}

환불옵션: ${refundOption}

결제수단: ${paymentMethodText}`;
  }

  return message;
}

// MMS 발송 함수
async function sendMMS(reservationData, chatId, token, baseUrl) {
  const {
    propertyType,
    name,
    phone,
    person,
    baby,
    dog,
    bedding,
    barbecue,
    price,
    checkinDate,
    checkoutDate,
    reservationNumber,
    paymentMethod
  } = reservationData;

  // 전화번호 정규화 (하이픈 제거)
  const normalizedPhone = phone.replace(/[^0-9]/g, '');
  console.log('전화번호 정규화:', { original: phone, normalized: normalizedPhone });

  // MMS 메시지 생성
  let mmsBody;
  const picked = [checkinDate, checkoutDate]; // 날짜 배열 형식으로 변환

  if (propertyType === 'forest') {
    mmsBody = forestMMS(picked, person, baby || 0, dog || 0, barbecue || 'N', price, reservationNumber, paymentMethod);
  } else if (propertyType === 'blon') {
    mmsBody = blonMMS(picked, person, baby || 0, dog || 0, barbecue || 'N', price, reservationNumber, paymentMethod);
  } else if (propertyType === 'on_off') {
    mmsBody = onOffMMS(picked, person, dog || 0, price, reservationNumber, paymentMethod);
  } else if (propertyType === 'mukho') {
    mmsBody = mukhoMMS(picked, person, dog || 0, price, reservationNumber, paymentMethod);
  } else if (propertyType === 'space') {
    // Space는 날짜와 시간 배열 사용
    const date = reservationData.date;
    const time = reservationData.time || [];
    const purpose = reservationData.purpose || '미입력';
    mmsBody = spaceMMS(date, time, person, purpose, price, reservationNumber, paymentMethod);
  } else {
    console.warn(`지원하지 않는 숙소 타입: ${propertyType}`);
    return;
  }

  // MMS 제목 설정
  const mmsTitle = propertyType === 'forest' ? '백년한옥별채 안내문자'
    : propertyType === 'blon' ? '블로뉴숲 안내문자'
    : propertyType === 'on_off' ? '온오프스테이 안내문자'
    : propertyType === 'mukho' ? '묵호쉴래 안내문자'
    : propertyType === 'space' ? '온오프 스페이스 안내문자'
    : '안내문자';

  try {
    // Toast Cloud SMS API로 MMS 발송
    // Firebase Secrets에서 가져온 값에 줄바꿈이 포함될 수 있으므로 trim() 처리
    const mmsAppKey = process.env.MMS_APP_KEY?.trim();
    const mmsSecretKey = process.env.MMS_SECRET_KEY?.trim();
    const mmsSendNo = process.env.MMS_SEND_NO?.trim();

    console.log('MMS 환경변수 확인:', {
      hasAppKey: !!mmsAppKey,
      hasSecretKey: !!mmsSecretKey,
      hasSendNo: !!mmsSendNo,
      appKeyLength: mmsAppKey?.length || 0,
      secretKeyLength: mmsSecretKey?.length || 0
    });

    if (!mmsAppKey || !mmsSecretKey || !mmsSendNo) {
      const missingVars = [];
      if (!mmsAppKey) missingVars.push('MMS_APP_KEY');
      if (!mmsSecretKey) missingVars.push('MMS_SECRET_KEY');
      if (!mmsSendNo) missingVars.push('MMS_SEND_NO');
      throw new Error(`MMS 환경변수가 설정되지 않았습니다: ${missingVars.join(', ')}`);
    }

    const mmsResponse = await fetch(
      `https://api-sms.cloud.toast.com/sms/v3.0/appKeys/${mmsAppKey}/sender/mms`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          'X-Secret-Key': mmsSecretKey,
        },
        body: JSON.stringify({
          title: mmsTitle,
          body: mmsBody,
          sendNo: mmsSendNo,
          recipientList: [{ recipientNo: normalizedPhone }],
        }),
      }
    );

    const mmsResult = await mmsResponse.json();
    console.log('MMS API 응답:', JSON.stringify(mmsResult, null, 2));

    if (mmsResult.header && mmsResult.header.resultMessage === 'SUCCESS') {
      console.log('MMS 발송 성공:', mmsResult);
      // 텔레그램으로 MMS 발송 성공 알림
      try {
        await fetch(`${baseUrl}/sendMessage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: '문자 발송에 성공하였습니다.'
          })
        });
      } catch (telegramError) {
        console.warn('MMS 성공 알림 텔레그램 전송 실패:', telegramError);
      }
    } else {
      console.error('MMS 발송 실패:', mmsResult);
      const errorMessage = mmsResult.header?.resultMessage || mmsResult.header?.resultCode || 'Unknown error';
      // 텔레그램으로 MMS 발송 실패 알림
      try {
        await fetch(`${baseUrl}/sendMessage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: `문자 발송에 실패하였습니다. (${errorMessage})`
          })
        });
      } catch (telegramError) {
        console.warn('MMS 실패 알림 텔레그램 전송 실패:', telegramError);
      }
      throw new Error(`MMS 발송 실패: ${errorMessage}`);
    }
  } catch (error) {
    console.error('MMS 발송 중 오류:', error);
    throw error;
  }
}

// Forest API 프록시 함수
exports.forestApi = functions.https.onRequest((req, res) => {
  // CORS 설정
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // OPTIONS 요청 처리 (CORS preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 경로 추출: /forest-api/reservation/forest -> /api/reservation/forest
  const path = req.url.replace('/forest-api', '/api');
  const targetUrl = `https://forest100.herokuapp.com${path}`;

  console.log(`프록시 요청: ${req.method} ${path}`);

  // POST 요청 처리
  if (req.method === 'POST' || req.method === 'PUT') {
    const targetUrlObj = new URL(targetUrl);
    const postData = JSON.stringify(req.body);

    const options = {
      hostname: targetUrlObj.hostname,
      port: 443,
      path: targetUrlObj.pathname + targetUrlObj.search,
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const proxyReq = https.request(options, (response) => {
      let data = '';

      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        res.status(response.statusCode).send(data);
      });
    });

    proxyReq.on('error', (error) => {
      console.error('프록시 에러:', error);
      res.status(500).json({ error: '프록시 서버 오류', details: error.message });
    });

    proxyReq.write(postData);
    proxyReq.end();
  } else {
    // GET 요청 처리
    https.get(targetUrl, (response) => {
      let data = '';

      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        res.status(response.statusCode).send(data);
      });
    }).on('error', (error) => {
      console.error('프록시 에러:', error);
      res.status(500).json({ error: '프록시 서버 오류', details: error.message });
    });
  }
});

// 온오프스테이 예약 API (Firestore 사용)
const db = admin.firestore();
const onOffSecrets = [
  'TELEGRAM_TOKEN',
  'TELEGRAM_CHAT_ID_ON_OFF',
  'MMS_APP_KEY',
  'MMS_SECRET_KEY',
  'MMS_SEND_NO'
];

exports.onOffReservation = functions.runWith({ secrets: onOffSecrets }).https.onRequest(async (req, res) => {
  // CORS 설정
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONS 요청 처리
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      // GET: 예약 데이터 조회
      const reservationsRef = db.collection('on_off_reservation');
      const snapshot = await reservationsRef.orderBy('createdAt', 'desc').get();

      const reservations = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        reservations.push({
          id: doc.id,
          checkin_date: data.checkin_date,
          checkout_date: data.checkout_date,
          name: data.name,
          phone: data.phone,
          person: data.person,
          dog: data.dog,
          price: data.price,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt
        });
      });

      res.status(200).json(reservations);
    } else if (req.method === 'POST') {
      // POST: 예약 저장 및 알림 발송
      const { picked, name, phone, person, dog, price, paymentMethod = 'bank' } = req.body;

      if (!picked || !Array.isArray(picked) || picked.length === 0) {
        return res.status(400).json({ error: '날짜를 선택해주세요.' });
      }
      if (!name || !phone) {
        return res.status(400).json({ error: '이름과 전화번호를 입력해주세요.' });
      }

      // 날짜 형식 변환
      const checkinDate = new Date(picked[0]).toISOString().split('T')[0];
      const checkoutDate = new Date(picked[picked.length - 1]).toISOString().split('T')[0];

      // Firestore에 예약 저장
      const reservationData = {
        checkin_date: checkinDate,
        checkout_date: checkoutDate,
        name,
        phone,
        person: person || 2,
        dog: dog || 0,
        price: price || 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      };

      const docRef = await db.collection('on_off_reservation').add(reservationData);
      console.log('온오프스테이 예약 저장 완료:', docRef.id);

      // 텔레그램 알림 발송
      const token = process.env.TELEGRAM_TOKEN?.trim();
      const chatId = process.env.TELEGRAM_CHAT_ID_ON_OFF?.trim();
      const baseUrl = `https://api.telegram.org/bot${token}`;

      if (token && chatId) {
        const paymentMethodText = paymentMethod === 'kakaopay' ? '카카오페이' : '계좌이체';
        const telegramMessage = `온오프스테이 신규 계약이 들어왔습니다.\n` +
          `\n` +
          `기간: ${checkinDate} ~ ${checkoutDate}\n` +
          `\n` +
          `이름: ${name}\n` +
          `\n` +
          `전화번호: ${phone}\n` +
          `\n` +
          `인원수: ${person || 2}명, 반려견 ${dog || 0}마리\n` +
          `\n` +
          `이용금액: ${(price || 0).toLocaleString()}\n` +
          `\n` +
          `결제수단: ${paymentMethodText}\n`;

        try {
          await fetch(`${baseUrl}/sendMessage`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              chat_id: chatId,
              text: telegramMessage
            })
          });
        } catch (telegramError) {
          console.error('텔레그램 알림 발송 실패:', telegramError);
        }
      }

      // MMS 발송
      try {
        const mmsAppKey = process.env.MMS_APP_KEY?.trim();
        const mmsSecretKey = process.env.MMS_SECRET_KEY?.trim();
        const mmsSendNo = process.env.MMS_SEND_NO?.trim();

        if (mmsAppKey && mmsSecretKey && mmsSendNo) {
          const normalizedPhone = phone.replace(/[^0-9]/g, '');
          // picked 배열을 날짜 문자열 배열로 변환
          const pickedDates = picked.map(date => {
            if (date instanceof Date) {
              return date.toISOString().split('T')[0];
            } else if (typeof date === 'string') {
              return date.split('T')[0];
            }
            return date;
          });
          const mmsBody = onOffMMS(pickedDates, person || 2, dog || 0, price || 0);

          const mmsResponse = await fetch(
            `https://api-sms.cloud.toast.com/sms/v3.0/appKeys/${mmsAppKey}/sender/mms`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                'X-Secret-Key': mmsSecretKey,
              },
              body: JSON.stringify({
                title: '온오프스테이 안내문자',
                body: mmsBody,
                sendNo: mmsSendNo,
                recipientList: [{ recipientNo: normalizedPhone }],
              }),
            }
          );

          const mmsResult = await mmsResponse.json();
          console.log('MMS API 응답:', JSON.stringify(mmsResult, null, 2));

          if (mmsResult.header && mmsResult.header.resultMessage === 'SUCCESS') {
            console.log('MMS 발송 성공');
            // 텔레그램으로 MMS 발송 성공 알림
            if (token && chatId) {
              try {
                await fetch(`${baseUrl}/sendMessage`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    chat_id: chatId,
                    text: '문자 발송에 성공하였습니다.'
                  })
                });
              } catch (telegramError) {
                console.warn('MMS 성공 알림 텔레그램 전송 실패:', telegramError);
              }
            }
          } else {
            console.error('MMS 발송 실패:', mmsResult);
            const errorMessage = mmsResult.header?.resultMessage || mmsResult.header?.resultCode || 'Unknown error';
            // 텔레그램으로 MMS 발송 실패 알림
            if (token && chatId) {
              try {
                await fetch(`${baseUrl}/sendMessage`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    chat_id: chatId,
                    text: `문자 발송에 실패하였습니다. (${errorMessage})`
                  })
                });
              } catch (telegramError) {
                console.warn('MMS 실패 알림 텔레그램 전송 실패:', telegramError);
              }
            }
          }
        }
      } catch (mmsError) {
        console.error('MMS 발송 중 오류:', mmsError);
        // MMS 발송 실패는 예약 저장을 막지 않음
      }

      res.status(200).json({
        id: docRef.id,
        ...reservationData
      });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('온오프스테이 예약 처리 중 오류:', error);
    res.status(500).json({ error: '예약 처리 중 오류가 발생했습니다.', details: error.message });
  }
});

// 예약 확정 문자 전송 API
exports.confirmReservation = functions.runWith({ secrets }).https.onRequest(async (req, res) => {
  // CORS 설정
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { phone, propertyType, reservationId } = req.body;

    if (!phone || !propertyType || !reservationId) {
      res.status(400).json({ error: '전화번호, 숙소 타입, 예약 ID가 필요합니다.' });
      return;
    }

    // Firestore에서 예약 정보 조회
    const db = admin.firestore();
    const collectionName = `${propertyType}_reservation`;
    const reservationDoc = await db.collection(collectionName).doc(reservationId).get();

    if (!reservationDoc.exists) {
      res.status(404).json({ error: '예약 정보를 찾을 수 없습니다.' });
      return;
    }

    const reservationData = reservationDoc.data();

    // 날짜 포맷팅 함수
    const formatDate = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    // 예약 정보 포맷팅
    const checkinDate = formatDate(reservationData.checkin_date || reservationData.checkinDate);
    const checkoutDate = formatDate(reservationData.checkout_date || reservationData.checkoutDate);
    const person = reservationData.person || 0;
    const baby = reservationData.baby || 0;
    const dog = reservationData.dog || 0;
    const barbecue = reservationData.barbecue || 'N';

    // 확정 메시지 생성
    const confirmMessage = '입금 확인되어 예약이 확정되었습니다.\n\n' +
      '[예약정보]\n' +
      `체크인: ${checkinDate}\n` +
      `체크아웃: ${checkoutDate}\n` +
      `인원: ${person}명, 영유아 ${baby}명, 반려견 ${dog}마리\n` +
      `바베큐 이용여부: ${barbecue}`;

    // 전화번호 정규화 (하이픈 제거)
    const normalizedPhone = phone.replace(/[^0-9]/g, '');

    // MMS 환경변수 확인
    const mmsAppKey = process.env.MMS_APP_KEY?.trim();
    const mmsSecretKey = process.env.MMS_SECRET_KEY?.trim();
    const mmsSendNo = process.env.MMS_SEND_NO?.trim();

    if (!mmsAppKey || !mmsSecretKey || !mmsSendNo) {
      throw new Error('MMS 환경변수가 설정되지 않았습니다.');
    }

    // MMS 제목 설정
    const mmsTitle = propertyType === 'forest' ? '백년한옥별채 확정안내'
      : propertyType === 'blon' ? '블로뉴숲 확정안내'
      : '예약 확정안내';

    // Toast Cloud SMS API로 MMS 발송
    const mmsResponse = await fetch(
      `https://api-sms.cloud.toast.com/sms/v3.0/appKeys/${mmsAppKey}/sender/mms`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          'X-Secret-Key': mmsSecretKey,
        },
        body: JSON.stringify({
          title: mmsTitle,
          body: confirmMessage,
          sendNo: mmsSendNo,
          recipientList: [{ recipientNo: normalizedPhone }],
        }),
      }
    );

    const mmsResult = await mmsResponse.json();
    console.log('확정 문자 API 응답:', JSON.stringify(mmsResult, null, 2));

    if (mmsResult.header && mmsResult.header.resultMessage === 'SUCCESS') {
      // 문자 발송 성공 후 Firestore에 확정 상태 업데이트
      try {
        await db.collection(collectionName).doc(reservationId).update({
          confirmed: 'Y'
        });
        console.log('예약 확정 상태 업데이트 완료:', reservationId);
      } catch (updateError) {
        console.error('Firestore 확정 상태 업데이트 실패:', updateError);
        // Firestore 업데이트 실패는 이미 문자를 보냈으므로 경고만 하고 계속 진행
      }

      // 텔레그램 알림 전송
      try {
        const token = process.env.TELEGRAM_TOKEN?.trim();
        let chatId = null;

        // propertyType에 따라 적절한 chatId 선택
        if (propertyType === 'forest') {
          chatId = process.env.TELEGRAM_CHAT_ID_FOREST?.trim();
        } else if (propertyType === 'blon') {
          chatId = process.env.TELEGRAM_CHAT_ID_BLON?.trim();
        }

        if (token && chatId) {
          const baseUrl = `https://api.telegram.org/bot${token}`;
          const periodText = `${checkinDate},${checkoutDate}`;

          await fetch(`${baseUrl}/sendMessage`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              chat_id: chatId,
              text: `예약이 확정되었습니다.\n\n기간: ${periodText}`
            })
          });
        }
      } catch (telegramError) {
        console.warn('확정 알림 텔레그램 전송 실패:', telegramError);
        // 텔레그램 알림 실패는 전체 프로세스를 막지 않음
      }

      res.status(200).json({
        success: true,
        message: '확정 문자가 성공적으로 발송되었습니다.',
      });
    } else {
      const errorMessage = mmsResult.header?.resultMessage || mmsResult.header?.resultCode || 'Unknown error';
      throw new Error(`확정 문자 발송 실패: ${errorMessage}`);
    }
  } catch (error) {
    console.error('확정 문자 발송 중 오류:', error);
    res.status(500).json({
      success: false,
      error: '확정 문자 발송 중 오류가 발생했습니다.',
      details: error.message
    });
  }
});

// iCal 동기화 Scheduled Function (5분마다 실행)
// syncIcal은 updateIcal에서 사용하는 secrets만 필요함
const syncIcalSecrets = [
  'TELEGRAM_TOKEN',
  'TELEGRAM_CHAT_ID_FOREST',
  'TELEGRAM_CHAT_ID_BLON'
];
exports.syncIcal = functions.runWith({ secrets: syncIcalSecrets }).pubsub
  .schedule('*/5 * * * *') // 5분마다 실행
  .timeZone('Asia/Seoul')
  .onRun(async (context) => {
    console.log('iCal 동기화 시작');

    try {
      // Forest iCal 동기화
      await updateIcal(
        'https://www.airbnb.co.kr/calendar/ical/45390781.ics?s=0445b573c993602570eb6ba077995e5c',
        'forest'
      );
      console.log('Forest iCal 동기화 완료');

      // Blon iCal 동기화
      await updateIcal(
        'https://www.airbnb.co.kr/calendar/ical/43357745.ics?s=b2f3b0a34285a4574daf03fe3429f505',
        'blon'
      );
      console.log('Blon iCal 동기화 완료');

      return null;
    } catch (error) {
      console.error('iCal 동기화 중 오류 발생:', error);
      throw error;
    }
  });

// 카카오페이 결제 준비 API 프록시
exports.kakaoPayReady = functions.runWith({ secrets }).https.onRequest(async (req, res) => {
  // CORS 설정
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const kakaoPaySecretKey = process.env.KAKAOPAY_SECRET_KEY || 'PRDF361A5294D837F7A68A43F96ED978333B725C';

    const response = await fetch('https://open-api.kakaopay.com/online/v1/payment/ready', {
      method: 'POST',
      headers: {
        'Authorization': `SECRET_KEY ${kakaoPaySecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body)
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('카카오페이 API 에러:', result);
      return res.status(response.status).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('카카오페이 결제 준비 중 오류:', error);
    res.status(500).json({ error: '카카오페이 결제 준비 중 오류가 발생했습니다.', details: error.message });
    }
  });

// 카카오페이 결제 승인 API 프록시
exports.kakaoPayApprove = functions.runWith({ secrets }).https.onRequest(async (req, res) => {
  // CORS 설정
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const kakaoPaySecretKey = process.env.KAKAOPAY_SECRET_KEY || 'PRDF361A5294D837F7A68A43F96ED978333B725C';

    const response = await fetch('https://open-api.kakaopay.com/online/v1/payment/approve', {
      method: 'POST',
      headers: {
        'Authorization': `SECRET_KEY ${kakaoPaySecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body)
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('카카오페이 승인 API 에러:', result);
      return res.status(response.status).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('카카오페이 결제 승인 중 오류:', error);
    res.status(500).json({ error: '카카오페이 결제 승인 중 오류가 발생했습니다.', details: error.message });
  }
});
