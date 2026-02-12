/**
 * 表单验证函数
 * 需求: 6.3, 6.4, 6.5, 6.6, 6.7
 */

export interface ValidationResult {
  valid: boolean;
  message?: string;
}

/**
 * 验证用户名字段
 * 需求: 6.3 - 对用户名字段验证非空
 */
export function validateUsername(value: string): ValidationResult {
  const trimmed = value.trim();
  if (!trimmed) {
    return { valid: false, message: '用户名不能为空' };
  }
  return { valid: true };
}

/**
 * 验证密码字段
 * 需求: 6.4 - 对密码字段验证非空且最少 6 位
 */
export function validatePassword(value: string): ValidationResult {
  if (!value) {
    return { valid: false, message: '密码不能为空' };
  }
  if (value.length < 6) {
    return { valid: false, message: '密码不能少于 6 位' };
  }
  return { valid: true };
}

/**
 * 验证邮箱字段
 * 需求: 6.5 - 对邮箱字段验证非空且符合邮箱格式
 */
export function validateEmail(value: string): ValidationResult {
  const trimmed = value.trim();
  if (!trimmed) {
    return { valid: false, message: '邮箱不能为空' };
  }
  // 邮箱正则表达式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return { valid: false, message: '邮箱格式不正确' };
  }
  return { valid: true };
}

/**
 * 验证验证码字段
 * 需求: 6.6 - 对验证码字段验证非空
 */
export function validateCaptcha(value: string): ValidationResult {
  const trimmed = value.trim();
  if (!trimmed) {
    return { valid: false, message: '验证码不能为空' };
  }
  return { valid: true };
}

/**
 * 验证昵称字段
 * 需求: 6.7 - 对昵称字段验证非空（注册和修改信息页面）
 */
export function validateNickname(value: string): ValidationResult {
  const trimmed = value.trim();
  if (!trimmed) {
    return { valid: false, message: '昵称不能为空' };
  }
  return { valid: true };
}

export const Validators = {
  validateUsername,
  validatePassword,
  validateEmail,
  validateCaptcha,
  validateNickname,
};

export default Validators;
