import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * 클래스명을 병합하는 유틸리티 함수
 * clsx로 클래스명을 조건부로 결합하고 tailwind-merge로 충돌을 해결합니다.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * 숫자에 천 단위 구분자 적용
 */
export function formatNumber(number) {
  return number?.toLocaleString("ko-KR") || "";
}

/**
 * ISO 날짜 문자열을 포맷팅
 */
export function formatDate(dateString) {
  if (!dateString) return "";

  const date = new Date(dateString);
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * 문자열 길이 제한 및 말줄임표 추가
 */
export function truncateText(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}
