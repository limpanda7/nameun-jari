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
    const { orderData } = req.body;

    if (!orderData) {
      return res.status(400).json({ error: 'Order data is required' });
    }

    // 텔레그램 봇 설정
    const token = process.env.TELEGRAM_TOKEN || '1857829748:AAEQqFmUc4AWxad1-t1KRjQaXoXORjV91I4';
    const chatId = process.env.TELEGRAM_CHAT_ID_APPLE || '-4588249608';
    const baseUrl = `https://api.telegram.org/bot${token}`;

    // 알림 메시지 생성
    const message = createAppleOrderMessage(orderData);

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

  const orderDateStr = orderDate ? new Date(orderDate).toLocaleString('ko-KR') : new Date().toLocaleString('ko-KR');

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
