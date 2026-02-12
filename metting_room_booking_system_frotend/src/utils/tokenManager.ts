/**
 * Token 管理模块
 * 处理认证 Token 的存储和获取
 * 需求: 5.1, 5.6
 */

const TOKEN_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
} as const;

/**
 * 从 localStorage 获取 accessToken
 */
export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
}

/**
 * 从 localStorage 获取 refreshToken
 */
export function getRefreshToken(): string | null {
  return localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
}

/**
 * 将 accessToken 和 refreshToken 存储到 localStorage
 */
export function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, accessToken);
  localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, refreshToken);
}

/**
 * 清除 localStorage 中的所有 Token
 */
export function clearTokens(): void {
  localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
}

/**
 * 检查用户是否已登录（是否有 accessToken）
 */
export function isAuthenticated(): boolean {
  const token = getAccessToken();
  return token !== null && token.length > 0;
}

export const TokenManager = {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
  isAuthenticated,
};

export default TokenManager;
