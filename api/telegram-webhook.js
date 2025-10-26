// Vercel Functions를 사용한 텔레그램 알림 API
export default async function handler(req, res) {
  // CORS 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONS 요청 처리 (CORS preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // POST 요청만 허용
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { orderData, surveyData } = req.body;

    // 텔레그램 봇 설정
    const token = process.env.TELEGRAM_TOKEN || '1857829748:AAEQqFmUc4AWxad1-t1KRjQaXoXORjV91I4';
    const baseUrl = `https://api.telegram.org/bot${token}`;

    let message, chatId;

    if (orderData) {
      // 사과 주문 처리
      chatId = process.env.TELEGRAM_CHAT_ID_APPLE || '-4588249608';
      message = createAppleOrderMessage(orderData);
    } else if (surveyData) {
      // 설문 데이터 처리
      chatId = process.env.TELEGRAM_CHAT_ID_SPACE || '-4227666163';
      message = createSurveyMessage(surveyData);
    } else {
      return res.status(400).json({ error: 'Order data or survey data is required' });
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
      
      return res.status(200).json({
        success: true,
        message: '텔레그램 알림이 성공적으로 발송되었습니다.',
        telegramResult: telegramResult
      });
    } else {
      console.error('텔레그램 알림 발송 실패:', telegramResult);
      
      return res.status(500).json({
        success: false,
        error: '텔레그램 알림 발송에 실패했습니다.',
        telegramError: telegramResult
      });
    }

  } catch (error) {
    console.error('API 처리 중 오류 발생:', error);
    
    return res.status(500).json({
      success: false,
      error: '서버 오류가 발생했습니다.',
      details: error.message
    });
  }
}

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

  // orderDate가 ISO 문자열인지 확인하고 적절히 처리
  let orderDateStr;
  if (orderDate) {
    try {
      if (typeof orderDate === 'string') {
        orderDateStr = new Date(orderDate).toLocaleString('ko-KR');
      } else if (orderDate.toDate) {
        // Firestore 타임스탬프인 경우
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

  // submittedAt이 ISO 문자열인지 확인하고 적절히 처리
  let submittedAtStr;
  if (submittedAt) {
    try {
      if (typeof submittedAt === 'string') {
        submittedAtStr = new Date(submittedAt).toLocaleString('ko-KR');
      } else if (submittedAt.toDate) {
        // Firestore 타임스탬프인 경우
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
• 성장 기여도: ${personalGrowth}/7점
• 제출일시: ${submittedAtStr}`;

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
