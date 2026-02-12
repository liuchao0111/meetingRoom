/**
 * 用户服务
 * 处理用户管理相关操作
 * Requirements: 2.1, 2.2, 2.3, 2.4, 4.1, 4.3, 5.4
 */

import request from '../utils/request';
import type {
  UserInfo,
  UserListParams,
  PaginatedResponse,
  UpdateUserRequest,
  UpdatePasswordRequest,
  ApiResponse,
} from '../types';

/**
 * 后端用户列表响应格式
 */
interface UserListResponse {
  users: UserInfo[];
  totalCount: number;
}

/**
 * 获取用户列表（分页）
 * GET /user/list
 * Requirements: 2.1, 2.2, 2.3
 */
export async function getUserList(
  params: UserListParams
): Promise<PaginatedResponse<UserInfo>> {
  const response = await request.get<ApiResponse<UserListResponse>>(
    '/user/list',
    { params }
  );
  // 后端返回 users，前端期望 list，做一下转换
  const { users, totalCount } = response.data.data;
  return {
    list: users,
    totalCount,
  };
}

/**
 * 冻结用户
 * GET /user/freeze
 * Requirements: 2.4
 */
export async function freezeUser(userId: number): Promise<void> {
  await request.get<ApiResponse<string>>('/user/freeze', {
    params: { id: userId },
  });
}

/**
 * 获取当前登录用户信息
 * GET /user/userInfo
 * Requirements: 4.1
 */
export async function getCurrentUser(): Promise<UserInfo> {
  const response = await request.get<ApiResponse<UserInfo>>('/user/userInfo');
  return response.data.data;
}

/**
 * 更新用户信息
 * POST /user/admin/update
 * Requirements: 4.3
 */
export async function updateUserInfo(data: UpdateUserRequest): Promise<void> {
  await request.post<ApiResponse<void>>('/user/admin/update', data);
}

/**
 * 更新密码
 * POST /user/admin/update_password
 * Requirements: 5.4
 */
export async function updatePassword(
  data: UpdatePasswordRequest
): Promise<void> {
  await request.post<ApiResponse<void>>('/user/admin/update_password', data);
}

export const UserService = {
  getUserList,
  freezeUser,
  getCurrentUser,
  updateUserInfo,
  updatePassword,
};

export default UserService;
