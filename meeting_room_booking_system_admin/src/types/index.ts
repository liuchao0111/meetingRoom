/**
 * 类型定义文件
 * 后台管理系统前端类型定义
 */

// ============================================
// 用户相关类型定义 (Task 2.1)
// Requirements: 2.1
// ============================================

/**
 * 权限信息
 */
export interface Permission {
  id: number;
  code: string;
  description: string;
}

/**
 * 用户信息
 */
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

/**
 * 用户列表查询参数
 */
export interface UserListParams {
  pageNo: number;
  pageSize: number;
  username?: string;
  nickname?: string;
  email?: string;
}

// ============================================
// 预订相关类型定义 (Task 2.2)
// Requirements: 3.1
// ============================================

/**
 * 预订状态
 */
export const BookingStatus = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  CANCELLED: "cancelled",
} as const;

export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus];

/**
 * 预订记录
 */
export interface BookingRecord {
  id: number;
  userId: number;
  username: string;
  roomId: number;
  roomName: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  note: string;
  createTime: string;
  updateTime: string;
  user: UserInfo;
  room: MeetingRoom;
}

/**
 * 预订列表查询参数
 */
export interface BookingListParams {
  pageNo: number;
  pageSize: number;
  username?: string;
  mettingRoomName?: string;
  mettingRoomPosition?: string;
  status?: BookingStatus;
  bookingTimeRangeStart?: number;
  bookingTimeRangeEnd?: number;
}

// ============================================
// 认证相关类型定义 (Task 2.3)
// Requirements: 1.2
// ============================================

/**
 * 登录请求
 */
export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * 登录响应
 */
export interface LoginResponse {
  userInfo: UserInfo;
  accessToken: string;
  refreshToken: string;
}

/**
 * Token刷新响应
 */
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

/**
 * 验证码类型
 */
export type CaptchaType = "register" | "update_password" | "update_user";

// ============================================
// 通用类型定义 (Task 2.4)
// Requirements: 2.2, 3.2, 4.3, 5.4
// ============================================

/**
 * API响应格式
 */
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

/**
 * 分页响应
 */
export interface PaginatedResponse<T> {
  list: T[];
  totalCount: number;
}

/**
 * 分页配置
 */
export interface PaginationConfig {
  current: number;
  pageSize: number;
  total: number;
}

/**
 * 更新用户信息请求
 */
export interface UpdateUserRequest {
  headPic?: string;
  nickname?: string;
  email: string;
  captcha: string;
}

/**
 * 更新密码请求
 */
export interface UpdatePasswordRequest {
  password: string;
  email: string;
  captcha: string;
}

// ============================================
// Token 存储键常量
// ============================================

export const TOKEN_KEYS = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
} as const;

// ============================================
// 会议室相关类型定义
// ============================================

/**
 * 会议室信息
 */
export interface MeetingRoom {
  id: number;
  name: string;
  capacity: number;
  location: string;
  equipment: string;
  description: string;
  isBooked: boolean;
  createTime: string;
  updateTime: string;
}

/**
 * 会议室列表查询参数
 */
export interface MeetingRoomListParams {
  pageNo: number;
  pageSize: number;
  name?: string;
  capacity?: number;
  equipment?: string;
}

/**
 * 创建会议室请求
 */
export interface CreateMeetingRoomRequest {
  name: string;
  capacity: number;
  location: string;
  equipment?: string;
  description?: string;
}

/**
 * 更新会议室请求
 */
export interface UpdateMeetingRoomRequest {
  id: number;
  name: string;
  capacity: number;
  location: string;
  equipment?: string;
  description?: string;
}
