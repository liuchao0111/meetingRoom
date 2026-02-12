/**
 * 预订管理页面
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6
 */

import { useState, useEffect, useCallback } from "react";
import {
  Table,
  Form,
  Input,
  Button,
  Space,
  Tag,
  Select,
  Popconfirm,
  message,
  Card,
  Row,
  Col,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import {
  getBookingList,
  approveBooking,
  rejectBooking,
  unbindBooking,
} from "../services/bookingService";
import type { BookingRecord, BookingListParams } from "../types";
import { BookingStatus } from "../types";

/**
 * 搜索表单字段类型
 */
interface SearchFormValues {
  username?: string;
  roomName?: string;
  status?: string;
}

/**
 * 预订状态选项
 */
const statusOptions = [
  { value: "", label: "全部" },
  { value: BookingStatus.PENDING, label: "待审批" },
  { value: BookingStatus.APPROVED, label: "已通过" },
  { value: BookingStatus.REJECTED, label: "已驳回" },
  { value: BookingStatus.CANCELLED, label: "已取消" },
];

/**
 * 获取状态标签颜色
 */
const getStatusColor = (status: string): string => {
  switch (status) {
    case BookingStatus.PENDING:
      return "orange";
    case BookingStatus.APPROVED:
      return "green";
    case BookingStatus.REJECTED:
      return "red";
    case BookingStatus.CANCELLED:
      return "default";
    default:
      return "default";
  }
};

/**
 * 获取状态标签文本
 */
const getStatusText = (status: string): string => {
  switch (status) {
    case BookingStatus.PENDING:
      return "待审批";
    case BookingStatus.APPROVED:
      return "已通过";
    case BookingStatus.REJECTED:
      return "已驳回";
    case BookingStatus.CANCELLED:
      return "已取消";
    default:
      return status;
  }
};

/**
 * BookingListPage 组件
 * - 使用 Ant Design Table 组件展示预订列表
 * - 定义表格列：会议室名称、预订人、开始时间、结束时间、状态、备注、操作
 * - 使用 Pagination 组件实现分页
 * - 使用 Select 组件实现状态筛选（全部、待审批、已通过、已驳回、已取消）
 * - 实现审批通过按钮，调用 BookingService.approveBooking
 * - 实现驳回按钮，调用 BookingService.rejectBooking
 * - 实现解除按钮，调用 BookingService.unbindBooking
 * - 操作成功后刷新列表，失败时显示错误提示并保持原状态
 */
const BookingListPage: React.FC = () => {
  const [form] = Form.useForm<SearchFormValues>();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<BookingRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  /**
   * 获取预订列表数据
   * Requirements: 3.1, 3.2
   */
  const fetchBookingList = useCallback(async () => {
    setLoading(true);
    try {
      const formValues = form.getFieldsValue();
      const params: BookingListParams = {
        pageNo: pagination.current,
        pageSize: pagination.pageSize,
        username: formValues.username || undefined,
        mettingRoomName: formValues.roomName || undefined,
        status: formValues.status
          ? (formValues.status as BookingListParams["status"])
          : undefined,
      };

      const response = await getBookingList(params);
      setData(response.list || []);
      setTotal(response.totalCount || 0);
    } catch (error: unknown) {
      if (error instanceof Error) {
        message.error(error.message || "获取预订列表失败");
      } else {
        message.error("获取预订列表失败");
      }
    } finally {
      setLoading(false);
    }
  }, [form, pagination.current, pagination.pageSize]);

  // 初始加载和分页/搜索变化时重新获取数据
  useEffect(() => {
    fetchBookingList();
  }, [fetchBookingList]);

  /**
   * 处理搜索表单提交
   * Requirements: 3.2
   */
  const handleSearch = useCallback(async () => {
    // 搜索时重置到第一页并立即获取数据
    setPagination((prev) => ({ ...prev, current: 1 }));

    setLoading(true);
    try {
      const formValues = form.getFieldsValue();
      const params: BookingListParams = {
        pageNo: 1,
        pageSize: pagination.pageSize,
        username: formValues.username || undefined,
        mettingRoomName: formValues.roomName || undefined,
        status: formValues.status
          ? (formValues.status as BookingListParams["status"])
          : undefined,
      };

      const response = await getBookingList(params);
      setData(response.list || []);
      setTotal(response.totalCount || 0);
    } catch (error: unknown) {
      if (error instanceof Error) {
        message.error(error.message || "获取预订列表失败");
      } else {
        message.error("获取预订列表失败");
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
    setPagination({ current: 1, pageSize: 10 });

    setLoading(true);
    try {
      const params: BookingListParams = {
        pageNo: 1,
        pageSize: 10,
      };
      const response = await getBookingList(params);
      setData(response.list || []);
      setTotal(response.totalCount || 0);
    } catch {
      message.error("获取预订列表失败");
    } finally {
      setLoading(false);
    }
  }, [form]);

  /**
   * 处理分页变化
   * Requirements: 3.2
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
   * 处理审批通过操作
   * Requirements: 3.3, 3.6
   */
  const handleApprove = useCallback(
    async (bookingId: number) => {
      try {
        await approveBooking(bookingId);
        message.success("审批通过成功");
        // 操作成功后刷新列表
        fetchBookingList();
      } catch (error: unknown) {
        // Requirements 3.6: 审批操作失败时显示错误提示并保持原状态
        if (error instanceof Error) {
          message.error(error.message || "审批通过失败");
        } else {
          message.error("审批通过失败");
        }
      }
    },
    [fetchBookingList],
  );

  /**
   * 处理驳回操作
   * Requirements: 3.4, 3.6
   */
  const handleReject = useCallback(
    async (bookingId: number) => {
      try {
        await rejectBooking(bookingId);
        message.success("驳回成功");
        // 操作成功后刷新列表
        fetchBookingList();
      } catch (error: unknown) {
        // Requirements 3.6: 审批操作失败时显示错误提示并保持原状态
        if (error instanceof Error) {
          message.error(error.message || "驳回失败");
        } else {
          message.error("驳回失败");
        }
      }
    },
    [fetchBookingList],
  );

  /**
   * 处理解除操作
   * Requirements: 3.5, 3.6
   */
  const handleUnbind = useCallback(
    async (bookingId: number) => {
      try {
        await unbindBooking(bookingId);
        message.success("解除成功");
        // 操作成功后刷新列表
        fetchBookingList();
      } catch (error: unknown) {
        // Requirements 3.6: 审批操作失败时显示错误提示并保持原状态
        if (error instanceof Error) {
          message.error(error.message || "解除失败");
        } else {
          message.error("解除失败");
        }
      }
    },
    [fetchBookingList],
  );

  /**
   * 表格列定义
   * Requirements: 3.1
   */
  const columns: ColumnsType<BookingRecord> = [
    {
      title: "会议室名称",
      dataIndex: "roomName",
      key: "roomName",
      width: 150,
      render: (_, record) => {
        return record.room.name;
      },
    },
    {
      title: "会议室位置",
      dataIndex: "room",
      width: 120,
      render: (_, record) => {
        return record.room.location;
      },
    },
    {
      title: "预定人",
      dataIndex: "user",
      render(_, record) {
        return record.user.username;
      },
    },
    {
      title: "开始时间",
      dataIndex: "startTime",
      key: "startTime",
      width: 180,
    },
    {
      title: "结束时间",
      dataIndex: "endTime",
      key: "endTime",
      width: 180,
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: "备注",
      dataIndex: "note",
      key: "note",
      width: 200,
      ellipsis: true,
    },
    {
      title: "操作",
      key: "action",
      width: 200,
      render: (_, record: BookingRecord) => (
        <Space size="small">
          {/* 待审批状态显示通过和驳回按钮 */}
          {record.status === BookingStatus.PENDING && (
            <>
              <Popconfirm
                title="确认审批"
                description={`确定要通过该预订吗？`}
                onConfirm={() => handleApprove(record.id)}
                okText="确定"
                cancelText="取消"
              >
                <Button
                  type="link"
                  size="small"
                  data-testid={`approve-${record.id}`}
                >
                  通过
                </Button>
              </Popconfirm>
              <Popconfirm
                title="确认驳回"
                description={`确定要驳回该预订吗？`}
                onConfirm={() => handleReject(record.id)}
                okText="确定"
                cancelText="取消"
              >
                <Button
                  type="link"
                  danger
                  size="small"
                  data-testid={`reject-${record.id}`}
                >
                  驳回
                </Button>
              </Popconfirm>
            </>
          )}
          {/* 已通过状态显示解除按钮 */}
          {record.status === BookingStatus.APPROVED && (
            <Popconfirm
              title="确认解除"
              description={`确定要解除该预订吗？`}
              onConfirm={() => handleUnbind(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button
                type="link"
                danger
                size="small"
                data-testid={`unbind-${record.id}`}
              >
                解除
              </Button>
            </Popconfirm>
          )}
          {/* 已驳回或已取消状态不显示操作按钮 */}
          {(record.status === BookingStatus.REJECTED ||
            record.status === BookingStatus.CANCELLED) && (
            <span style={{ color: "#999" }}>-</span>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* 搜索表单 - Requirements 3.2 */}
      <Card style={{ marginBottom: 16 }}>
        <Form
          form={form}
          name="booking-search"
          layout="inline"
          onFinish={handleSearch}
        >
          <Row gutter={16} style={{ width: "100%" }}>
            <Col span={6}>
              <Form.Item name="roomName" label="会议室">
                <Input
                  placeholder="请输入会议室名称"
                  allowClear
                  data-testid="search-roomName"
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="username" label="预订人">
                <Input
                  placeholder="请输入预订人"
                  allowClear
                  data-testid="search-username"
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="status" label="状态">
                <Select
                  placeholder="请选择状态"
                  allowClear
                  options={statusOptions}
                  data-testid="search-status"
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

      {/* 预订列表表格 - Requirements 3.1, 3.2 */}
      <Card>
        <Table<BookingRecord>
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
          data-testid="booking-table"
        />
      </Card>
    </div>
  );
};

export default BookingListPage;
