/**
 * 验证码按钮组件
 * 需求: 2.2, 2.3, 3.2, 3.3, 4.3, 4.4
 * 
 * 功能:
 * - 点击发送验证码
 * - 发送成功后启动 60 秒倒计时
 * - 验证邮箱格式后才允许发送
 */

import { useState, useEffect, useCallback } from 'react';
import { Button, message } from 'antd';
import { validateEmail } from '../utils/validators';

export interface CaptchaButtonProps {
  /** 接收验证码的邮箱地址 */
  email: string;
  /** 发送验证码的回调函数 */
  onSend: (email: string) => Promise<void>;
  /** 是否从外部禁用按钮 */
  disabled?: boolean;
}

const COUNTDOWN_SECONDS = 60;

export function CaptchaButton({ email, onSend, disabled = false }: CaptchaButtonProps) {
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);

  // 倒计时定时器
  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const handleClick = useCallback(async () => {
    // 发送前验证邮箱格式
    const validation = validateEmail(email);
    if (!validation.valid) {
      message.error(validation.message || '请输入有效的邮箱地址');
      return;
    }

    setLoading(true);
    try {
      await onSend(email);
      message.success('验证码发送成功');
      // 发送成功后启动倒计时
      setCountdown(COUNTDOWN_SECONDS);
    } catch (error) {
      // 错误处理由父组件或 axios 拦截器完成
      // 这里只显示通用错误信息
      const errorMessage = error instanceof Error ? error.message : '验证码发送失败';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [email, onSend]);

  const isDisabled = disabled || loading || countdown > 0;
  const buttonText = countdown > 0 
    ? `${countdown}秒后重新获取` 
    : '获取验证码';

  return (
    <Button
      type="primary"
      onClick={handleClick}
      disabled={isDisabled}
      loading={loading}
    >
      {buttonText}
    </Button>
  );
}

export default CaptchaButton;
