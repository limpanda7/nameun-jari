# 나는자리 (Nameun-jari)

백년한옥사과를 주문할 수 있는 웹 애플리케이션입니다.

## 주요 기능

- 🍎 백년한옥사과 주문
- 📱 반응형 웹 디자인
- 🔔 텔레그램 알림 (주문 시)
- 📊 Firebase Firestore 연동
- 🚀 Vercel Functions를 통한 서버리스 API

## 텔레그램 알림 설정

사과 주문 시 텔레그램으로 알림을 받으려면 다음 설정이 필요합니다:

### 1. 텔레그램 봇 생성
1. [@BotFather](https://t.me/botfather)에서 새 봇을 생성
2. 봇 토큰을 복사

### 2. 환경 변수 설정

#### Vercel 배포 시 (권장)
Vercel 프로젝트 설정에서 환경 변수를 추가:

```bash
TELEGRAM_TOKEN=your_telegram_bot_token_here
TELEGRAM_CHAT_ID_APPLE=your_telegram_chat_id_here
```

#### 로컬 개발 시
프로젝트 루트에 `.env.local` 파일을 생성:

```bash
VITE_TELEGRAM_TOKEN=your_telegram_bot_token_here
VITE_TELEGRAM_CHAT_ID_APPLE=your_telegram_chat_id_here
```

### 3. 채팅 ID 확인
1. 봇과 대화를 시작
2. 브라우저에서 `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates` 접속
3. `chat.id` 값을 복사하여 환경 변수에 설정

## 개발 환경 설정

```bash
npm install
npm run dev
```

## 빌드 및 배포

### Vercel 배포 (권장)
```bash
npm install -g vercel
vercel
```

### Firebase 호스팅
```bash
npm run build
npm run deploy
```

## 기술 스택

- React 19
- Vite
- Firebase Firestore
- Vercel Functions
- Framer Motion
- Lucide React Icons
