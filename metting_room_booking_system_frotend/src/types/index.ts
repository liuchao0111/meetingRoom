// 通用响应格式
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// 登录请求
export interface LoginRequest {
  username: string;
  password: string;
}

// 注册请求
export interface RegisterRequest {
  username: string;
  nickName: string;
  password: string;
  email: string;
  captcha: string;
}

// 修改密码请求
export interface UpdatePasswordRequest {
  password: string;
  email: string;
  captcha: string;
}

// 修改用户信息请求
export interface UpdateUserRequest {
  headPic: string;
  nickname: string;
  email: string;
  captcha: string;
}

// 权限信息
export interface Permission {
  id: number;
  code: string;
  description: string;
}

// 用户信息
export interface UserInfo {
  id: number;
  username: string;
  nickname: string;
  email: string;
  headPic: string;
  phoneNumber: string;
  isFrozen: boolean;
  isAdmin: boolean;
  createTime: string;
  roles: string[];
  permissions: Permission[];
}

// 登录响应
export interface LoginResponse {
  userInfo: UserInfo;
  accessToken: string;
  refreshToken: string;
}

// Token 刷新响应
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

// 验证码类型
export type CaptchaType = 'register' | 'update_password' | 'update_user';

// 表单验证结果
export interface ValidationResult {
  valid: boolean;
  message?: string;
}

// 表单字段状态
export interface FieldState {
  value: string;
  error: string | null;
  touched: boolean;
}

// Token 存储键
export const TOKEN_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
} as const;
