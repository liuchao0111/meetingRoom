/**
 * 认证服务
 * 处理用户认证相关操作
 * 需求: 1.2, 1.3, 2.2, 2.4
 */

import request from '../utils/request';
import { setTokens, clearTokens } from '../utils/tokenManager';
import type {
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  TokenResponse,
  CaptchaType,
  ApiResponse,
} from '../types/api';

/**
 * 用户登录
 * 需求: 1.2, 1.3
 */
export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await request.post<ApiResponse<LoginResponse>>(
    '/user/login',
    data
  );
  const loginData = response.data.data;
  
  // 登录成功后存储 Token
  setTokens(loginData.accessToken, loginData.refreshToken);
  
  return loginData;
}

/**
 * 用户注册
 * 需求: 2.4
 */
export async function register(data: RegisterRequest): Promise<void> {
  await request.post<ApiResponse<void>>('/user/register', data);
}

/**
 * 发送验证码到邮箱
 * 需求: 2.2
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
 * 使用 refreshToken 刷新 accessToken
 */
export async function refreshToken(
  refreshTokenValue: string
): Promise<TokenResponse> {
  const response = await request.get<ApiResponse<TokenResponse>>(
    '/user/refresh',
    {
      params: { refreshToken: refreshTokenValue },
    }
  );
  const tokenData = response.data.data;
  
  // 存储新 Token
  setTokens(tokenData.accessToken, tokenData.refreshToken);
  
  return tokenData;
}

/**
 * 用户退出登录 - 清除 Token
 */
export function logout(): void {
  clearTokens();
}

export const AuthService = {
  login,
  register,
  sendCaptcha,
  refreshToken,
  logout,
};

export default AuthService;
