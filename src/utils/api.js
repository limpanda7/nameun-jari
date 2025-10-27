// API 베이스 URL 관리
const getApiBaseUrl = () => {
  // 개발 환경에서는 Vite 프록시 사용
  if (import.meta.env.DEV) {
    return '/forest-api';
  }
  
  // 프로덕션 환경: Firebase Functions를 통해 프록시
  return '/forest-api';
};

export const FOREST_API_BASE = getApiBaseUrl();

