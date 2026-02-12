/**
 * 预订服务
 * 处理会议室预订管理相关操作
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
 */

import request from "../utils/request";
import type {
  BookingRecord,
  BookingListParams,
  PaginatedResponse,
  ApiResponse,
} from "../types";

/**
 * 获取预订列表（分页）
 * GET /booking/list
 * Requirements: 3.1, 3.2
 */
export async function getBookingList(
  params: BookingListParams,
): Promise<PaginatedResponse<BookingRecord>> {
  const response = await request.get<
    ApiResponse<PaginatedResponse<BookingRecord>>
  >("/booking/list", { params });
  return response.data.data;
}

/**
 * 审批通过预订
 * GET /booking/apply/:id
 * Requirements: 3.3
 */
export async function approveBooking(bookingId: number): Promise<void> {
  await request.get<ApiResponse<void>>(`/booking/apply/${bookingId}`);
}

/**
 * 驳回预订
 * GET /booking/reject/:id
 * Requirements: 3.4
 */
export async function rejectBooking(bookingId: number): Promise<void> {
  await request.get<ApiResponse<void>>(`/booking/reject/${bookingId}`);
}

/**
 * 解除预订
 * GET /booking/unbind/:id
 * Requirements: 3.5
 */
export async function unbindBooking(bookingId: number): Promise<void> {
  await request.get<ApiResponse<void>>(`/booking/unibind/${bookingId}`);
}

export const BookingService = {
  getBookingList,
  approveBooking,
  rejectBooking,
  unbindBooking,
};

export default BookingService;
