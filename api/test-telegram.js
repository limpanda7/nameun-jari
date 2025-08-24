export default async function handler(req, res) {
  // CORS 설정 강화
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Max-Age', '86400');

  // OPTIONS 요청 처리 (CORS preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = '1857829748:AAEQqFmUc4AWxad1-t1KRjQaXoXORjV91I4';
    const chatId = '-4588249608';
    
    const message = '🧪 텔레그램 API 테스트 메시지입니다!';
    
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message
      })
    });

    const result = await response.json();
    
    if (result.ok) {
      return res.status(200).json({ 
        success: true, 
        message: '테스트 메시지 발송 성공!',
        result 
      });
    } else {
      return res.status(500).json({ 
        success: false, 
        error: '텔레그램 발송 실패',
        result 
      });
    }
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}
