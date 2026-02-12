/**
 * 修改密码表单组件
 * 需求: 3.1, 3.6, 3.7, 3.8, 6.1, 6.2
 */

import { useState, useCallback } from 'react';
import { Form, Input, Button } from 'antd';
import { LockOutlined, MailOutlined, SafetyOutlined } from '@ant-design/icons';
import {
  validatePassword,
  validateEmail,
  validateCaptcha,
} from '../utils/validators';
import CaptchaButton from './CaptchaButton';

export interface PasswordFormData {
  password: string;
  confirmPassword: string;
  email: string;
  captcha: string;
}

export interface PasswordFormProps {
  onSubmit: (data: PasswordFormData) => Promise<void>;
  onSendCaptcha: (email: string) => Promise<void>;
  loading: boolean;
}

interface FormErrors {
  password: string | null;
  confirmPassword: string | null;
  email: string | null;
  captcha: string | null;
}

/**
 * PasswordForm 组件
 * - 包含新密码、确认密码、邮箱、验证码输入框和提交按钮
 * - 集成 CaptchaButton 组件
 * - 实现表单验证和错误提示
 * - 实现 blur 事件触发验证
 */
const PasswordForm: React.FC<PasswordFormProps> = ({ onSubmit, onSendCaptcha, loading }) => {
  const [formData, setFormData] = useState<PasswordFormData>({
    password: '',
    confirmPassword: '',
    email: '',
    captcha: '',
  });

  const [errors, setErrors] = useState<FormErrors>({
    password: null,
    confirmPassword: null,
    email: null,
    captcha: null,
  });

  const [touched, setTouched] = useState({
    password: false,
    confirmPassword: false,
    email: false,
    captcha: false,
  });

  // 验证单个字段 - 需求 6.1: blur 事件触发验证
  const validateField = useCallback(
    (field: keyof PasswordFormData, value: string, allData?: PasswordFormData): string | null => {
      const data = allData || formData;
      switch (field) {
        case 'password': {
          const result = validatePassword(value);
          return result.valid ? null : result.message || '验证失败';
        }
        case 'confirmPassword': {
          if (!value) return '请输入确认密码';
          if (value !== data.password) return '两次密码输入不一致';
          return null;
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
    [formData]
  );

  // 处理输入变化 - 需求 6.2: 实时更新验证状态
  const handleChange = useCallback(
    (field: keyof PasswordFormData, value: string) => {
      const newFormData = { ...formData, [field]: value };
      setFormData(newFormData);

      if (touched[field]) {
        const error = validateField(field, value, newFormData);
        setErrors((prev) => ({ ...prev, [field]: error }));
      }
      // 如果修改密码，同时验证确认密码
      if (field === 'password' && touched.confirmPassword) {
        const confirmError = validateField('confirmPassword', newFormData.confirmPassword, newFormData);
        setErrors((prev) => ({ ...prev, confirmPassword: confirmError }));
      }
    },
    [formData, touched, validateField]
  );

  // 处理 blur 事件 - 需求 6.1: blur 事件触发验证
  const handleBlur = useCallback(
    (field: keyof PasswordFormData) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      const error = validateField(field, formData[field]);
      setErrors((prev) => ({ ...prev, [field]: error }));
    },
    [formData, validateField]
  );

  // 验证整个表单
  const validateForm = useCallback((): boolean => {
    const passwordError = validateField('password', formData.password);
    const confirmPasswordError = validateField('confirmPassword', formData.confirmPassword);
    const emailError = validateField('email', formData.email);
    const captchaError = validateField('captcha', formData.captcha);

    setErrors({
      password: passwordError,
      confirmPassword: confirmPasswordError,
      email: emailError,
      captcha: captchaError,
    });

    setTouched({
      password: true,
      confirmPassword: true,
      email: true,
      captcha: true,
    });

    return !passwordError && !confirmPasswordError && !emailError && !captchaError;
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
        label="新密码"
        validateStatus={errors.password ? 'error' : ''}
        help={errors.password}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="请输入新密码（至少6位）"
          value={formData.password}
          onChange={(e) => handleChange('password', e.target.value)}
          onBlur={() => handleBlur('password')}
          data-testid="password-input"
        />
      </Form.Item>

      <Form.Item
        label="确认密码"
        validateStatus={errors.confirmPassword ? 'error' : ''}
        help={errors.confirmPassword}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="请再次输入新密码"
          value={formData.confirmPassword}
          onChange={(e) => handleChange('confirmPassword', e.target.value)}
          onBlur={() => handleBlur('confirmPassword')}
          data-testid="confirm-password-input"
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
          data-testid="submit-button"
        >
          修改密码
        </Button>
      </Form.Item>
    </Form>
  );
};

export default PasswordForm;
