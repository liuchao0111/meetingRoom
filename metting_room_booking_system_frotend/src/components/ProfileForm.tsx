/**
 * 个人信息表单组件
 * 需求: 4.2, 4.7, 4.8, 6.1, 6.2
 */

import { useState, useCallback } from "react";
import { Form, Input, Button, Avatar, Upload } from "antd";
import {
  MailOutlined,
  SafetyOutlined,
  SmileOutlined,
  UserOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import type { UploadChangeParam } from "antd/es/upload";
import {
  validateEmail,
  validateCaptcha,
  validateNickname,
} from "../utils/validators";
import CaptchaButton from "./CaptchaButton";
import type { UserInfo } from "../types/api";

export interface ProfileFormData {
  headPic: string;
  nickname: string;
  email: string;
  captcha: string;
}

export interface ProfileFormProps {
  initialData: UserInfo | null;
  onSubmit: (data: ProfileFormData) => Promise<void>;
  onSendCaptcha: (email: string) => Promise<void>;
  loading: boolean;
}

interface FormErrors {
  nickname: string | null;
  email: string | null;
  captcha: string | null;
}

const ProfileForm: React.FC<ProfileFormProps> = ({
  initialData,
  onSubmit,
  onSendCaptcha,
  loading,
}) => {
  const [formData, setFormData] = useState<ProfileFormData>({
    headPic: initialData?.headPic || "",
    nickname: initialData?.nickname || "",
    email: initialData?.email || "",
    captcha: "",
  });

  const [errors, setErrors] = useState<FormErrors>({
    nickname: null,
    email: null,
    captcha: null,
  });

  const [touched, setTouched] = useState({
    nickname: false,
    email: false,
    captcha: false,
  });

  const validateField = useCallback(
    (
      field: keyof Omit<ProfileFormData, "headPic">,
      value: string,
    ): string | null => {
      switch (field) {
        case "nickname": {
          const result = validateNickname(value);
          return result.valid ? null : result.message || "验证失败";
        }
        case "email": {
          const result = validateEmail(value);
          return result.valid ? null : result.message || "验证失败";
        }
        case "captcha": {
          const result = validateCaptcha(value);
          return result.valid ? null : result.message || "验证失败";
        }
        default:
          return null;
      }
    },
    [],
  );

  const handleChange = useCallback(
    (field: keyof Omit<ProfileFormData, "headPic">, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (touched[field]) {
        const error = validateField(field, value);
        setErrors((prev) => ({ ...prev, [field]: error }));
      }
    },
    [touched, validateField],
  );

  const handleBlur = useCallback(
    (field: keyof Omit<ProfileFormData, "headPic">) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      const error = validateField(field, formData[field]);
      setErrors((prev) => ({ ...prev, [field]: error }));
    },
    [formData, validateField],
  );

  const handleAvatarChange = useCallback((info: UploadChangeParam) => {
    if (info.file.status === "done" && info.file.response) {
      const url = info.file.response.data || info.file.response.url;
      setFormData((prev) => ({ ...prev, headPic: url }));
    }
  }, []);

  const handleHeadPicChange = useCallback((value: string) => {
    setFormData((prev) => ({ ...prev, headPic: value }));
  }, []);

  const validateForm = useCallback((): boolean => {
    const nicknameError = validateField("nickname", formData.nickname);
    const emailError = validateField("email", formData.email);
    const captchaError = validateField("captcha", formData.captcha);

    setErrors({
      nickname: nicknameError,
      email: emailError,
      captcha: captchaError,
    });

    setTouched({
      nickname: true,
      email: true,
      captcha: true,
    });

    return !nicknameError && !emailError && !captchaError;
  }, [formData, validateField]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      return;
    }
    await onSubmit(formData);
  }, [formData, onSubmit, validateForm]);

  return (
    <Form layout="vertical" onFinish={handleSubmit}>
      <Form.Item label="头像">
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Avatar
            size={64}
            src={formData.headPic || undefined}
            icon={!formData.headPic ? <UserOutlined /> : undefined}
          />
          <div style={{ flex: 1 }}>
            <Input
              placeholder="请输入头像 URL"
              value={formData.headPic}
              onChange={(e) => handleHeadPicChange(e.target.value)}
              data-testid="headpic-input"
            />
            <Upload
              name="file"
              action="/api/upload"
              showUploadList={false}
              onChange={handleAvatarChange}
              style={{ marginTop: 8 }}
            >
              <Button
                icon={<UploadOutlined />}
                size="small"
                style={{ marginTop: 8 }}
              >
                上传头像
              </Button>
            </Upload>
          </div>
        </div>
      </Form.Item>

      <Form.Item
        label="昵称"
        validateStatus={errors.nickname ? "error" : ""}
        help={errors.nickname}
      >
        <Input
          prefix={<SmileOutlined />}
          placeholder="请输入昵称"
          value={formData.nickname}
          onChange={(e) => handleChange("nickname", e.target.value)}
          onBlur={() => handleBlur("nickname")}
          data-testid="nickname-input"
        />
      </Form.Item>

      <Form.Item
        label="邮箱"
        validateStatus={errors.email ? "error" : ""}
        help={errors.email}
      >
        <Input
          prefix={<MailOutlined />}
          placeholder="请输入邮箱"
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
          onBlur={() => handleBlur("email")}
          data-testid="email-input"
        />
      </Form.Item>

      <Form.Item
        label="验证码"
        validateStatus={errors.captcha ? "error" : ""}
        help={errors.captcha}
      >
        <div style={{ display: "flex", gap: 8 }}>
          <Input
            prefix={<SafetyOutlined />}
            placeholder="请输入验证码"
            value={formData.captcha}
            onChange={(e) => handleChange("captcha", e.target.value)}
            onBlur={() => handleBlur("captcha")}
            style={{ flex: 1 }}
            data-testid="captcha-input"
          />
          <CaptchaButton email={formData.email} onSend={onSendCaptcha} />
        </div>
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          block
          data-testid="save-button"
        >
          保存
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ProfileForm;
