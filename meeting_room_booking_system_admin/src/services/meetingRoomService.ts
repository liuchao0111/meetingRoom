/**
 * 会议室服务
 * 处理会议室管理相关操作
 */

import request from '../utils/request';
import type {
  MeetingRoom,
  MeetingRoomListParams,
  CreateMeetingRoomRequest,
  UpdateMeetingRoomRequest,
  PaginatedResponse,
  ApiResponse,
} from '../types';

/**
 * 后端会议室列表响应格式
 */
interface MeetingRoomListResponse {
  mettingRooms: MeetingRoom[];
  totalCount: number;
}

/**
 * 获取会议室列表（分页）
 * GET /metting-room/list
 */
export async function getMeetingRoomList(
  params: MeetingRoomListParams
): Promise<PaginatedResponse<MeetingRoom>> {
  const response = await request.get<ApiResponse<MeetingRoomListResponse>>(
    '/metting-room/list',
    { params }
  );
  const { mettingRooms, totalCount } = response.data.data;
  return {
    list: mettingRooms,
    totalCount,
  };
}

/**
 * 创建会议室
 * POST /metting-room/create
 */
export async function createMeetingRoom(
  data: CreateMeetingRoomRequest
): Promise<MeetingRoom> {
  const response = await request.post<ApiResponse<MeetingRoom>>(
    '/metting-room/create',
    data
  );
  return response.data.data;
}

/**
 * 更新会议室
 * PUT /metting-room/update
 */
export async function updateMeetingRoom(
  data: UpdateMeetingRoomRequest
): Promise<void> {
  await request.put<ApiResponse<void>>('/metting-room/update', data);
}

/**
 * 删除会议室
 * DELETE /metting-room/:id
 */
export async function deleteMeetingRoom(id: number): Promise<void> {
  await request.delete<ApiResponse<void>>(`/metting-room/${id}`);
}

/**
 * 根据ID获取会议室
 * GET /metting-room/:id
 */
export async function getMeetingRoomById(id: number): Promise<MeetingRoom> {
  const response = await request.get<ApiResponse<MeetingRoom>>(
    `/metting-room/${id}`
  );
  return response.data.data;
}

export const MeetingRoomService = {
  getMeetingRoomList,
  createMeetingRoom,
  updateMeetingRoom,
  deleteMeetingRoom,
  getMeetingRoomById,
};

export default MeetingRoomService;
