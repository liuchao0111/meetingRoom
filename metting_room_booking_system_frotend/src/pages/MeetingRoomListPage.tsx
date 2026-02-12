/**
 * 会议室列表页面
 */

import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Input, Space, Tag, Button, Modal, Form, DatePicker, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import request from '../utils/request';
import dayjs from 'dayjs';

interface MeetingRoom {
  id: number;
  name: string;
  capacity: number;
  location: string;
  equipment: string;
  description: string;
  isBooked: boolean;
  createTime: string;
}

interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

interface MeetingRoomListResponse {
  mettingRooms: MeetingRoom[];
  totalCount: number;
}

interface BookingFormValues {
  startTime: dayjs.Dayjs;
  endTime: dayjs.Dayjs;
  note?: string;
}

const MeetingRoomListPage: React.FC = () => {
  const [data, setData] = useState<MeetingRoom[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [modalVisible, setModalVisible] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<MeetingRoom | null>(null);
  const [form] = Form.useForm<BookingFormValues>();

  const fetchList = useCallback(async (pageNo: number, pageSize: number, name?: string) => {
    setLoading(true);
    try {
      const response = await request.get<ApiResponse<MeetingRoomListResponse>>(
        '/metting-room/list',
        {
          params: {
            pageNo,
            pageSize,
            name: name || undefined,
          },
        }
      );
      setData(response.data.data.mettingRooms || []);
      setTotal(response.data.data.totalCount || 0);
    } catch {
      message.error('获取会议室列表失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchList(pagination.current, pagination.pageSize, searchName);
  }, [fetchList, pagination, searchName]);

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleBooking = (room: MeetingRoom) => {
    setSelectedRoom(room);
    form.resetFields();
    setModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      setModalLoading(true);

      await request.post<ApiResponse<void>>('/booking/add', {
        mettingRoomId: selectedRoom!.id,
        startTime: values.startTime.valueOf(),
        endTime: values.endTime.valueOf(),
        note: values.note || '',
      });

      message.success('预定申请已提交，请等待审批');
      setModalVisible(false);
      fetchList(pagination.current, pagination.pageSize, searchName);
    } catch (error: unknown) {
      if (error instanceof Error) {
        message.error(error.message || '预定失败');
      }
    } finally {
      setModalLoading(false);
    }
  };

  const columns: ColumnsType<MeetingRoom> = [
    { title: '会议室名称', dataIndex: 'name', key: 'name', width: 150 },
    { title: '容纳人数', dataIndex: 'capacity', key: 'capacity', width: 100 },
    { title: '位置', dataIndex: 'location', key: 'location', width: 150 },
    { title: '设备', dataIndex: 'equipment', key: 'equipment', width: 200 },
    { title: '描述', dataIndex: 'description', key: 'description', width: 200 },
    {
      title: '状态',
      dataIndex: 'isBooked',
      key: 'isBooked',
      width: 100,
      render: (isBooked: boolean) => (
        <Tag color={isBooked ? 'red' : 'green'}>
          {isBooked ? '已预订' : '空闲'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Button type="link" onClick={() => handleBooking(record)}>
          预定
        </Button>
      ),
    },
  ];

  return (
    <Card title="会议室列表" style={{ width: '100%' }}>
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
          onChange: (page, pageSize) => setPagination({ current: page, pageSize }),
        }}
      />

      <Modal
        title={`预定会议室 - ${selectedRoom?.name}`}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        confirmLoading={modalLoading}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="startTime"
            label="开始时间"
            rules={[{ required: true, message: '请选择开始时间' }]}
          >
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm"
              style={{ width: '100%' }}
              placeholder="请选择开始时间"
            />
          </Form.Item>
          <Form.Item
            name="endTime"
            label="结束时间"
            rules={[
              { required: true, message: '请选择结束时间' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || !getFieldValue('startTime')) {
                    return Promise.resolve();
                  }
                  if (value.isAfter(getFieldValue('startTime'))) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('结束时间必须晚于开始时间'));
                },
              }),
            ]}
          >
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm"
              style={{ width: '100%' }}
              placeholder="请选择结束时间"
            />
          </Form.Item>
          <Form.Item name="note" label="备注">
            <Input.TextArea rows={3} placeholder="请输入备注（可选）" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default MeetingRoomListPage;
