"use client";
import React, { ReactNode, useState } from 'react';
import {
  AppstoreOutlined,
  ContainerOutlined,
  DesktopOutlined,
  MailOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PieChartOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Button, Menu, Avatar, Layout, Drawer, Space, Dropdown } from 'antd';
import { useAuth } from '../hooks/useAuth';
import { useMediaQuery } from 'react-responsive';

const { Sider, Content, Header } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

const nav: MenuItem[] = [
  { key: '1', icon: <PieChartOutlined />, label: 'Option 1' },
  { key: '2', icon: <DesktopOutlined />, label: 'Option 2' },
  { key: '3', icon: <ContainerOutlined />, label: 'Option 3' },
  {
    key: 'sub1',
    label: 'Navigation One',
    icon: <MailOutlined />,
    children: [
      { key: '5', label: 'Option 5' },
      { key: '6', label: 'Option 6' },
      { key: '7', label: 'Option 7' },
      { key: '8', label: 'Option 8' },
    ],
  },
  {
    key: 'sub2',
    label: 'Navigation Two',
    icon: <AppstoreOutlined />,
    children: [
      { key: '9', label: 'Option 9' },
      { key: '10', label: 'Option 10' },
      {
        key: 'sub3',
        label: 'Submenu',
        children: [
          { key: '11', label: 'Option 11' },
          { key: '12', label: 'Option 12' },
        ],
      },
    ],
  },
];

const App = ({children, user, logout}: any) => {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const toggleDrawer = () => {
    setDrawerVisible(!drawerVisible);
  };

  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

  const items: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: <>
        <span>{user?.first_name} {user?.last_name}</span>
      </>,
      onClick: () => console.log('Profile'),
    },
    { key: 'logout', icon: <LogoutOutlined />, label: 'Logout', onClick: logout },
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {isMobile ? (
        <>
          <Header style={{ background: '#fff', padding: 0 }}>
            <Button type="primary" onClick={toggleDrawer} style={{ marginLeft: 16 }}>
              <MenuUnfoldOutlined />
            </Button>
            {user && (
              <Space style={{ float: 'right', marginRight: 16 }}>
                <Dropdown menu={{items}} trigger={['click']}>
                  <Avatar size={30} icon={<UserOutlined />} style={{ cursor: 'pointer' }} />
                </Dropdown>
              </Space>
            )}
          </Header>
          <Drawer
            title="Menu"
            placement="left"
            onClose={toggleDrawer}
            open={drawerVisible}
            style={{ padding: 0 }}
          >
            <Menu
              defaultSelectedKeys={['1']}
              defaultOpenKeys={['sub1']}
              mode="inline"
              items={nav}
              theme="light"
            />
          </Drawer>
        </>
      ) : (
        <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed} theme="light">
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', backgroundColor: '#fff' }}>
              <Button type="primary" onClick={toggleCollapsed}>
                {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              </Button>
            </div>
            
              <div style={{ display: 'flex', alignItems: 'center', padding: '16px', backgroundColor: '#fff', justifyContent: 'center' }}>
                <Avatar size={30} icon={<UserOutlined />} />
                {!collapsed && (
                  <span style={{ marginLeft: 10 }}>{user?.first_name} {user?.last_name}</span>
                )}
              </div>
            <Menu
              defaultSelectedKeys={['1']}
              defaultOpenKeys={['sub1']}
              mode="inline"
              items={nav}
              theme="light"
              style={{ flex: 1 }}
            />
            {!collapsed && (
              <div style={{ padding: '16px', textAlign: 'center', backgroundColor: '#fff', marginTop: 'auto' }}>
                <Button type="primary" danger onClick={logout} icon={<LogoutOutlined />}>
                  Logout
                </Button>
              </div>
            )}
          </div>
        </Sider>
      )}
      <Layout>
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', minHeight: 280 }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;
