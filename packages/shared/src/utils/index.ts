// 공통 유틸리티 함수

/**
 * 지정된 시간(ms) 동안 대기
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * 안전한 JSON 파싱
 */
export const safeJsonParse = <T>(json: string, fallback: T): T => {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
};

/**
 * 객체가 비어있는지 확인
 */
export const isEmpty = (obj: Record<string, unknown>): boolean => {
  return Object.keys(obj).length === 0;
};

/**
 * 환경 변수 가져오기 (필수)
 */
export const getEnvVar = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

/**
 * 환경 변수 가져오기 (선택)
 */
export const getEnvVarOptional = (key: string, defaultValue = ""): string => {
  return process.env[key] || defaultValue;
};
