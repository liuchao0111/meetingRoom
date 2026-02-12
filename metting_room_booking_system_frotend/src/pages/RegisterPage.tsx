/**
 * 注册页面
 * 需求: 2.4, 2.5, 2.9, 2.10
 */

import { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, Typography, message, Space } from 'antd';
import RegisterForm from '../components/RegisterForm';
import type { RegisterFormData } from '../components/RegisterForm';
import { register, sendCaptcha } from '../services/authService';

const { Title, Text } = Typography;

/**
 * RegisterPage 组件
 * - 集成 RegisterForm 组件
 * - 实现注册成功后跳转登录页
 * - 实现错误信息显示
 * - 添加"已有账号，去登录"链接
 */
const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // 处理注册提交 - 需求 2.4
  const handleSubmit = useCallback(
    async (data: RegisterFormData) => {
      setLoading(true);
      try {
        await register(data);
        // 需求 2.5: 注册成功后显示提示并跳转到登录页面
        message.success('注册成功，请登录');
        navigate('/login');
      } catch (error: unknown) {
        // 需求 2.9: 显示后端返回的错误信息
        if (error instanceof Error) {
          message.error(error.message || '注册失败，请重试');
        } else {
          message.error('注册失败，请重试');
        }
      } finally {
        setLoading(false);
      }
    },
    [navigate]
  );

  // 处理发送验证码 - 需求 2.2
  const handleSendCaptcha = useCallback(async (email: string) => {
    await sendCaptcha(email, 'register');
  }, []);

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

      {/* 右侧注册表单区域 */}
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
            用户注册
          </Title>

          <RegisterForm
            onSubmit={handleSubmit}
            onSendCaptcha={handleSendCaptcha}
            loading={loading}
          />

          <Space
            style={{
              width: '100%',
              justifyContent: 'center',
              marginTop: 24,
            }}
          >
            {/* 需求 2.10: 已有账号，去登录链接 */}
            <Link to="/login" data-testid="login-link">
              <Text type="secondary">已有账号，去登录</Text>
            </Link>
          </Space>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
