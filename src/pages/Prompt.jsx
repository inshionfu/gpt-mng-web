import React, { useState, useEffect } from 'react';
import { Table, Collapse, Space, Tag, Typography, message, Select, Modal, Button } from 'antd';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import './Prompt.css';

const { Title } = Typography;
const { Panel } = Collapse;

const PromptManagement = () => {
  const [loading, setLoading] = useState(false);
  const [promptList, setPromptList] = useState([]);
  const [groupedPrompts, setGroupedPrompts] = useState({});
  const [selectedMmu, setSelectedMmu] = useState('all');
  const [statusFilters, setStatusFilters] = useState({});
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [confirmAction, setConfirmAction] = useState({ type: '', record: null });
  const [activeKeys, setActiveKeys] = useState([]);
  const location = useLocation();

  // 获取Prompt列表数据
  const fetchPromptList = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://124.221.174.50:8080/api/v1/gpt/mng/prompt/list/mng');
      if (response.data && response.data.code === '0000') {
        const promptData = response.data.data || [];
        setPromptList(promptData);
        // 按MMU名称分组
        const grouped = promptData.reduce((acc, prompt) => {
          const { mmu_name } = prompt;
          if (!acc[mmu_name]) {
            acc[mmu_name] = [];
          }
          acc[mmu_name].push(prompt);
          return acc;
        }, {});
        setGroupedPrompts(grouped);
        
        // 初始化所有MMU的状态筛选为'all'
        const initialStatusFilters = {};
        Object.keys(grouped).forEach(mmuName => {
          initialStatusFilters[mmuName] = 'all';
        });
        setStatusFilters(initialStatusFilters);
      } else {
        message.error('获取Prompt列表失败：' + (response.data?.info || '未知错误'));
      }
    } catch (error) {
      console.error('获取Prompt列表出错：', error);
      message.error('获取Prompt列表出错，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromptList();
    // 如果有传入selectedMmu参数，则自动选择对应的MMU并展开对应面板
    if (location.state?.selectedMmu) {
      setSelectedMmu(location.state.selectedMmu);
      setActiveKeys([location.state.selectedMmu]);
    }
  }, []);

  // 处理推全操作
  const handleFlowAll = async (record) => {
    try {
      const response = await axios.post(`http://124.221.174.50:8080/api/v1/gpt/mng/prompt/flow/all?mmu_id=${record.mmu_id}&prompt_id=${record.prompt_id}`);
      if (response.data && response.data.code === '0000') {
        message.success('流量推全成功');
        fetchPromptList(); // 刷新列表数据
      } else {
        message.error('流量推全失败：' + (response.data?.info || '未知错误'));
      }
    } catch (error) {
      console.error('流量推全出错：', error);
      message.error('流量推全出错，请稍后重试');
    }
  };

  // 处理废弃操作
  const handleDiscard = async (record) => {
    try {
      const response = await axios.post(`http://124.221.174.50:8080/api/v1/gpt/mng/prompt/flow/abort?prompt_id=${record.prompt_id}`);
      if (response.data && response.data.code === '0000') {
        message.success('Prompt废弃成功');
        fetchPromptList(); // 刷新列表数据
      } else {
        message.error('Prompt废弃失败：' + (response.data?.info || '未知错误'));
      }
    } catch (error) {
      console.error('Prompt废弃出错：', error);
      message.error('Prompt废弃出错，请稍后重试');
    }
  };

  // 显示确认对话框
  const showConfirmModal = (type, record) => {
    setConfirmAction({ type, record });
    setConfirmModalVisible(true);
  };

  // 处理确认操作
  const handleConfirm = async () => {
    const { type, record } = confirmAction;
    if (type === 'flowAll') {
      await handleFlowAll(record);
    } else if (type === 'discard') {
      await handleDiscard(record);
    }
    setConfirmModalVisible(false);
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
      title: 'Prompt名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: '概率',
      dataIndex: 'rate',
      key: 'rate',
      width: 100,
      render: (rate, record, index) => {
        // 根据状态判断显示的概率值
        if (record.status === 0) return '0%';  // 废弃状态
        if (record.status === 1) return '100%';  // 推全状态
        
        // 获取当前记录所属的MMU组
        const mmuGroup = groupedPrompts[record.mmu_name] || [];
        
        // 计算组内实验中prompt的概率值之和
        const experimentalTotal = mmuGroup
          .filter(p => p.status === 2)  // 只计算实验中的prompt
          .reduce((sum, p) => sum + p.rate, 0);
        
        // 如果是实验中状态，计算相对百分比
        if (record.status === 2 && experimentalTotal > 0) {
          return `${((rate / experimentalTotal) * 100).toFixed(1)}%`;
        }
        
        return '0%';
      },
    },
    {
      title: 'Score',
      dataIndex: 'score',
      key: 'score',
      width: 100,
      render: (score) => score !== undefined && score !== null ? score : '-', // Display score or '-' if not available
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        let color = 'blue';
        let text = '未知';
        switch (status) {
          case 0:
            color = 'red';
            text = '废弃';
            break;
          case 1:
            color = 'green';
            text = '推全';
            break;
          case 2:
            color = 'blue';
            text = '实验中';
            break;
          default:
            break;
        }
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space size="small">
          {record.status !== 0 && (
            <>
              {record.status !== 1 && (
                <Button
                  type="primary"
                  size="small"
                  onClick={() => showConfirmModal('flowAll', record)}
                >
                  推全
                </Button>
              )}
              {record.status !== 0 && (
                <Button
                  danger
                  size="small"
                  onClick={() => showConfirmModal('discard', record)}
                >
                  废弃
                </Button>
              )}
            </>
          )}
        </Space>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
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
      dataIndex: 'updateTime',
      key: 'updateTime',
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
  ];

  // 状态选项
  const statusOptions = [
    { value: 'all', label: '全部状态' },
    { value: 2, label: '实验中' },
    { value: 1, label: '已推全' },
    { value: 0, label: '废弃' }
  ];

  // 处理状态筛选变化
  const handleStatusChange = (value, mmuName) => {
    setStatusFilters(prev => ({
      ...prev,
      [mmuName]: value
    }));
  };

  // 过滤显示的MMU
  const filteredGroupedPrompts = selectedMmu === 'all'
    ? groupedPrompts
    : { [selectedMmu]: groupedPrompts[selectedMmu] };

  return (
    <div className="prompt-container">
      <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
        <Select
          style={{ width: 200 }}
          value={selectedMmu}
          onChange={setSelectedMmu}
          options={[
            { value: 'all', label: '全部MMU' },
            ...Object.keys(groupedPrompts).map(mmu => ({
              value: mmu,
              label: mmu
            }))
          ]}
        />
      </Space>
      <Collapse activeKey={activeKeys} onChange={setActiveKeys}>
        {Object.entries(filteredGroupedPrompts).map(([mmuName, prompts]) => (
          <Panel 
            header={
              <Title level={4} style={{ margin: 0 }}>{mmuName}</Title>
            } 
            key={mmuName}
          >
            <Select
              style={{ width: 120, marginBottom: 16 }}
              value={statusFilters[mmuName] || 'all'}
              onChange={(value) => handleStatusChange(value, mmuName)}
              options={statusOptions}
            />
            <Table
              columns={columns}
              dataSource={prompts.filter(prompt => 
                statusFilters[mmuName] === 'all' || 
                prompt.status === statusFilters[mmuName]
              )}
              rowKey="prompt_id"
              loading={loading}
              pagination={false}
            />
          </Panel>
        ))}
      </Collapse>
      <Modal
        title="确认操作"
        open={confirmModalVisible}
        onOk={handleConfirm}
        onCancel={() => setConfirmModalVisible(false)}
        okText="确认"
        cancelText="取消"
      >
        <p>
          {confirmAction.type === 'flowAll' 
            ? '确定要将该Prompt推全吗？' 
            : '确定要废弃该Prompt吗？'}
        </p>
      </Modal>
    </div>
  );
};

export default PromptManagement;