import { Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { isAuthenticated } from '../utils/tokenManager';
import { getCurrentUser } from '../services/userService';
import type { UserInfo } from '../types';

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * 路由守卫组件
 * 检查TokenManager中是否存在有效Token
 * 验证当前用户是否具有管理员权限（isAdmin为true）
 * 未登录或非管理员时重定向到登录页 /login
 * 已登录管理员渲染子组件
 * Requirements: 1.5, 1.6
 */
function AuthGuard({ children }: AuthGuardProps) {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      // 首先检查是否有Token
      if (!isAuthenticated()) {
        setLoading(false);
        return;
      }

      try {
        // 获取当前用户信息以验证管理员权限
        const user = await getCurrentUser();
        setUserInfo(user);
      } catch {
        // 获取用户信息失败（可能Token无效）
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, []);

  // 加载中显示空白或加载指示器
  if (loading) {
    return null;
  }

  // 未登录时重定向到登录页
  if (!isAuthenticated() || error) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 非管理员用户重定向到登录页
  if (!userInfo?.isAdmin) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 已登录管理员渲染子组件
  return <>{children}</>;
}

export default AuthGuard;
