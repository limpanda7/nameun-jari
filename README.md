# 나믄자리 (Nameun-jari)

숙소예약 웹 애플리케이션 (서버리스)

## 운영 공간

- 백년한옥별채 (동해, 숙소)
- 블로뉴숲 (포천, 숙소)
- 온오프스테이 (동해, 단기임대)
- 온오프스페이스 (서울, 공간대여)
- 묵호쉴래 (동해, 숙소)

## 기술 스택

- React 19 + Vite
- Firebase (Firestore, Hosting, Functions)
- Framer Motion

## 디렉토리 구조

```
├── src/
│   ├── components/     # 페이지별 컴포넌트
│   ├── assets/         # 이미지 리소스
│   ├── constants/      # 가격 등 상수
│   ├── utils/          # API, Firestore 유틸
│   └── firebase.js     # Firebase 설정
├── functions/          # Firebase Functions
└── public/             # 정적 파일
```

## 개발

```bash
npm install
npm run dev
```

## 배포

```bash
npm run deploy
```
