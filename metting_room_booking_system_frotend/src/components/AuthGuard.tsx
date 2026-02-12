import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../utils/tokenManager';

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * 路由守卫组件
 * 检查用户是否已登录，未登录用户访问受保护页面时跳转到登录页
 * 需求: 3.10, 4.10
 */
function AuthGuard({ children }: AuthGuardProps) {
  const location = useLocation();

  if (!isAuthenticated()) {
    // 保存当前路径，登录后可以跳转回来
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

export default AuthGuard;
