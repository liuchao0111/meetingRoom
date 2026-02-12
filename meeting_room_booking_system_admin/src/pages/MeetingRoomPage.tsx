/**
 * 会议室管理页面
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Form,
  Input,
  InputNumber,
  Button,
  Space,
  Tag,
  Popconfirm,
  message,
  Card,
  Row,
  Col,
  Modal,
} from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import {
  getMeetingRoomList,
  createMeetingRoom,
  updateMeetingRoom,
  deleteMeetingRoom,
} from '../services/meetingRoomService';
import type {
  MeetingRoom,
  MeetingRoomListParams,
  CreateMeetingRoomRequest,
  UpdateMeetingRoomRequest,
} from '../types';

/**
 * 搜索表单字段类型
 */
interface SearchFormValues {
  name?: string;
  capacity?: number;
  equipment?: string;
}

/**
 * 会议室表单字段类型
 */
interface RoomFormValues {
  name: string;
  capacity: number;
  location: string;
  equipment?: string;
  description?: string;
}

const MeetingRoomPage: React.FC = () => {
  const [searchForm] = Form.useForm<SearchFormValues>();
  const [roomForm] = Form.useForm<RoomFormValues>();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<MeetingRoom[]>([]);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [modalVisible, setModalVisible] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingRoom, setEditingRoom] = useState<MeetingRoom | null>(null);

  /**
   * 获取会议室列表
   */
  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const formValues = searchForm.getFieldsValue();
      const params: MeetingRoomListParams = {
        pageNo: pagination.current,
        pageSize: pagination.pageSize,
        name: formValues.name || undefined,
        capacity: formValues.capacity || undefined,
        equipment: formValues.equipment || undefined,
      };
      const response = await getMeetingRoomList(params);
      setData(response.list || []);
      setTotal(response.totalCount || 0);
    } catch (error: unknown) {
      if (error instanceof Error) {
        message.error(error.message || '获取会议室列表失败');
      } else {
        message.error('获取会议室列表失败');
      }
    } finally {
      setLoading(false);
    }
  }, [searchForm, pagination.current, pagination.pageSize]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  /**
   * 搜索
   */
  const handleSearch = useCallback(async () => {
    setPagination((prev) => ({ ...prev, current: 1 }));
    setLoading(true);
    try {
      const formValues = searchForm.getFieldsValue();
      const params: MeetingRoomListParams = {
        pageNo: 1,
        pageSize: pagination.pageSize,
        name: formValues.name || undefined,
        capacity: formValues.capacity || undefined,
        equipment: formValues.equipment || undefined,
      };
      const response = await getMeetingRoomList(params);
      setData(response.list || []);
      setTotal(response.totalCount || 0);
    } catch {
      message.error('获取会议室列表失败');
    } finally {
      setLoading(false);
    }
  }, [searchForm, pagination.pageSize]);

  /**
   * 重置搜索
   */
  const handleReset = useCallback(async () => {
    searchForm.resetFields();
    setPagination({ current: 1, pageSize: 10 });
    setLoading(true);
    try {
      const response = await getMeetingRoomList({ pageNo: 1, pageSize: 10 });
      setData(response.list || []);
      setTotal(response.totalCount || 0);
    } catch {
      message.error('获取会议室列表失败');
    } finally {
      setLoading(false);
    }
  }, [searchForm]);

  /**
   * 分页变化
   */
  const handleTableChange = useCallback((paginationConfig: TablePaginationConfig) => {
    setPagination({
      current: paginationConfig.current || 1,
      pageSize: paginationConfig.pageSize || 10,
    });
  }, []);

  /**
   * 打开新增弹窗
   */
  const handleAdd = useCallback(() => {
    setEditingRoom(null);
    roomForm.resetFields();
    setModalVisible(true);
  }, [roomForm]);

  /**
   * 打开编辑弹窗
   */
  const handleEdit = useCallback(
    (record: MeetingRoom) => {
      setEditingRoom(record);
      roomForm.setFieldsValue({
        name: record.name,
        capacity: record.capacity,
        location: record.location,
        equipment: record.equipment,
        description: record.description,
      });
      setModalVisible(true);
    },
    [roomForm]
  );

  /**
   * 提交表单
   */
  const handleModalOk = useCallback(async () => {
    try {
      const values = await roomForm.validateFields();
      setModalLoading(true);

      if (editingRoom) {
        const updateData: UpdateMeetingRoomRequest = {
          id: editingRoom.id,
          ...values,
        };
        await updateMeetingRoom(updateData);
        message.success('会议室更新成功');
      } else {
        const createData: CreateMeetingRoomRequest = values;
        await createMeetingRoom(createData);
        message.success('会议室创建成功');
      }

      setModalVisible(false);
      fetchList();
    } catch (error: unknown) {
      if (error instanceof Error) {
        message.error(error.message || '操作失败');
      }
    } finally {
      setModalLoading(false);
    }
  }, [roomForm, editingRoom, fetchList]);

  /**
   * 删除会议室
   */
  const handleDelete = useCallback(
    async (id: number) => {
      try {
        await deleteMeetingRoom(id);
        message.success('会议室删除成功');
        fetchList();
      } catch (error: unknown) {
        if (error instanceof Error) {
          message.error(error.message || '删除失败');
        } else {
          message.error('删除失败');
        }
      }
    },
    [fetchList]
  );

  /**
   * 表格列定义
   */
  const columns: ColumnsType<MeetingRoom> = [
    { title: '会议室名称', dataIndex: 'name', key: 'name', width: 120 },
    { title: '容纳人数', dataIndex: 'capacity', key: 'capacity', width: 100 },
    { title: '位置', dataIndex: 'location', key: 'location', width: 120 },
    { title: '设备', dataIndex: 'equipment', key: 'equipment', width: 150 },
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
    { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 180 },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record: MeetingRoom) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确认删除"
            description={`确定要删除会议室 "${record.name}" 吗？`}
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger size="small">
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* 搜索表单 */}
      <Card style={{ marginBottom: 16 }}>
        <Form form={searchForm} layout="inline" onFinish={handleSearch}>
          <Row gutter={16} style={{ width: '100%' }}>
            <Col span={6}>
              <Form.Item name="name" label="名称">
                <Input placeholder="请输入会议室名称" allowClear />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="capacity" label="容量">
                <InputNumber placeholder="请输入容量" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="equipment" label="设备">
                <Input placeholder="请输入设备" allowClear />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                    搜索
                  </Button>
                  <Button onClick={handleReset}>重置</Button>
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* 会议室列表 */}
      <Card
        title="会议室列表"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增会议室
          </Button>
        }
      >
        <Table<MeetingRoom>
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
          }}
          onChange={handleTableChange}
        />
      </Card>

      {/* 新增/编辑弹窗 */}
      <Modal
        title={editingRoom ? '编辑会议室' : '新增会议室'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        confirmLoading={modalLoading}
        destroyOnClose
      >
        <Form form={roomForm} layout="vertical">
          <Form.Item
            name="name"
            label="会议室名称"
            rules={[{ required: true, message: '请输入会议室名称' }]}
          >
            <Input placeholder="请输入会议室名称" />
          </Form.Item>
          <Form.Item
            name="capacity"
            label="容纳人数"
            rules={[{ required: true, message: '请输入容纳人数' }]}
          >
            <InputNumber placeholder="请输入容纳人数" min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="location"
            label="位置"
            rules={[{ required: true, message: '请输入位置' }]}
          >
            <Input placeholder="请输入位置" />
          </Form.Item>
          <Form.Item name="equipment" label="设备">
            <Input placeholder="请输入设备（如：白板、投影仪）" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea placeholder="请输入描述" rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MeetingRoomPage;
