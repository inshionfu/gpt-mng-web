import React, { useState } from 'react';
import { Row, Col, Card, Statistic, List, Typography, Space, Divider, Modal, Button } from 'antd';
import { DashboardOutlined, FileTextOutlined, AppstoreOutlined, UserOutlined, RiseOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const Home = () => {
  // 系统概览数据
  const overviewData = [
    {
      title: 'MMU总数',
      value: 128,
      icon: <AppstoreOutlined style={{ fontSize: 36, color: '#1890ff' }} />,
      color: '#1890ff'
    },
    {
      title: 'Prompt总数',
      value: 256,
      icon: <FileTextOutlined style={{ fontSize: 36, color: '#52c41a' }} />,
      color: '#52c41a'
    },
    {
      title: '用户数',
      value: 24,
      icon: <UserOutlined style={{ fontSize: 36, color: '#722ed1' }} />,
      color: '#722ed1'
    },
    {
      title: '本月新增',
      value: 15,
      icon: <RiseOutlined style={{ fontSize: 36, color: '#fa8c16' }} />,
      color: '#fa8c16'
    }
  ];

  // 快捷入口数据
  const [helpModalVisible, setHelpModalVisible] = useState(false);

  const quickLinks = [
    { title: 'MMU管理', description: '管理和配置MMU模型', link: '/mmu' },
    { title: 'Prompt管理', description: '创建和编辑Prompt模板', link: '/prompt' },
    { title: '系统设置', description: '配置系统参数和权限', link: '#' },
    { 
      title: '使用帮助', 
      description: '查看系统使用指南', 
      link: '#',
      onClick: () => setHelpModalVisible(true)
    },
  ];

  const helpContent = [
    {
      title: 'MMU管理',
      content: '在MMU管理页面，您可以：\n• 创建新的MMU实验\n• 设置MMU的策略和排序\n• 查看和编辑MMU的详细信息\n• 管理MMU的状态（实验中/已推全/关闭）'
    },
    {
      title: 'Prompt管理',
      content: '在Prompt管理页面，您可以：\n• 查看所有MMU下的Prompt列表\n• 管理Prompt的状态和流量分配\n• 进行Prompt的推全或废弃操作\n• 按MMU名称和状态筛选Prompt'
    },
    {
      title: '使用技巧',
      content: '• 使用顶部的状态筛选快速定位目标MMU/Prompt\n• 通过排序功能优化MMU的展示顺序\n• 及时更新Prompt状态以确保系统正常运行\n• 定期检查数据统计，了解系统运行情况'
    }
  ];

  return (
    <div className="home-container">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* 欢迎区域 */}
        <Card bordered={false} className="welcome-card">
          <Space align="center">
            <DashboardOutlined style={{ fontSize: 32, color: '#6699CC' }} />
            <Title level={1} style={{ margin: 0, fontSize: 42, fontWeight: 500, color: '#1a1a1a', letterSpacing: '1px' }}>欢迎使用Prompt管理系统</Title>
          </Space>
          <Paragraph style={{ fontSize: 16, marginTop: 16 }}>
            本系统提供MMU和Prompt的全生命周期管理，帮助您高效地组织和使用AI资源。
          </Paragraph>
        </Card>

        {/* 系统概览 */}
        <Title level={4}>
          <DashboardOutlined /> 系统概览
        </Title>
        <Row gutter={[16, 16]}>
          {overviewData.map((item, index) => (
            <Col xs={24} sm={12} md={6} key={index}>
              <Card bordered={false} hoverable className="stat-card">
                <div className="stat-icon">{item.icon}</div>
                <Statistic 
                  title={<span style={{ fontSize: 16 }}>{item.title}</span>} 
                  value={item.value} 
                  valueStyle={{ color: item.color, fontSize: 24 }}
                />
              </Card>
            </Col>
          ))}
        </Row>

        {/* 快捷入口 */}
        <Title level={4}>
          <AppstoreOutlined /> 快捷入口
        </Title>
        <List
          grid={{ gutter: 16, xs: 1, sm: 2, md: 4 }}
          dataSource={quickLinks}
          renderItem={(item) => (
            <List.Item>
              <Card 
                title={item.title} 
                bordered={false} 
                hoverable 
                className="quick-link-card"
                extra={
                  item.onClick ? 
                  <a onClick={item.onClick}>查看 →</a> : 
                  <a href={item.link}>进入 →</a>
                }
              >
                {item.description}
              </Card>
            </List.Item>
          )}
        />

        {/* 使用帮助Modal */}
        <Modal
          title="系统使用帮助"
          open={helpModalVisible}
          onCancel={() => setHelpModalVisible(false)}
          footer={[
            <Button key="close" type="primary" onClick={() => setHelpModalVisible(false)}>
              我知道了
            </Button>
          ]}
          width={720}
          className="help-modal"
        >
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {helpContent.map((section, index) => (
              <div key={index}>
                <Title level={4} style={{ marginBottom: 16 }}>{section.title}</Title>
                <Paragraph style={{ whiteSpace: 'pre-line', fontSize: 14, lineHeight: 2 }}>
                  {section.content}
                </Paragraph>
                {index < helpContent.length - 1 && <Divider />}
              </div>
            ))}
          </Space>
        </Modal>
      </Space>
    </div>
  );
};

export default Home;