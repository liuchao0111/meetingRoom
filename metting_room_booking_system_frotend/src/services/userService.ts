/**
 * 用户服务
 * 处理用户个人信息相关操作
 * 需求: 3.4, 4.1, 4.5
 */

import request from '../utils/request';
import type {
  UpdatePasswordRequest,
  UpdateUserRequest,
  UserInfo,
  ApiResponse,
} from '../types/api';

/**
 * 获取当前用户信息
 * 需求: 4.1
 */
export async function getUserInfo(): Promise<UserInfo> {
  const response = await request.get<ApiResponse<UserInfo>>('/user/userInfo');
  return response.data.data;
}

/**
 * 修改用户密码（已登录）
 * 需求: 3.4
 */
export async function updatePassword(
  data: UpdatePasswordRequest
): Promise<void> {
  await request.post<ApiResponse<void>>('/user/update_password', data);
}

/**
 * 重置密码（忘记密码，不需要登录）
 */
export async function resetPassword(
  data: UpdatePasswordRequest
): Promise<void> {
  await request.post<ApiResponse<void>>('/user/reset_password', data);
}

/**
 * 修改用户个人信息
 * 需求: 4.5
 */
export async function updateUserInfo(data: UpdateUserRequest): Promise<void> {
  await request.post<ApiResponse<void>>('/user/update', data);
}

export const UserService = {
  getUserInfo,
  updatePassword,
  resetPassword,
  updateUserInfo,
};

export default UserService;
