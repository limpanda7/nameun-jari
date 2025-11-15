const functions = require('firebase-functions');
const admin = require('firebase-admin');
const https = require('https');
const url = require('url');
const fetch = require('node-fetch');
const { updateIcal } = require('./updateIcal');

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
  'MMS_APP_KEY',
  'MMS_SECRET_KEY',
  'MMS_SEND_NO'
];

// 텔레그램 알림 함수
exports.telegramWebhook = functions.runWith({ secrets }).https.onRequest(async (req, res) => {
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
    const { orderData, surveyData, reservationData } = req.body;

    // 텔레그램 봇 설정 (Firebase 환경변수 우선, 없으면 process.env fallback)
    const token = process.env.TELEGRAM_TOKEN;
    if (!token) {
      return res.status(500).json({ error: 'TELEGRAM_TOKEN이 설정되지 않았습니다.' });
    }
    const baseUrl = `https://api.telegram.org/bot${token}`;

    let message, chatId;

    if (orderData) {
      // 사과 주문 처리
      chatId = process.env.TELEGRAM_CHAT_ID_APPLE;
      if (!chatId) {
        return res.status(500).json({ error: 'TELEGRAM_CHAT_ID_APPLE이 설정되지 않았습니다.' });
      }
      message = createAppleOrderMessage(orderData);
    } else if (surveyData) {
      // 설문 데이터 처리
      chatId = process.env.TELEGRAM_CHAT_ID_SPACE;
      if (!chatId) {
        return res.status(500).json({ error: 'TELEGRAM_CHAT_ID_SPACE가 설정되지 않았습니다.' });
      }
      message = createSurveyMessage(surveyData);
    } else if (reservationData) {
      // 예약 데이터 처리
      const propertyType = reservationData.propertyType;
      if (propertyType === 'forest') {
        chatId = process.env.TELEGRAM_CHAT_ID_FOREST;
      } else if (propertyType === 'blon') {
        chatId = process.env.TELEGRAM_CHAT_ID_BLON;
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
    checkoutDate
  } = reservationData;

  // 숙소 이름 매핑
  const propertyName = propertyType === 'forest' ? '백년한옥별채' : propertyType === 'blon' ? '블로뉴숲' : propertyType;

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

  // 기간 포맷팅 (체크인, 체크아웃)
  const period = checkinDate && checkoutDate
    ? `${formatDate(checkinDate)},${formatDate(checkoutDate)}`
    : checkinDate
    ? formatDate(checkinDate)
    : '날짜 없음';

  // 환불 옵션 텍스트
  const refundOption = priceOption === 'refundable' ? '환불가능' : '환불불가';

  // 금액 포맷팅 (천 단위 구분)
  const formattedPrice = price ? price.toLocaleString() : '0';

  let message = `${propertyName} 신규 예약이 들어왔습니다.

기간: ${period}

이름: ${name}

전화번호: ${phone}

인원수: ${person}명, 영유아 ${baby}명, 반려견 ${dog}마리

추가침구: ${bedding}개

바베큐 이용여부: ${barbecue === 'Y' ? 'Y' : 'N'}

이용금액: ${formattedPrice}

환불옵션: ${refundOption}`;

  return message;
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

// iCal 동기화 Scheduled Function (5분마다 실행)
exports.syncIcal = functions.runWith({ secrets }).pubsub
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
