/**
 * 路由配置
 * Requirements: 1.6, 7.2
 */

import { createBrowserRouter, Navigate } from 'react-router-dom';
import {
  LoginPage,
  UserListPage,
  BookingListPage,
  ProfilePage,
  PasswordPage,
  MeetingRoomPage,
} from '../pages';
import AuthGuard from '../components/AuthGuard';
import AdminLayout from '../layouts/AdminLayout';

/**
 * 路由配置
 * - /login: 登录页面（无需认证）
 * - /: 根路由，使用AuthGuard包裹AdminLayout
 *   - /users: 用户管理页面
 *   - /bookings: 预订管理页面
 *   - /profile: 个人信息页面
 *   - /password: 密码修改页面
 *   - 默认重定向到 /users
 */
const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <AuthGuard>
        <AdminLayout />
      </AuthGuard>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/users" replace />,
      },
      {
        path: 'users',
        element: <UserListPage />,
      },
      {
        path: 'meeting-rooms',
        element: <MeetingRoomPage />,
      },
      {
        path: 'bookings',
        element: <BookingListPage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      {
        path: 'password',
        element: <PasswordPage />,
      },
    ],
  },
]);

export default router;
