/**
 * 登录页面
 * 需求: 1.2, 1.3, 1.5, 1.6, 1.7
 */

import { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, Typography, message, Space } from 'antd';
import LoginForm from '../components/LoginForm';
import type { LoginFormData } from '../components/LoginForm';
import { login } from '../services/authService';

const { Title, Text } = Typography;

/**
 * LoginPage 组件
 * - 集成 LoginForm 组件
 * - 实现登录成功后存储 Token 并跳转首页
 * - 实现错误信息显示
 * - 添加"注册账号"和"忘记密码"链接
 */
const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // 处理登录提交 - 需求 1.2, 1.3
  const handleSubmit = useCallback(
    async (data: LoginFormData) => {
      setLoading(true);
      try {
        await login(data);
        message.success('登录成功');
        // 需求 1.3: 登录成功后跳转到首页
        navigate('/');
      } catch (error: unknown) {
        // 需求 1.5: 显示后端返回的错误信息
        if (error instanceof Error) {
          message.error(error.message || '登录失败，请重试');
        } else {
          message.error('登录失败，请重试');
        }
      } finally {
        setLoading(false);
      }
    },
    [navigate]
  );

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      {/* 左侧品牌区域 */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '60px',
          color: '#fff',
        }}
      >
        <Title level={1} style={{ color: '#fff', marginBottom: 16 }}>
          会议室预订系统
        </Title>
        <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 18 }}>
          高效管理会议室资源，提升团队协作效率
        </Text>
      </div>

      {/* 右侧登录表单区域 */}
      <div
        style={{
          width: 480,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: '#fff',
        }}
      >
        <Card
          bordered={false}
          style={{ width: 360, boxShadow: 'none' }}
        >
          <Title level={3} style={{ textAlign: 'center', marginBottom: 32 }}>
            用户登录
          </Title>

          <LoginForm onSubmit={handleSubmit} loading={loading} />

          <Space
            style={{
              width: '100%',
              justifyContent: 'space-between',
              marginTop: 24,
            }}
          >
            {/* 需求 1.6: 注册账号链接 */}
            <Link to="/register" data-testid="register-link">
              <Text type="secondary">注册账号</Text>
            </Link>

            {/* 需求 1.7: 忘记密码链接 */}
            <Link to="/update-password" data-testid="forgot-password-link">
              <Text type="secondary">忘记密码</Text>
            </Link>
          </Space>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
