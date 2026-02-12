/**
 * 预定历史页面
 */

import { useState, useEffect, useCallback } from "react";
import { Card, Table, Input, Space, Tag, Button, Popconfirm, message } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import request from "../utils/request";

interface BookingRecord {
  id: number;
  startTime: string;
  endTime: string;
  status: string;
  note: string;
  createTime: string;
  user: {
    id: number;
    username: string;
  };
  room: {
    id: number;
    name: string;
    location: string;
  };
}

interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

interface BookingListResponse {
  list: BookingRecord[];
  totalCount: number;
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case "pending":
      return "orange";
    case "approved":
      return "green";
    case "rejected":
      return "red";
    case "cancelled":
      return "default";
    default:
      return "default";
  }
};

const getStatusText = (status: string): string => {
  switch (status) {
    case "pending":
      return "待审批";
    case "approved":
      return "已通过";
    case "rejected":
      return "已驳回";
    case "cancelled":
      return "已取消";
    default:
      return status;
  }
};

const HistoryPage: React.FC = () => {
  const [data, setData] = useState<BookingRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

  const fetchList = useCallback(
    async (pageNo: number, pageSize: number, roomName?: string) => {
      setLoading(true);
      try {
        // 获取当前用户信息
        const userResponse =
          await request.get<ApiResponse<{ username: string }>>(
            "/user/userInfo",
          );
        const username = userResponse.data.data.username;

        // 获取当前用户的预定历史
        const response = await request.get<ApiResponse<BookingListResponse>>(
          "/booking/list",
          {
            params: {
              pageNo,
              pageSize,
              username: username,
              mettingRoomName: roomName || undefined,
            },
          },
        );
        setData(response.data.data.list || []);
        setTotal(response.data.data.totalCount || 0);
      } catch {
        message.error("获取预定历史失败");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchList(pagination.current, pagination.pageSize, searchName);
  }, [fetchList, pagination, searchName]);

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleCancel = async (id: number) => {
    try {
      await request.get(`/booking/cancel/${id}`);
      message.success("取消预定成功");
      fetchList(pagination.current, pagination.pageSize, searchName);
    } catch {
      message.error("取消预定失败");
    }
  };

  const columns: ColumnsType<BookingRecord> = [
    {
      title: "会议室名称",
      key: "roomName",
      width: 150,
      render: (_, record) => record.room?.name,
    },
    {
      title: "会议室位置",
      key: "roomLocation",
      width: 150,
      render: (_, record) => record.room?.location,
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
    },
    {
      title: "申请时间",
      dataIndex: "createTime",
      key: "createTime",
      width: 180,
    },
    {
      title: "操作",
      key: "action",
      width: 100,
      render: (_, record) =>
        record.status === "pending" ? (
          <Popconfirm
            title="确定要取消这个预定吗？"
            onConfirm={() => handleCancel(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger>
              取消预定
            </Button>
          </Popconfirm>
        ) : null,
    },
  ];

  return (
    <Card title="预定历史" style={{ width: "100%" }}>
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="搜索会议室名称"
          prefix={<SearchOutlined />}
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          onPressEnter={handleSearch}
          style={{ width: 300 }}
        />
      </Space>

      <Table
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
          onChange: (page, pageSize) =>
            setPagination({ current: page, pageSize }),
        }}
      />
    </Card>
  );
};

export default HistoryPage;
