// JWT 토큰 관리 함수들
export const setToken = (token) => {
  localStorage.setItem("token", token);
};

export const getToken = () => {
  return localStorage.getItem("token");
};

export const removeToken = () => {
  localStorage.removeItem("token");
};

export const isAuthenticated = () => {
  const token = getToken();
  if (!token) return false;

  try {
    // JWT의 payload 부분 추출 (두 번째 부분)
    const payload = token.split(".")[1];
    // Base64 디코딩
    const decodedPayload = atob(payload);
    // JSON 파싱하여 유효성 검사
    const { id, email } = JSON.parse(decodedPayload);
    return Boolean(id && email);
  } catch (err) {
    console.error("토큰 검증 오류:", err);
    removeToken(); // 유효하지 않은 토큰 제거
    return false;
  }
};

// JWT 토큰에서 사용자 정보 추출
export const getUserFromToken = (token) => {
  try {
    const payload = token.split(".")[1];
    const decodedPayload = atob(payload);
    return JSON.parse(decodedPayload);
  } catch (err) {
    console.error("토큰 디코딩 오류:", err);
    return null;
  }
};
