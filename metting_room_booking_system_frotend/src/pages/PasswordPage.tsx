/**
 * 修改密码页面（忘记密码）
 * 需求: 3.4, 3.5, 3.9, 3.10
 */

import { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, Typography, message, Space } from 'antd';
import PasswordForm from '../components/PasswordForm';
import type { PasswordFormData } from '../components/PasswordForm';
import { resetPassword } from '../services/userService';
import { sendCaptcha } from '../services/authService';

const { Title, Text } = Typography;

const PasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (data: PasswordFormData) => {
      setLoading(true);
      try {
        await resetPassword(data);
        message.success('密码重置成功，请重新登录');
        navigate('/login');
      } catch (error: unknown) {
        if (error instanceof Error) {
          message.error(error.message || '密码重置失败，请重试');
        } else {
          message.error('密码重置失败，请重试');
        }
      } finally {
        setLoading(false);
      }
    },
    [navigate]
  );

  const handleSendCaptcha = useCallback(async (email: string) => {
    await sendCaptcha(email, 'update_password');
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#f5f5f5',
      }}
    >
      <Card style={{ width: 400 }}>
        <Title level={3} style={{ textAlign: 'center', marginBottom: 24 }}>
          忘记密码
        </Title>
        <PasswordForm
          onSubmit={handleSubmit}
          onSendCaptcha={handleSendCaptcha}
          loading={loading}
        />
        <Space style={{ width: '100%', justifyContent: 'center', marginTop: 16 }}>
          <Link to="/login">
            <Text type="secondary">返回登录</Text>
          </Link>
        </Space>
      </Card>
    </div>
  );
};

export default PasswordPage;
