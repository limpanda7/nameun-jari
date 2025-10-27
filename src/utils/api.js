// API 베이스 URL 관리
const getApiBaseUrl = () => {
  const isDev = import.meta.env.DEV;
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  
  // 개발 환경에서는 Vite 프록시 사용
  if (isDev) {
    return '/forest-api';
  }
  
  // 프로덕션 환경
  // Firebase Hosting (nameun-jari.web.app)에서 접속하는 경우
  // Vercel URL을 사용하여 rewrites 기능 활용
  if (hostname.includes('nameun-jari.web.app') || hostname.includes('nameun-jari.firebaseapp.com')) {
    return 'https://nameun-jari.vercel.app/forest-api';
  }
  
  // Vercel에 배포된 경우 상대 경로 사용 (rewrites 작동)
  if (hostname.includes('vercel.app')) {
    return '/forest-api';
  }
  
  // 기본값: 상대 경로 (로컬 테스트 등)
  return '/forest-api';
};

export const FOREST_API_BASE = getApiBaseUrl();

