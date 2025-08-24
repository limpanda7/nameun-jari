export default async function handler(req, res) {
  // CORS 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONS 요청 처리
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 환경변수 확인
  const token = process.env.TELEGRAM_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID_APPLE;

  res.status(200).json({
    message: '환경변수 테스트',
    hasToken: !!token,
    hasChatId: !!chatId,
    tokenLength: token ? token.length : 0,
    chatIdValue: chatId,
    timestamp: new Date().toISOString()
  });
}
