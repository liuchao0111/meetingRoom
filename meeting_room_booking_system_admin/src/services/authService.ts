/**
 * 认证服务
 * 处理管理员认证相关操作
 * Requirements: 1.2, 1.3, 4.2, 5.3, 6.2, 7.4
 */

import request from '../utils/request';
import { setTokens, clearTokens } from '../utils/tokenManager';
import type {
  LoginRequest,
  LoginResponse,
  TokenResponse,
  CaptchaType,
  ApiResponse,
} from '../types';

/**
 * 管理员登录
 * POST /user/admin/login
 * Requirements: 1.2, 1.3
 */
export async function adminLogin(data: LoginRequest): Promise<LoginResponse> {
  const response = await request.post<ApiResponse<LoginResponse>>(
    '/user/admin/login',
    data,
    { params: { isAdmin: 'true' } }
  );
  const loginData = response.data.data;

  // 登录成功后存储 Token
  setTokens(loginData.accessToken, loginData.refreshToken);

  return loginData;
}

/**
 * 刷新 Token
 * GET /user/admin/refresh
 * Requirements: 6.2
 */
export async function refreshToken(
  refreshTokenValue: string
): Promise<TokenResponse> {
  const response = await request.get<ApiResponse<TokenResponse>>(
    '/user/admin/refresh',
    {
      params: { refreshToken: refreshTokenValue, isAdmin: 'true' },
    }
  );
  const tokenData = response.data.data;

  // 存储新 Token
  setTokens(tokenData.accessToken, tokenData.refreshToken);

  return tokenData;
}

/**
 * 发送验证码到邮箱
 * GET /user/captcha
 * Requirements: 4.2, 5.3
 */
export async function sendCaptcha(
  email: string,
  type: CaptchaType
): Promise<void> {
  await request.get<ApiResponse<void>>('/user/captcha', {
    params: { address: email, type },
  });
}

/**
 * 退出登录
 * 清除 Token 并跳转登录页
 * Requirements: 7.4
 */
export function logout(): void {
  clearTokens();
  window.location.href = '/login';
}

export const AuthService = {
  adminLogin,
  refreshToken,
  sendCaptcha,
  logout,
};

export default AuthService;
