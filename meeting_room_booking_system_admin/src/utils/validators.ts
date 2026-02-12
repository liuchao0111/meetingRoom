/**
 * 表单验证函数
 * Requirements: 5.2
 */

export interface ValidationResult {
  valid: boolean;
  message?: string;
}

/**
 * 验证密码
 * 规则：长度>=6，必须包含数字和字母
 * Requirements: 5.2
 */
export function validatePassword(value: string): ValidationResult {
  if (!value) {
    return { valid: false, message: '密码不能为空' };
  }
  if (value.length < 6) {
    return { valid: false, message: '密码长度不能少于6位' };
  }
  // 检查是否包含数字
  const hasNumber = /\d/.test(value);
  if (!hasNumber) {
    return { valid: false, message: '密码必须包含数字' };
  }
  // 检查是否包含字母
  const hasLetter = /[a-zA-Z]/.test(value);
  if (!hasLetter) {
    return { valid: false, message: '密码必须包含字母' };
  }
  return { valid: true };
}

/**
 * 验证邮箱格式
 * Requirements: 5.2
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
 * 验证确认密码是否与原密码一致
 * Requirements: 5.2
 */
export function validateConfirmPassword(
  password: string,
  confirmPassword: string
): ValidationResult {
  if (!confirmPassword) {
    return { valid: false, message: '确认密码不能为空' };
  }
  if (password !== confirmPassword) {
    return { valid: false, message: '两次输入的密码不一致' };
  }
  return { valid: true };
}

export const Validators = {
  validatePassword,
  validateEmail,
  validateConfirmPassword,
};

export default Validators;
