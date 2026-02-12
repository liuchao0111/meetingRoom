/**
 * 个人信息页面
 * 需求: 4.1, 4.5, 4.6, 4.9, 4.10
 */

import { useState, useCallback, useEffect } from 'react';
import { Typography, message, Spin } from 'antd';
import ProfileForm from '../components/ProfileForm';
import type { ProfileFormData } from '../components/ProfileForm';
import { getUserInfo, updateUserInfo } from '../services/userService';
import { sendCaptcha } from '../services/authService';
import type { UserInfo } from '../types/api';

const { Title } = Typography;

const ProfilePage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [formKey, setFormKey] = useState(0);

  const fetchUserInfo = useCallback(async () => {
    setFetchLoading(true);
    try {
      const data = await getUserInfo();
      setUserInfo(data);
      setFormKey((k) => k + 1);
    } catch (error: unknown) {
      if (error instanceof Error) {
        message.error(error.message || '获取用户信息失败');
      } else {
        message.error('获取用户信息失败');
      }
    } finally {
      setFetchLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]);

  const handleSubmit = useCallback(
    async (data: ProfileFormData) => {
      setLoading(true);
      try {
        await updateUserInfo(data);
        message.success('个人信息修改成功');
        await fetchUserInfo();
      } catch (error: unknown) {
        if (error instanceof Error) {
          message.error(error.message || '修改个人信息失败，请重试');
        } else {
          message.error('修改个人信息失败，请重试');
        }
      } finally {
        setLoading(false);
      }
    },
    [fetchUserInfo]
  );

  const handleSendCaptcha = useCallback(async (email: string) => {
    await sendCaptcha(email, 'update_user');
  }, []);

  if (fetchLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16, color: '#999' }}>加载中...</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 400 }}>
      <Title level={4} style={{ marginBottom: 24 }}>个人信息</Title>
      <ProfileForm
        key={formKey}
        initialData={userInfo}
        onSubmit={handleSubmit}
        onSendCaptcha={handleSendCaptcha}
        loading={loading}
      />
    </div>
  );
};

export default ProfilePage;
