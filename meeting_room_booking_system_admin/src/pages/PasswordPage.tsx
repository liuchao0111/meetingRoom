/**
 * 密码修改页面
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6
 */

import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Form, Input, Button, message, Space } from "antd";
import { LockOutlined, SafetyOutlined, MailOutlined } from "@ant-design/icons";
import { updatePassword, getCurrentUser } from "../services/userService";
import { sendCaptcha } from "../services/authService";
import { clearTokens } from "../utils/tokenManager";
import {
  validatePassword,
  validateConfirmPassword,
  validateEmail,
} from "../utils/validators";
import type { UpdatePasswordRequest, UserInfo } from "../types";

/**
 * 表单数据类型
 */
interface PasswordFormData {
  password: string;
  confirmPassword: string;
  email: string;
  captcha: string;
}

const COUNTDOWN_SECONDS = 60;

/**
 * PasswordPage 组件
 * - 使用 Form 组件创建密码修改表单
 * - 添加新密码 Password 输入框，使用 validatePassword 验证强度
 * - 添加确认密码 Password 输入框，使用 validateConfirmPassword 验证一致性
 * - 实现发送验证码按钮，调用 AuthService.sendCaptcha
 * - 实现验证码输入和倒计时显示
 * - 调用 UserService.updatePassword 提交修改
 * - 修改成功后调用 TokenManager.clearTokens 并跳转到登录页
 * - 修改失败时显示错误提示，不清除 Token 不跳转
 */
const PasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm<PasswordFormData>();
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [captchaLoading, setCaptchaLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  /**
   * 获取当前用户信息以获取邮箱
   */
  const fetchUserInfo = useCallback(async () => {
    try {
      const data = await getCurrentUser();
      setUserInfo(data);
      // 设置邮箱初始值
      form.setFieldsValue({
        email: data.email || "",
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        message.error(error.message || "获取用户信息失败");
      } else {
        message.error("获取用户信息失败");
      }
    }
  }, [form]);

  // 初始加载用户信息
  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]);

  // 倒计时定时器
  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  /**
   * 自定义密码验证规则
   * Requirements: 5.2
   */
  const passwordValidator = (_: unknown, value: string) => {
    const result = validatePassword(value);
    if (!result.valid) {
      return Promise.reject(new Error(result.message));
    }
    return Promise.resolve();
  };

  /**
   * 自定义确认密码验证规则
   * Requirements: 5.2
   */
  const confirmPasswordValidator = (_: unknown, value: string) => {
    const password = form.getFieldValue("password");
    const result = validateConfirmPassword(password, value);
    if (!result.valid) {
      return Promise.reject(new Error(result.message));
    }
    return Promise.resolve();
  };

  /**
   * 发送验证码
   * Requirements: 5.3
   */
  const handleSendCaptcha = useCallback(async () => {
    const email = form.getFieldValue("email");

    // 验证邮箱格式
    const validation = validateEmail(email || "");
    if (!validation.valid) {
      message.error(validation.message || "请输入有效的邮箱地址");
      return;
    }

    setCaptchaLoading(true);
    try {
      await sendCaptcha(email, "update_password");
      message.success("验证码发送成功");
      setCountdown(COUNTDOWN_SECONDS);
    } catch (error: unknown) {
      if (error instanceof Error) {
        message.error(error.message || "验证码发送失败");
      } else {
        message.error("验证码发送失败");
      }
    } finally {
      setCaptchaLoading(false);
    }
  }, [form]);

  /**
   * 提交表单修改密码
   * Requirements: 5.4, 5.5, 5.6
   */
  const handleSubmit = useCallback(
    async (values: PasswordFormData) => {
      setLoading(true);
      try {
        const updateData: UpdatePasswordRequest = {
          password: values.password,
          email: values.email,
          captcha: values.captcha,
        };

        await updatePassword(updateData);
        message.success("密码修改成功，请重新登录");

        // Requirements 5.5: 修改成功后清除 Token 并跳转到登录页
        clearTokens();
        navigate("/login");
      } catch (error: unknown) {
        // Requirements 5.6: 修改失败时显示错误提示，不清除 Token 不跳转
        if (error instanceof Error) {
          message.error(error.message || "密码修改失败，请重试");
        } else {
          message.error("密码修改失败，请重试");
        }
        // 不清除 Token，不跳转
      } finally {
        setLoading(false);
      }
    },
    [navigate],
  );

  const isCaptchaDisabled = captchaLoading || countdown > 0;
  const captchaButtonText =
    countdown > 0 ? `${countdown}秒后重新获取` : "获取验证码";

  return (
    <div style={{ padding: 24 }}>
      {/* 密码修改表单 - Requirements 5.1, 5.2, 5.3 */}
      <Card title="修改密码">
        <Form
          form={form}
          name="password-form"
          layout="vertical"
          onFinish={handleSubmit}
          style={{ maxWidth: 500 }}
        >
          {/* 新密码输入 - Requirements 5.2 */}
          <Form.Item
            name="password"
            label="新密码"
            rules={[
              { required: true, message: "请输入新密码" },
              { validator: passwordValidator },
            ]}
            extra="密码长度至少6位，必须包含数字和字母"
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入新密码"
              data-testid="password-input"
            />
          </Form.Item>

          {/* 确认密码输入 - Requirements 5.2 */}
          <Form.Item
            name="confirmPassword"
            label="确认密码"
            dependencies={["password"]}
            rules={[
              { required: true, message: "请确认新密码" },
              { validator: confirmPasswordValidator },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请再次输入新密码"
              data-testid="confirm-password-input"
            />
          </Form.Item>

          {/* 邮箱输入 */}
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: "请输入邮箱" },
              { type: "email", message: "请输入有效的邮箱地址" },
            ]}
            extra={userInfo?.email ? `当前邮箱: ${userInfo.email}` : undefined}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="请输入邮箱"
              disabled
              data-testid="email-input"
            />
          </Form.Item>

          {/* 验证码输入 - Requirements 5.3 */}
          <Form.Item
            name="captcha"
            label="验证码"
            rules={[{ required: true, message: "请输入验证码" }]}
            extra="验证码将发送到您的邮箱"
          >
            <Space.Compact style={{ width: "100%" }}>
              <Input
                prefix={<SafetyOutlined />}
                placeholder="请输入验证码"
                style={{ flex: 1 }}
                data-testid="captcha-input"
              />
              <Button
                type="primary"
                onClick={handleSendCaptcha}
                disabled={isCaptchaDisabled}
                loading={captchaLoading}
                data-testid="send-captcha-button"
              >
                {captchaButtonText}
              </Button>
            </Space.Compact>
          </Form.Item>

          {/* 提交按钮 */}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              data-testid="submit-button"
            >
              修改密码
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default PasswordPage;
