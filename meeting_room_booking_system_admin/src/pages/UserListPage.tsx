/**
 * 用户管理页面
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 */

import { useState, useEffect, useCallback } from "react";
import {
  Table,
  Form,
  Input,
  Button,
  Space,
  Tag,
  Avatar,
  Popconfirm,
  message,
  Card,
  Row,
  Col,
} from "antd";
import { SearchOutlined, UserOutlined } from "@ant-design/icons";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { getUserList, freezeUser } from "../services/userService";
import type { UserInfo, UserListParams } from "../types";

/**
 * 搜索表单字段类型
 */
interface SearchFormValues {
  username?: string;
  nickname?: string;
  email?: string;
}

/**
 * UserListPage 组件
 * - 使用 Ant Design Table 组件展示用户列表
 * - 定义表格列：用户名、昵称、邮箱、头像、状态（冻结/正常）、创建时间、操作
 * - 使用 Pagination 组件实现分页，默认每页10条
 * - 使用 Form 组件实现搜索表单（用户名、昵称、邮箱输入框）
 * - 实现冻结按钮，点击后弹出 Popconfirm 确认
 * - 调用 UserService.freezeUser 执行冻结操作
 * - 操作成功后刷新列表，失败时显示错误提示
 */
const UserListPage: React.FC = () => {
  const [form] = Form.useForm<SearchFormValues>();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<UserInfo[]>([]);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  /**
   * 获取用户列表数据
   * Requirements: 2.1, 2.2, 2.3
   */
  const fetchUserList = useCallback(async () => {
    setLoading(true);
    try {
      const formValues = form.getFieldsValue();
      const params: UserListParams = {
        pageNo: pagination.current,
        pageSize: pagination.pageSize,
        username: formValues.username || undefined,
        nickname: formValues.nickname || undefined,
        email: formValues.email || undefined,
      };

      const response = await getUserList(params);
      setData(response.list || []);
      setTotal(response.totalCount || 0);
    } catch (error: unknown) {
      if (error instanceof Error) {
        message.error(error.message || "获取用户列表失败");
      } else {
        message.error("获取用户列表失败");
      }
    } finally {
      setLoading(false);
    }
  }, [form, pagination.current, pagination.pageSize]);

  // 初始加载和分页/搜索变化时重新获取数据
  useEffect(() => {
    fetchUserList();
  }, [fetchUserList]);

  /**
   * 处理搜索表单提交
   * Requirements: 2.3
   */
  const handleSearch = useCallback(async () => {
    // 搜索时重置到第一页并立即获取数据
    setPagination((prev) => ({ ...prev, current: 1 }));

    setLoading(true);
    try {
      const formValues = form.getFieldsValue();
      const params: UserListParams = {
        pageNo: 1,
        pageSize: pagination.pageSize,
        username: formValues.username || undefined,
        nickname: formValues.nickname || undefined,
        email: formValues.email || undefined,
      };

      const response = await getUserList(params);
      setData(response.list || []);
      setTotal(response.totalCount || 0);
    } catch (error: unknown) {
      if (error instanceof Error) {
        message.error(error.message || "获取用户列表失败");
      } else {
        message.error("获取用户列表失败");
      }
    } finally {
      setLoading(false);
    }
  }, [form, pagination.pageSize]);

  /**
   * 处理重置搜索
   */
  const handleReset = useCallback(async () => {
    form.resetFields();
    // 重置分页并立即获取数据
    setPagination({ current: 1, pageSize: 10 });

    // 立即用空条件获取数据
    setLoading(true);
    try {
      const params: UserListParams = {
        pageNo: 1,
        pageSize: 10,
      };
      const response = await getUserList(params);
      setData(response.list || []);
      setTotal(response.totalCount || 0);
    } catch (error: unknown) {
      if (error instanceof Error) {
        message.error(error.message || "获取用户列表失败");
      } else {
        message.error("获取用户列表失败");
      }
    } finally {
      setLoading(false);
    }
  }, [form]);

  /**
   * 处理分页变化
   * Requirements: 2.2
   */
  const handleTableChange = useCallback(
    (paginationConfig: TablePaginationConfig) => {
      setPagination({
        current: paginationConfig.current || 1,
        pageSize: paginationConfig.pageSize || 10,
      });
    },
    [],
  );

  /**
   * 处理冻结用户操作
   * Requirements: 2.4, 2.5
   */
  const handleFreeze = useCallback(
    async (userId: number) => {
      try {
        await freezeUser(userId);
        message.success("用户冻结成功");
        // 操作成功后刷新列表
        fetchUserList();
      } catch (error: unknown) {
        // Requirements 2.5: 冻结操作失败时显示错误提示并保持原状态
        if (error instanceof Error) {
          message.error(error.message || "冻结用户失败");
        } else {
          message.error("冻结用户失败");
        }
      }
    },
    [fetchUserList],
  );

  /**
   * 表格列定义
   * Requirements: 2.1
   */
  const columns: ColumnsType<UserInfo> = [
    {
      title: "头像",
      dataIndex: "headPic",
      key: "headPic",
      width: 80,
      render: (headPic: string) => (
        <Avatar src={headPic} icon={<UserOutlined />} size="large" />
      ),
    },
    {
      title: "用户名",
      dataIndex: "username",
      key: "username",
      width: 120,
    },
    {
      title: "昵称",
      dataIndex: "nickname",
      key: "nickname",
      width: 120,
    },
    {
      title: "邮箱",
      dataIndex: "email",
      key: "email",
      width: 200,
    },
    {
      title: "状态",
      dataIndex: "isFrozen",
      key: "isFrozen",
      width: 100,
      render: (isFrozen: boolean) => (
        <Tag color={isFrozen ? "red" : "green"}>
          {isFrozen ? "已冻结" : "正常"}
        </Tag>
      ),
    },
    {
      title: "创建时间",
      dataIndex: "createTime",
      key: "createTime",
      width: 180,
    },
    {
      title: "操作",
      key: "action",
      width: 100,
      render: (_, record: UserInfo) => (
        <Space size="small">
          {!record.isFrozen && (
            <Popconfirm
              title="确认冻结"
              description={`确定要冻结用户 "${record.username}" 吗？`}
              onConfirm={() => handleFreeze(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="link" danger size="small">
                冻结
              </Button>
            </Popconfirm>
          )}
          {record.isFrozen && <Tag color="default">已冻结</Tag>}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* 搜索表单 - Requirements 2.3 */}
      <Card style={{ marginBottom: 16 }}>
        <Form
          form={form}
          name="user-search"
          layout="inline"
          onFinish={handleSearch}
        >
          <Row gutter={16} style={{ width: "100%" }}>
            <Col span={6}>
              <Form.Item name="username" label="用户名">
                <Input
                  placeholder="请输入用户名"
                  allowClear
                  data-testid="search-username"
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="nickname" label="昵称">
                <Input
                  placeholder="请输入昵称"
                  allowClear
                  data-testid="search-nickname"
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="email" label="邮箱">
                <Input
                  placeholder="请输入邮箱"
                  allowClear
                  data-testid="search-email"
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item>
                <Space>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SearchOutlined />}
                    data-testid="search-button"
                  >
                    搜索
                  </Button>
                  <Button onClick={handleReset} data-testid="reset-button">
                    重置
                  </Button>
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* 用户列表表格 - Requirements 2.1, 2.2 */}
      <Card>
        <Table<UserInfo>
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
            pageSizeOptions: ["10", "20", "50", "100"],
            hideOnSinglePage: true,
          }}
          onChange={handleTableChange}
          data-testid="user-table"
        />
      </Card>
    </div>
  );
};

export default UserListPage;
