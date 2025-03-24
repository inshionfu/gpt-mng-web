import React, { useState } from 'react';
import { Layout, Menu, Dropdown, Avatar, Space } from 'antd';
import { HomeOutlined, AppstoreOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import HomeComponent from './pages/Home';
import MmuManagementComponent from './pages/Mmu';
import PromptManagementComponent from './pages/Prompt';
import './pages/Home.css';

const { Header, Content, Sider } = Layout;

// 页面组件
const Home = () => <HomeComponent />;
const MmuManagement = () => <MmuManagementComponent />;
const PromptManagement = () => <PromptManagementComponent />;

const App = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  // 菜单项配置
  const items = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: <Link to="/">首页</Link>,
    },
    {
      key: 'prompt',
      icon: <AppstoreOutlined />,
      label: 'Prompt管理',
      children: [
        {
          key: '/mmu',
          label: <Link to="/mmu">mmu管理</Link>,
        },
        {
          key: '/prompt',
          label: <Link to="/prompt">prompt管理</Link>,
        },
      ],
    },
  ];

  // 获取当前选中的菜单项
  const getSelectedKeys = () => {
    const pathname = location.pathname;
    if (pathname === '/') return ['/'];
    return [pathname];
  };

  // 获取展开的子菜单
  const getOpenKeys = () => {
    const pathname = location.pathname;
    if (pathname.startsWith('/mmu') || pathname.startsWith('/prompt')) {
      return ['prompt'];
    }
    return [];
  };

  // 用户下拉菜单项
  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
    },
  ];

  return (
    <Layout className="site-layout">
      <Header style={{ padding: 0, background: '#6699CC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="logo">Prompt管理系统</h1>
        <div className="header-right">
          <Dropdown
            menu={{ items: userMenuItems }}
            placement="bottomRight"
          >
            <a onClick={(e) => e.preventDefault()} style={{ display: 'flex', alignItems: 'center' }}>
              <Space>
                <Avatar style={{ backgroundColor: '#87d068' }} icon={<UserOutlined />} />
                <span style={{ color: '#fff' }}>欢迎您，傅凰燊</span>
              </Space>
            </a>
          </Dropdown>
        </div>
      </Header>
      <Layout>
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
          theme="light"
        >
          <Menu
            theme="light"
            mode="inline"
            items={items}
            selectedKeys={getSelectedKeys()}
            defaultOpenKeys={getOpenKeys()}
          />
        </Sider>
        <Layout style={{ padding: '0 24px 24px' }}>
          <Content className="site-layout-background">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/mmu" element={<MmuManagement />} />
              <Route path="/prompt" element={<PromptManagement />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default App;