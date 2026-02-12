/**
 * 登录表单组件
 * 需求: 1.1, 1.4, 6.1, 6.2
 */

import { useState, useCallback } from 'react';
import { Form, Input, Button } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { validateUsername, validatePassword } from '../utils/validators';

export interface LoginFormData {
  username: string;
  password: string;
}

export interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<void>;
  loading: boolean;
}

interface FormErrors {
  username: string | null;
  password: string | null;
}

/**
 * LoginForm 组件
 * - 包含用户名、密码输入框和登录按钮
 * - 实现表单验证和错误提示
 * - 实现 blur 事件触发验证
 */
const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: '',
  });

  const [errors, setErrors] = useState<FormErrors>({
    username: null,
    password: null,
  });

  const [touched, setTouched] = useState({
    username: false,
    password: false,
  });

  // 验证单个字段 - 需求 6.1: blur 事件触发验证
  const validateField = useCallback(
    (field: keyof LoginFormData, value: string): string | null => {
      if (field === 'username') {
        const result = validateUsername(value);
        return result.valid ? null : result.message || '验证失败';
      }
      if (field === 'password') {
        const result = validatePassword(value);
        return result.valid ? null : result.message || '验证失败';
      }
      return null;
    },
    []
  );

  // 处理输入变化 - 需求 6.2: 实时更新验证状态
  const handleChange = useCallback(
    (field: keyof LoginFormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));

      // 如果字段已被触摸过，实时验证
      if (touched[field]) {
        const error = validateField(field, value);
        setErrors((prev) => ({ ...prev, [field]: error }));
      }
    },
    [touched, validateField]
  );

  // 处理 blur 事件 - 需求 6.1: blur 事件触发验证
  const handleBlur = useCallback(
    (field: keyof LoginFormData) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      const error = validateField(field, formData[field]);
      setErrors((prev) => ({ ...prev, [field]: error }));
    },
    [formData, validateField]
  );

  // 验证整个表单
  const validateForm = useCallback((): boolean => {
    const usernameError = validateField('username', formData.username);
    const passwordError = validateField('password', formData.password);

    setErrors({
      username: usernameError,
      password: passwordError,
    });

    setTouched({
      username: true,
      password: true,
    });

    return !usernameError && !passwordError;
  }, [formData, validateField]);

  // 处理表单提交
  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    await onSubmit(formData);
  }, [formData, onSubmit, validateForm]);

  return (
    <Form layout="vertical" onFinish={handleSubmit}>
      <Form.Item
        label="用户名"
        validateStatus={errors.username ? 'error' : ''}
        help={errors.username}
      >
        <Input
          prefix={<UserOutlined />}
          placeholder="请输入用户名"
          value={formData.username}
          onChange={(e) => handleChange('username', e.target.value)}
          onBlur={() => handleBlur('username')}
          data-testid="username-input"
        />
      </Form.Item>

      <Form.Item
        label="密码"
        validateStatus={errors.password ? 'error' : ''}
        help={errors.password}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="请输入密码"
          value={formData.password}
          onChange={(e) => handleChange('password', e.target.value)}
          onBlur={() => handleBlur('password')}
          data-testid="password-input"
        />
      </Form.Item>

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
  );
};

export default LoginForm;
