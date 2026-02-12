/**
 * 管理后台布局组件
 * 使用Ant Design Layout组件创建Sider + Header + Content结构
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */

import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu, Button, Avatar, Dropdown, Spin } from 'antd';
import type { MenuProps } from 'antd';
import {
  UserOutlined,
  CalendarOutlined,
  ProfileOutlined,
  LockOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { logout } from '../services/authService';
import { getCurrentUser } from '../services/userService';
import type { UserInfo } from '../types';

const { Header, Sider, Content } = Layout;

/**
 * 侧边栏菜单项配置
 */
const menuItems: MenuProps['items'] = [
  {
    key: '/users',
    icon: <UserOutlined />,
    label: '用户管理',
  },
  {
    key: '/meeting-rooms',
    icon: <HomeOutlined />,
    label: '会议室管理',
  },
  {
    key: '/bookings',
    icon: <CalendarOutlined />,
    label: '预订管理',
  },
  {
    key: '/profile',
    icon: <ProfileOutlined />,
    label: '个人信息',
  },
  {
    key: '/password',
    icon: <LockOutlined />,
    label: '密码修改',
  },
];

/**
 * AdminLayout 布局组件
 * 提供Ant Design Pro风格的管理后台布局
 */
function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // 获取当前用户信息
  useEffect(() => {
    async function fetchUserInfo() {
      try {
        const user = await getCurrentUser();
        setUserInfo(user);
      } catch {
        // 获取用户信息失败，可能需要重新登录
        // AuthGuard 会处理这种情况
      } finally {
        setLoading(false);
      }
    }
    fetchUserInfo();
  }, []);

  /**
   * 处理菜单点击，导航到对应页面
   * Requirements: 7.2
   */
  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    navigate(key);
  };

  /**
   * 处理退出登录
   * Requirements: 7.4
   */
  const handleLogout = () => {
    logout();
  };

  /**
   * 用户下拉菜单项
   */
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 侧边栏导航 */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme="dark"
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        {/* Logo区域 */}
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: collapsed ? 16 : 18,
            fontWeight: 'bold',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          {collapsed ? '管理' : '会议室管理后台'}
        </div>

        {/* 侧边栏菜单 */}
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>

      {/* 主内容区域 */}
      <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'margin-left 0.2s' }}>
        {/* 顶部栏 */}
        <Header
          style={{
            padding: '0 24px',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0, 21, 41, 0.08)',
            position: 'sticky',
            top: 0,
            zIndex: 1,
          }}
        >
          {/* 折叠按钮 */}
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: 16 }}
          />

          {/* 用户信息和退出登录 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {loading ? (
              <Spin size="small" />
            ) : (
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    cursor: 'pointer',
                    padding: '4px 8px',
                    borderRadius: 4,
                  }}
                >
                  <Avatar
                    size="small"
                    src={userInfo?.headPic}
                    icon={!userInfo?.headPic && <UserOutlined />}
                  />
                  <span>{userInfo?.nickname || userInfo?.username || '管理员'}</span>
                </div>
              </Dropdown>
            )}
          </div>
        </Header>

        {/* 内容区域 */}
        <Content
          style={{
            margin: 24,
            padding: 24,
            background: '#fff',
            borderRadius: 8,
            minHeight: 280,
          }}
        >
          {/* 渲染子路由内容 */}
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}

export default AdminLayout;
