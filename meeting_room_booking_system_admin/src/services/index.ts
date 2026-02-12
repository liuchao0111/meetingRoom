/**
 * 服务层导出
 * 统一导出所有服务模块
 */

export { AuthService, default as authService } from './authService';
export { UserService, default as userService } from './userService';
export { BookingService, default as bookingService } from './bookingService';

// 导出所有服务函数
export {
  adminLogin,
  refreshToken,
  sendCaptcha,
  logout,
} from './authService';

export {
  getUserList,
  freezeUser,
  getCurrentUser,
  updateUserInfo,
  updatePassword,
} from './userService';

export {
  getBookingList,
  approveBooking,
  rejectBooking,
  unbindBooking,
} from './bookingService';
