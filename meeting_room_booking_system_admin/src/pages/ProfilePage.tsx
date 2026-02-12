/**
 * 个人信息页面
 * Requirements: 4.1, 4.2, 4.3, 4.4
 */

import { useState, useCallback, useEffect } from "react";
import {
  Card,
  Descriptions,
  Form,
  Input,
  Button,
  Avatar,
  message,
  Spin,
  Divider,
  Space,
  Upload,
} from "antd";
import type { UploadProps } from "antd";
import {
  UserOutlined,
  MailOutlined,
  SafetyOutlined,
  SmileOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import { getCurrentUser, updateUserInfo } from "../services/userService";
import { sendCaptcha } from "../services/authService";
import { validateEmail } from "../utils/validators";
import { getAccessToken } from "../utils/tokenManager";
import type { UserInfo, UpdateUserRequest } from "../types";

const { Dragger } = Upload;

/**
 * 表单数据类型
 */
interface ProfileFormData {
  headPic: string;
  nickname: string;
  email: string;
  captcha: string;
}

const COUNTDOWN_SECONDS = 60;

/**
 * ProfilePage 组件
 * - 调用 UserService.getCurrentUser 获取当前用户信息
 * - 使用 Descriptions 组件显示用户信息（头像、昵称、邮箱等）
 * - 使用 Form 组件实现信息修改表单
 * - 实现发送验证码按钮，调用 AuthService.sendCaptcha
 * - 实现验证码输入和倒计时显示
 * - 调用 UserService.updateUserInfo 提交修改
 * - 更新失败时显示错误提示并保持原信息
 */
const ProfilePage: React.FC = () => {
  const [form] = Form.useForm<ProfileFormData>();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [captchaLoading, setCaptchaLoading] = useState(false);
  const [headPicUrl, setHeadPicUrl] = useState<string>("");

  /**
   * 头像上传配置
   */
  const uploadProps: UploadProps = {
    name: "file",
    action: "/api/user/upload",
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
    },
    accept: ".png,.jpg,.jpeg,.gif",
    showUploadList: false,
    maxCount: 1,
    onChange(info) {
      if (info.file.status === "done") {
        const uploadedPath = info.file.response;
        if (uploadedPath) {
          // 后端返回的是相对路径，需要拼接完整URL
          const fullUrl = `/api/${uploadedPath}`;
          setHeadPicUrl(fullUrl);
          form.setFieldValue("headPic", fullUrl);
          message.success("头像上传成功");
        }
      } else if (info.file.status === "error") {
        message.error("头像上传失败");
      }
    },
  };

  /**
   * 获取当前用户信息
   * Requirements: 4.1
   */
  const fetchUserInfo = useCallback(async () => {
    setFetchLoading(true);
    try {
      const data = await getCurrentUser();
      setUserInfo(data);
      // 设置表单初始值
      form.setFieldsValue({
        headPic: data.headPic || "",
        nickname: data.nickname || "",
        email: data.email || "",
        captcha: "",
      });
      setHeadPicUrl(data.headPic || "");
    } catch (error: unknown) {
      if (error instanceof Error) {
        message.error(error.message || "获取用户信息失败");
      } else {
        message.error("获取用户信息失败");
      }
    } finally {
      setFetchLoading(false);
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
   * 发送验证码
   * Requirements: 4.2
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
      await sendCaptcha(email, "update_user");
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
   * 提交表单更新用户信息
   * Requirements: 4.3, 4.4
   */
  const handleSubmit = useCallback(
    async (values: ProfileFormData) => {
      setLoading(true);
      try {
        const updateData: UpdateUserRequest = {
          headPic: values.headPic || undefined,
          nickname: values.nickname || undefined,
          email: values.email,
          captcha: values.captcha,
        };

        await updateUserInfo(updateData);
        message.success("个人信息修改成功");
        // 刷新用户信息
        await fetchUserInfo();
        // 清空验证码
        form.setFieldValue("captcha", "");
      } catch (error: unknown) {
        // Requirements 4.4: 更新失败时显示错误提示并保持原信息
        if (error instanceof Error) {
          message.error(error.message || "修改个人信息失败，请重试");
        } else {
          message.error("修改个人信息失败，请重试");
        }
        // 保持原信息不变（表单数据不重置）
      } finally {
        setLoading(false);
      }
    },
    [fetchUserInfo, form],
  );

  // 加载中状态
  if (fetchLoading) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <Spin size="large" />
        <div style={{ marginTop: 16, color: "#999" }}>加载中...</div>
      </div>
    );
  }

  const isCaptchaDisabled = captchaLoading || countdown > 0;
  const captchaButtonText =
    countdown > 0 ? `${countdown}秒后重新获取` : "获取验证码";

  return (
    <div style={{ padding: 24 }}>
      {/* 用户信息展示 - Requirements 4.1 */}
      <Card title="当前信息" style={{ marginBottom: 24 }}>
        <Descriptions column={2}>
          <Descriptions.Item label="头像">
            <Avatar
              size={64}
              src={userInfo?.headPic || undefined}
              icon={!userInfo?.headPic ? <UserOutlined /> : undefined}
            />
          </Descriptions.Item>
          <Descriptions.Item label="用户名">
            {userInfo?.username || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="昵称">
            {userInfo?.nickname || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="邮箱">
            {userInfo?.email || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="手机号">
            {userInfo?.phoneNumber || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {userInfo?.createTime || "-"}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 信息修改表单 - Requirements 4.2, 4.3 */}
      <Card title="修改信息">
        <Form
          form={form}
          name="profile-form"
          layout="vertical"
          onFinish={handleSubmit}
          style={{ maxWidth: 500 }}
        >
          {/* 头像上传 */}
          <Form.Item name="headPic" label="头像">
            <div>
              {headPicUrl && (
                <div style={{ marginBottom: 16 }}>
                  <Avatar size={80} src={headPicUrl} icon={<UserOutlined />} />
                </div>
              )}
              <Dragger {...uploadProps} style={{ maxWidth: 400 }}>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">
                  点击或拖拽文件到这个区域来上传
                </p>
                <p className="ant-upload-hint">
                  支持 png、jpg、jpeg、gif 格式，最大 3MB
                </p>
              </Dragger>
            </div>
          </Form.Item>

          {/* 昵称输入 */}
          <Form.Item name="nickname" label="昵称">
            <Input
              prefix={<SmileOutlined />}
              placeholder="请输入昵称"
              data-testid="nickname-input"
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
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="请输入邮箱"
              data-testid="email-input"
              disabled={true}
            />
          </Form.Item>

          <Divider />

          {/* 验证码输入 - Requirements 4.2 */}
          <Form.Item
            name="captcha"
            label="验证码"
            rules={[{ required: true, message: "请输入验证码" }]}
            extra="修改信息需要验证邮箱"
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
              data-testid="save-button"
            >
              保存修改
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ProfilePage;
