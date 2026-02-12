/**
 * 注册表单组件
 * 需求: 2.1, 2.6, 2.7, 2.8, 6.1, 6.2
 */

import { useState, useCallback } from 'react';
import { Form, Input, Button } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, SafetyOutlined, SmileOutlined } from '@ant-design/icons';
import {
  validateUsername,
  validatePassword,
  validateEmail,
  validateCaptcha,
  validateNickname,
} from '../utils/validators';
import CaptchaButton from './CaptchaButton';

export interface RegisterFormData {
  username: string;
  nickName: string;
  password: string;
  email: string;
  captcha: string;
}

export interface RegisterFormProps {
  onSubmit: (data: RegisterFormData) => Promise<void>;
  onSendCaptcha: (email: string) => Promise<void>;
  loading: boolean;
}

interface FormErrors {
  username: string | null;
  nickName: string | null;
  password: string | null;
  email: string | null;
  captcha: string | null;
}

/**
 * RegisterForm 组件
 * - 包含用户名、昵称、密码、邮箱、验证码输入框和注册按钮
 * - 集成 CaptchaButton 组件
 * - 实现表单验证和错误提示
 * - 实现 blur 事件触发验证
 */
const RegisterForm: React.FC<RegisterFormProps> = ({ onSubmit, onSendCaptcha, loading }) => {
  const [formData, setFormData] = useState<RegisterFormData>({
    username: '',
    nickName: '',
    password: '',
    email: '',
    captcha: '',
  });

  const [errors, setErrors] = useState<FormErrors>({
    username: null,
    nickName: null,
    password: null,
    email: null,
    captcha: null,
  });

  const [touched, setTouched] = useState({
    username: false,
    nickName: false,
    password: false,
    email: false,
    captcha: false,
  });

  // 验证单个字段 - 需求 6.1: blur 事件触发验证
  const validateField = useCallback(
    (field: keyof RegisterFormData, value: string): string | null => {
      switch (field) {
        case 'username': {
          const result = validateUsername(value);
          return result.valid ? null : result.message || '验证失败';
        }
        case 'nickName': {
          const result = validateNickname(value);
          return result.valid ? null : result.message || '验证失败';
        }
        case 'password': {
          const result = validatePassword(value);
          return result.valid ? null : result.message || '验证失败';
        }
        case 'email': {
          const result = validateEmail(value);
          return result.valid ? null : result.message || '验证失败';
        }
        case 'captcha': {
          const result = validateCaptcha(value);
          return result.valid ? null : result.message || '验证失败';
        }
        default:
          return null;
      }
    },
    []
  );

  // 处理输入变化 - 需求 6.2: 实时更新验证状态
  const handleChange = useCallback(
    (field: keyof RegisterFormData, value: string) => {
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
    (field: keyof RegisterFormData) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      const error = validateField(field, formData[field]);
      setErrors((prev) => ({ ...prev, [field]: error }));
    },
    [formData, validateField]
  );

  // 验证整个表单
  const validateForm = useCallback((): boolean => {
    const usernameError = validateField('username', formData.username);
    const nickNameError = validateField('nickName', formData.nickName);
    const passwordError = validateField('password', formData.password);
    const emailError = validateField('email', formData.email);
    const captchaError = validateField('captcha', formData.captcha);

    setErrors({
      username: usernameError,
      nickName: nickNameError,
      password: passwordError,
      email: emailError,
      captcha: captchaError,
    });

    setTouched({
      username: true,
      nickName: true,
      password: true,
      email: true,
      captcha: true,
    });

    return !usernameError && !nickNameError && !passwordError && !emailError && !captchaError;
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
        label="昵称"
        validateStatus={errors.nickName ? 'error' : ''}
        help={errors.nickName}
      >
        <Input
          prefix={<SmileOutlined />}
          placeholder="请输入昵称"
          value={formData.nickName}
          onChange={(e) => handleChange('nickName', e.target.value)}
          onBlur={() => handleBlur('nickName')}
          data-testid="nickname-input"
        />
      </Form.Item>

      <Form.Item
        label="密码"
        validateStatus={errors.password ? 'error' : ''}
        help={errors.password}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="请输入密码（至少6位）"
          value={formData.password}
          onChange={(e) => handleChange('password', e.target.value)}
          onBlur={() => handleBlur('password')}
          data-testid="password-input"
        />
      </Form.Item>

      <Form.Item
        label="邮箱"
        validateStatus={errors.email ? 'error' : ''}
        help={errors.email}
      >
        <Input
          prefix={<MailOutlined />}
          placeholder="请输入邮箱"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          onBlur={() => handleBlur('email')}
          data-testid="email-input"
        />
      </Form.Item>

      <Form.Item
        label="验证码"
        validateStatus={errors.captcha ? 'error' : ''}
        help={errors.captcha}
      >
        <div style={{ display: 'flex', gap: 8 }}>
          <Input
            prefix={<SafetyOutlined />}
            placeholder="请输入验证码"
            value={formData.captcha}
            onChange={(e) => handleChange('captcha', e.target.value)}
            onBlur={() => handleBlur('captcha')}
            style={{ flex: 1 }}
            data-testid="captcha-input"
          />
          <CaptchaButton
            email={formData.email}
            onSend={onSendCaptcha}
          />
        </div>
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          block
          data-testid="register-button"
        >
          注册
        </Button>
      </Form.Item>
    </Form>
  );
};

export default RegisterForm;
