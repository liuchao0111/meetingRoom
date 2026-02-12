/**
 * App组件
 * 整合路由和全局配置
 * Requirements: 7.1
 */

import { RouterProvider } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import router from './router';
import './App.css';

/**
 * Ant Design 主题配置
 */
const themeConfig = {
  token: {
    colorPrimary: '#1890ff',
    borderRadius: 6,
  },
};

/**
 * App组件
 * - 创建RouterProvider提供路由功能
 * - 配置全局ConfigProvider（Ant Design主题和中文语言包）
 * - 引入全局样式
 */
function App() {
  return (
    <ConfigProvider locale={zhCN} theme={themeConfig}>
      <RouterProvider router={router} />
    </ConfigProvider>
  );
}

export default App;
