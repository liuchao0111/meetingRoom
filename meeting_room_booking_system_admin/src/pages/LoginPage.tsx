/**
 * 管理员登录页面
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Input, Button, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { adminLogin } from '../services/authService';
import type { LoginRequest } from '../types';

const { Title, Text } = Typography;

/**
 * LoginPage 组件
 * - 使用 Ant Design Form 组件创建登录表单
 * - 添加用户名 Input 和密码 Password 输入框
 * - 实现表单验证（用户名和密码必填）
 * - 调用 AuthService.adminLogin 提交登录
 * - 登录成功后使用 navigate 跳转到 /users
 * - 登录失败时使用 message.error 显示错误提示
 * - 非管理员登录时显示"权限不足"提示
 */
const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm<LoginRequest>();

  // 处理登录提交 - Requirements 1.2, 1.3, 1.4, 1.5
  const handleSubmit = useCallback(
    async (values: LoginRequest) => {
      setLoading(true);
      try {
        const response = await adminLogin(values);
        
        // Requirements 1.5: 验证是否为管理员
        if (!response.userInfo.isAdmin) {
          message.error('权限不足，仅管理员可登录');
          return;
        }
        
        message.success('登录成功');
        // Requirements 1.3: 登录成功后跳转到用户管理页
        navigate('/users');
      } catch (error: unknown) {
        // Requirements 1.4: 显示错误提示信息
        if (error instanceof Error) {
          message.error(error.message || '登录失败，请检查用户名和密码');
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
        background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
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
          后台管理系统
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
        <Card bordered={false} style={{ width: 360, boxShadow: 'none' }}>
          <Title level={3} style={{ textAlign: 'center', marginBottom: 32 }}>
            管理员登录
          </Title>

          <Form
            form={form}
            name="admin-login"
            onFinish={handleSubmit}
            autoComplete="off"
            size="large"
          >
            {/* 用户名输入框 - Requirements 1.1 */}
            <Form.Item
              name="username"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="用户名"
                data-testid="username-input"
              />
            </Form.Item>

            {/* 密码输入框 - Requirements 1.1 */}
            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="密码"
                data-testid="password-input"
              />
            </Form.Item>

            {/* 登录按钮 */}
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                data-testid="login-button"
              >
                登录
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
