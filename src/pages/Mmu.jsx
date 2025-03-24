import React, { useState, useEffect } from 'react';
import { Table, Card, Space, Tag, Typography, message, Modal, Select, Form, Input, Button, Divider } from 'antd';
import { FileTextOutlined, LinkOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Mmu.css';

const { Title } = Typography;

const MmuManagement = () => {
  const [loading, setLoading] = useState(true);
  const [mmuList, setMmuList] = useState([]);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [currentMmu, setCurrentMmu] = useState(null);
  const [descModalVisible, setDescModalVisible] = useState(false);
  const [currentDesc, setCurrentDesc] = useState('');
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [form] = Form.useForm();
  const [createForm] = Form.useForm();
  const navigate = useNavigate();

  // 获取MMU列表数据
  const fetchMmuList = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://124.221.174.50:8080/api/v1/gpt/mng/mmu/list/mng');
      if (response.data && response.data.code === '0000') {
        const data = response.data.data || [];
        setMmuList(data);
      } else {
        const errorMsg = '获取MMU列表失败：' + (response.data?.info || '未知错误');
        setError(errorMsg);
        message.error(errorMsg);
      }
    } catch (error) {
      console.error('获取MMU列表出错：', error);
      const errorMsg = '获取MMU列表出错，请稍后重试';
      setError(errorMsg);
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMmuList();
  }, []);

  // 删除MMU
  const handleDelete = async (mmuId) => {
    try {
      setDeleteLoading(true);
      const response = await axios.post(`http://124.221.174.50:8080/api/v1/gpt/mng/mmu/del?id=${mmuId}`);
      
      if (response.data && response.data.code === '0000') {
        message.success('删除成功');
        fetchMmuList(); // 刷新列表
      } else {
        message.error('删除失败：' + (response.data?.info || '未知错误'));
      }
    } catch (error) {
      console.error('删除MMU出错：', error);
      message.error('删除出错，请稍后重试');
    } finally {
      setDeleteLoading(false);
    }
  };

  // 确认删除
  const showDeleteConfirm = (mmuId, mmuName) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除 ${mmuName} 吗？此操作不可恢复。`,
      okText: '确认',
      okType: 'danger',
      cancelText: '取消',
      confirmLoading: deleteLoading,
      onOk: () => handleDelete(mmuId)
    });
  };

  // 打开编辑Modal
  const showEditModal = (record) => {
    setCurrentMmu(record);
    form.setFieldsValue({
      mmu_name: record.mmu_name,
      strategy: record.strategy,
      sort: record.sort,
      status: record.status,
      description: record.desc // 添加description字段的预填充
    });
    setEditModalVisible(true);
  };

  // 处理编辑表单提交
  const handleEdit = async (values) => {
    try {
      setEditLoading(true);
      const response = await axios.post('http://124.221.174.50:8080/api/v1/gpt/mng/mmu/list/update', {
        ...values,
        mmu_id: currentMmu.mmu_id
      });
      
      if (response.data && response.data.code === '0000') {
        message.success('更新成功');
        setEditModalVisible(false);
        fetchMmuList(); // 刷新列表
      } else {
        message.error('更新失败：' + (response.data?.info || '未知错误'));
      }
    } catch (error) {
      console.error('更新MMU出错：', error);
      message.error('更新出错，请稍后重试');
    } finally {
      setEditLoading(false);
    }
  };

  // 显示描述信息
  const showDescModal = (desc) => {
    setCurrentDesc(desc);
    setDescModalVisible(true);
  };

  // 定义表格列
  const columns = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      width: 80,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'MMU名称',
      dataIndex: 'mmu_name',
      key: 'mmu_name',
      width: 200,
    },
    {
      title: '策略',
      dataIndex: 'strategy',
      key: 'strategy',
      width: 120,
    },
    {
      title: '展示排序',
      dataIndex: 'sort',
      key: 'sort',
      width: 80,
      sorter: (a, b) => a.sort - b.sort,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        let color = 'blue';
        if (status === '实验中') {
          color = 'blue';
        } else if (status === '已推全') {
          color = 'green';
        } else if (status === '关闭') {
          color = 'red';
        }
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      key: 'create_time',
      width: 180,
      render: (time) => {
        if (!time) return '-';
        const date = new Date(time);
        return date.toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        });
      },
    },
    {
      title: '更新时间',
      dataIndex: 'update_time',
      key: 'update_time',
      width: 180,
      render: (time) => {
        if (!time) return '-';
        const date = new Date(time);
        return date.toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        });
      },
    },
    {
      title: '描述信息',
      dataIndex: 'description',
      key: 'description',
      width: 100,
      render: (description) => (
        <a onClick={() => showDescModal(description)}>
          <Button type="link" icon={<FileTextOutlined />}>查看</Button>
        </a>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button type="primary" size="small" onClick={() => showEditModal(record)}>编辑</Button>
          <Button type="primary" danger size="small" onClick={() => showDeleteConfirm(record.mmu_id, record.mmu_name)}>删除</Button>
        </Space>
      ),
    },
    
  ];


  // 状态选项
  const statusOptions = [
    { value: 'all', label: '全部' },
    { value: '关闭', label: '关闭' },
    { value: '实验中', label: '实验中' },
    { value: '已推全', label: '已推全' }
  ];

  // 根据状态筛选数据
  const filteredMmuList = statusFilter === 'all' 
    ? mmuList 
    : mmuList.filter(item => item.status === statusFilter);

  return (
    <div className="mmu-container">
      <Card>
        <div className="mmu-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <Title level={4}>MMU管理</Title>
          <Button type="primary" onClick={() => {
            createForm.resetFields();
            setCreateModalVisible(true);
          }}>开启实验</Button>
        </div>
        <Table
          columns={columns}
          dataSource={filteredMmuList}
          rowKey="mmu_id"
          loading={loading}
          locale={{
            emptyText: loading ? '加载中...' : '暂无数据'
          }}
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
        />
      </Card>

      {/* 编辑Modal */}
      <Modal
        title="编辑MMU"
        open={editModalVisible}
        onOk={form.submit}
        onCancel={() => setEditModalVisible(false)}
        confirmLoading={editLoading}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleEdit}
        >
          <Form.Item
            name="mmu_name"
            label="MMU名称"
            rules={[{ required: true, message: '请输入MMU名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="strategy"
            label="策略"
            rules={[{ required: true, message: '请输入策略' }]}
          >
            <Select placeholder="请选择策略">
              <Select.Option value="单项概率">单项概率</Select.Option>
              <Select.Option value="整体概率">整体概率</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="sort"
            label="展示排序"
            rules={[{ required: true, message: '请输入展示排序' }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select>
              <Select.Option value="实验中">实验中</Select.Option>
              <Select.Option value="已上线">已上线</Select.Option>
              <Select.Option value="已下线">已下线</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="description"
            label="描述信息"
            rules={[{ required: false }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 描述信息Modal */}
      <Modal
        title="描述信息"
        open={descModalVisible}
        onCancel={() => setDescModalVisible(false)}
        footer={null}
      >
        <Typography.Paragraph style={{ whiteSpace: 'pre-wrap' }}>
          {currentDesc || '暂无描述信息'}
        </Typography.Paragraph>
      </Modal>
          
      {/* 创建MMU Modal */}
      <Modal
        title="开启实验"
        open={createModalVisible}
        onOk={createForm.submit}
        onCancel={() => setCreateModalVisible(false)}
        confirmLoading={createLoading}
        width={1000}
      >
        <Divider orientation="left" style={{ margin: '24px 0 16px' }}>MMU配置</Divider>
        <Form
          form={createForm}
          layout="vertical"
          onFinish={async (values) => {
            try {
              setCreateLoading(true);
              const response = await axios.post('http://124.221.174.50:8080/api/v1/gpt/mng/mmu/open', {
                ...values,
                desc: values.description,
                prompts: values.prompts || []
              });
              
              if (response.data && response.data.code === '0000') {
                message.success('创建成功');
                setCreateModalVisible(false);
                fetchMmuList();
                // 跳转到prompt页面
                handleNavigateToPrompt(values.mmu_name);
              } else {
                message.error('创建失败：' + (response.data?.info || '未知错误'));
              }
            } catch (error) {
              console.error('创建MMU出错：', error);
              message.error('创建出错，请稍后重试');
            } finally {
              setCreateLoading(false);
            }
          }}
        >
          <Form.Item
            name="mmu_name"
            label="MMU名称"
            rules={[{ required: true, message: '请输入MMU名称' }]}
          >
            <Input placeholder="请输入MMU名称" />
          </Form.Item>
          <Form.Item
            name="strategy"
            label="策略"
            rules={[{ required: true, message: '请输入策略' }]}
          >
            <Input placeholder="请输入策略" />
          </Form.Item>
          <Form.Item
            name="sort"
            label="展示排序"
            rules={[{ required: true, message: '请输入展示排序' }]}
          >
            <Input type="number" placeholder="请输入展示排序" />
          </Form.Item>
          <Form.Item
            name="description"
            label="描述信息"
          >
            <Input.TextArea rows={4} placeholder="请输入描述信息" />
          </Form.Item>
          <Divider orientation="left" style={{ margin: '24px 0 16px' }}>Prompt配置</Divider>
          <div style={{ marginBottom: 16 }}>
            <Button 
              type="primary" 
              style={{ 
                margin: '0 0 16px', 
                padding: '6px 24px',
                borderRadius: '4px',
                fontSize: '14px',
                height: '36px'
              }} 
              onClick={() => {
                const prompts = createForm.getFieldValue('prompts') || [];
                if (prompts.length > 0) {
                  const equalRate = (1 / prompts.length).toFixed(2);
                  const updatedPrompts = prompts.map(p => ({ ...p, rate: equalRate }));
                  createForm.setFieldsValue({ prompts: updatedPrompts });
                }
              }}>等概率</Button>
          </div>
          <Form.List
            name="prompts"
            initialValue={[{}]}
            rules={[{
              validator: async (_, prompts) => {
                if (!prompts || prompts.length < 1) {
                  return Promise.reject(new Error('至少创建一个Prompt'));
                }
              },
            }]}
          >
            {(fields, { add, remove }, { errors }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <div key={key} style={{ display: 'flex', marginBottom: 8, gap: 16, alignItems: 'flex-start', width: '100%' }}>
                    <Form.Item
                      {...restField}
                      name={[name, 'name']}
                      rules={[{ required: true, message: '请输入Prompt名称' }]}
                      style={{ flex: '0 0 20%', margin: 0 }}
                    >
                      <Input placeholder="Prompt名称" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'content']}
                      rules={[{ required: true, message: '请输入Prompt内容' }]}
                      style={{ flex: '0 0 55%', margin: 0 }}
                    >
                      <Input.TextArea rows={1} placeholder="Prompt内容" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'rate']}
                      rules={[{ required: true, message: '请输入概率' }]}
                      style={{ flex: '0 0 15%', margin: 0 }}
                    >
                      <Input type="number" step="0.1" min="0" max="1" placeholder="概率(0~1)" />
                    </Form.Item>
                    <Button type="link" icon={<DeleteOutlined />} onClick={() => remove(name)} style={{ padding: '4px 8px' }} disabled={fields.length === 1} />
                  </div>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    添加Prompt
                  </Button>
                  <Form.ErrorList errors={errors} />
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>
    </div>
  );



  return (
    <div className="mmu-container">
      <Card>
        <div className="mmu-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <Title level={4}>MMU管理</Title>
          <Button type="primary" onClick={() => {
            createForm.resetFields();
            setCreateModalVisible(true);
          }}>开启实验</Button>
        </div>
        <Table
          columns={columns}
          dataSource={filteredMmuList}
          rowKey="mmu_id"
          loading={loading}
          locale={{
            emptyText: loading ? '加载中...' : '暂无数据'
          }}
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
        />
      </Card>

      {/* 编辑Modal */}
      <Modal
        title="编辑MMU"
        open={editModalVisible}
        onOk={form.submit}
        onCancel={() => setEditModalVisible(false)}
        confirmLoading={editLoading}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleEdit}
        >
          <Form.Item
            name="mmu_name"
            label="MMU名称"
            rules={[{ required: true, message: '请输入MMU名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="strategy"
            label="策略"
            rules={[{ required: true, message: '请输入策略' }]}
          >
            <Select placeholder="请选择策略">
              <Select.Option value="单项概率">单项概率</Select.Option>
              <Select.Option value="整体概率">整体概率</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="sort"
            label="展示排序"
            rules={[{ required: true, message: '请输入展示排序' }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select>
              <Select.Option value="实验中">实验中</Select.Option>
              <Select.Option value="已上线">已上线</Select.Option>
              <Select.Option value="已下线">已下线</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="description"
            label="描述信息"
            rules={[{ required: false }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 描述信息Modal */}
      <Modal
        title="描述信息"
        open={descModalVisible}
        onCancel={() => setDescModalVisible(false)}
        footer={null}
      >
        <Typography.Paragraph style={{ whiteSpace: 'pre-wrap' }}>
          {currentDesc || '暂无描述信息'}
        </Typography.Paragraph>
      </Modal>
          
      {/* 创建MMU Modal */}
      <Modal
        title="开启实验"
        open={createModalVisible}
        onOk={createForm.submit}
        onCancel={() => setCreateModalVisible(false)}
        confirmLoading={createLoading}
        width={1000}
      >
        <Divider orientation="left" style={{ margin: '24px 0 16px' }}>MMU配置</Divider>
        <Form
          form={createForm}
          layout="vertical"
          onFinish={async (values) => {
            try {
              setCreateLoading(true);
              const response = await axios.post('http://124.221.174.50:8080/api/v1/gpt/mng/mmu/open', {
                ...values,
                desc: values.description,
                prompts: values.prompts || []
              });
              
              if (response.data && response.data.code === '0000') {
                message.success('创建成功');
                setCreateModalVisible(false);
                fetchMmuList();
                // 跳转到prompt页面
                handleNavigateToPrompt(values.mmu_name);
              } else {
                message.error('创建失败：' + (response.data?.info || '未知错误'));
              }
            } catch (error) {
              console.error('创建MMU出错：', error);
              message.error('创建出错，请稍后重试');
            } finally {
              setCreateLoading(false);
            }
          }}
        >
          <Form.Item
            name="mmu_name"
            label="MMU名称"
            rules={[{ required: true, message: '请输入MMU名称' }]}
          >
            <Input placeholder="请输入MMU名称" />
          </Form.Item>
          <Form.Item
            name="strategy"
            label="策略"
            rules={[{ required: true, message: '请输入策略' }]}
          >
            <Input placeholder="请输入策略" />
          </Form.Item>
          <Form.Item
            name="sort"
            label="展示排序"
            rules={[{ required: true, message: '请输入展示排序' }]}
          >
            <Input type="number" placeholder="请输入展示排序" />
          </Form.Item>
          <Form.Item
            name="description"
            label="描述信息"
          >
            <Input.TextArea rows={4} placeholder="请输入描述信息" />
          </Form.Item>
          <Divider orientation="left" style={{ margin: '24px 0 16px' }}>Prompt配置</Divider>
          <div style={{ marginBottom: 16 }}>
            <Button 
              type="primary" 
              style={{ 
                margin: '0 0 16px', 
                padding: '6px 24px',
                borderRadius: '4px',
                fontSize: '14px',
                height: '36px'
              }} 
              onClick={() => {
                const prompts = createForm.getFieldValue('prompts') || [];
                if (prompts.length > 0) {
                  const equalRate = (1 / prompts.length).toFixed(2);
                  const updatedPrompts = prompts.map(p => ({ ...p, rate: equalRate }));
                  createForm.setFieldsValue({ prompts: updatedPrompts });
                }
              }}>等概率</Button>
          </div>
          <Form.List
            name="prompts"
            initialValue={[{}]}
            rules={[{
              validator: async (_, prompts) => {
                if (!prompts || prompts.length < 1) {
                  return Promise.reject(new Error('至少创建一个Prompt'));
                }
              },
            }]}
          >
            {(fields, { add, remove }, { errors }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <div key={key} style={{ display: 'flex', marginBottom: 8, gap: 16, alignItems: 'flex-start', width: '100%' }}>
                    <Form.Item
                      {...restField}
                      name={[name, 'name']}
                      rules={[{ required: true, message: '请输入Prompt名称' }]}
                      style={{ flex: '0 0 20%', margin: 0 }}
                    >
                      <Input placeholder="Prompt名称" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'content']}
                      rules={[{ required: true, message: '请输入Prompt内容' }]}
                      style={{ flex: '0 0 55%', margin: 0 }}
                    >
                      <Input.TextArea rows={1} placeholder="Prompt内容" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'rate']}
                      rules={[{ required: true, message: '请输入概率' }]}
                      style={{ flex: '0 0 15%', margin: 0 }}
                    >
                      <Input type="number" step="0.1" min="0" max="1" placeholder="概率(0~1)" />
                    </Form.Item>
                    <Button type="link" icon={<DeleteOutlined />} onClick={() => remove(name)} style={{ padding: '4px 8px' }} disabled={fields.length === 1} />
                  </div>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    添加Prompt
                  </Button>
                  <Form.ErrorList errors={errors} />
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>
    </div>
  );
};


export default MmuManagement;
