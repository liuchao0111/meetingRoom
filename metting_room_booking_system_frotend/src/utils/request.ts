/**
 * Axios 实例和拦截器
 * 处理 HTTP 请求，自动管理 Token
 * 需求: 5.2, 5.3, 5.4, 5.5
 */

import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from "./tokenManager";

const BASE_URL = "/api";

// 创建 axios 实例
const request = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// 防止多次刷新 Token 的标志
let isRefreshing = false;
// Token 刷新后需要重试的请求队列
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

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

// 请求拦截器：在请求头中添加 accessToken
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
  },
);

// 响应拦截器：处理业务错误码和 401 错误
request.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError<{ code: number; message: string; data: string }>) => {
    const originalRequest = error.config;
    const responseData = error.response?.data;

    // 如果没有配置，直接拒绝
    if (!originalRequest) {
      return Promise.reject(error);
    }

    // 先处理 401 错误 - Token 刷新逻辑
    if (
      error.response?.status === 401 &&
      !originalRequest.url?.includes("/user/refresh")
    ) {
      if (isRefreshing) {
        // 如果正在刷新，将请求加入队列
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            // 使用新 Token 重试
            const token = getAccessToken();
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return request(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      isRefreshing = true;

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        // 没有 refreshToken，跳转到登录页
        clearTokens();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        // 尝试刷新 Token
        const response = await axios.get(`${BASE_URL}/user/refresh`, {
          params: { refreshToken },
        });

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
          response.data.data;

        // 存储新 Token
        setTokens(newAccessToken, newRefreshToken);

        // 处理队列中的请求
        processQueue(null);

        // 使用新 Token 重试原请求
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return request(originalRequest);
      } catch (refreshError) {
        // 刷新失败，清除 Token 并跳转到登录页
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
      const errorMessage = responseData.data || responseData.message || '请求失败';
      return Promise.reject(new Error(errorMessage));
    }

    return Promise.reject(error);
  },
);

export default request;
