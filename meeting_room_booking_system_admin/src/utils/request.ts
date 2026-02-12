/**
 * Axios 实例和拦截器
 * 处理 HTTP 请求，自动管理 Token
 * Requirements: 6.1, 6.2, 6.3, 6.4
 */

import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from "./tokenManager";

const BASE_URL = "/api";

// 创建 axios 实例，配置 baseURL 和 timeout
// Requirements: 6.1
const request = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// ============================================
// Token 刷新机制状态管理
// Requirements: 6.4 - 并发请求只执行一次刷新
// ============================================

// 防止多次刷新 Token 的标志（Promise 锁）
let isRefreshing = false;

// Token 刷新后需要重试的请求队列
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

/**
 * 处理等待队列中的请求
 * @param error 如果有错误则拒绝所有请求，否则解析所有请求
 */
const processQueue = (error: Error | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(undefined);
    }
  });
  failedQueue = [];
};

// ============================================
// 请求拦截器
// Requirements: 6.1 - 从 TokenManager 获取 Token 并添加到 Authorization 头
// ============================================

request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============================================
// 响应拦截器
// Requirements: 6.1, 6.2, 6.3, 6.4
// ============================================

request.interceptors.response.use(
  (response) => {
    return response;
  },
  async (
    error: AxiosError<{ code: number; message: string; data: string }>
  ) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };
    const responseData = error.response?.data;

    // 如果没有配置，直接拒绝
    if (!originalRequest) {
      return Promise.reject(error);
    }

    // ============================================
    // 401 错误处理 - Token 刷新逻辑
    // Requirements: 6.1, 6.2, 6.3, 6.4
    // ============================================
    if (
      error.response?.status === 401 &&
      !originalRequest.url?.includes("/user/admin/refresh") &&
      !originalRequest._retry
    ) {
      // Requirements: 6.4 - 如果正在刷新，将请求加入队列等待
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            // 刷新成功后，使用新 Token 重试原请求
            const token = getAccessToken();
            if (token && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return request(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      // 标记正在刷新，防止并发刷新
      isRefreshing = true;
      originalRequest._retry = true;

      const refreshToken = getRefreshToken();

      // Requirements: 6.3 - 没有 refreshToken，清除 Token 并跳转登录页
      if (!refreshToken) {
        clearTokens();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        // Requirements: 6.1 - 调用 /user/admin/refresh 接口刷新 Token
        const response = await axios.get(`${BASE_URL}/user/admin/refresh`, {
          params: { refreshToken },
        });

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
          response.data.data;

        // Requirements: 6.2 - 刷新成功后存储新 Token
        setTokens(newAccessToken, newRefreshToken);

        // 处理队列中等待的请求
        processQueue(null);

        // Requirements: 6.2 - 使用新 Token 重试原请求
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return request(originalRequest);
      } catch (refreshError) {
        // Requirements: 6.3 - 刷新失败，清除 Token 并跳转登录页
        processQueue(refreshError as Error);
        clearTokens();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // 处理其他业务错误 - 提取错误信息
    if (responseData && responseData.data) {
      const errorMessage =
        responseData.data || responseData.message || "请求失败";
      return Promise.reject(new Error(errorMessage));
    }

    return Promise.reject(error);
  }
);

export default request;
