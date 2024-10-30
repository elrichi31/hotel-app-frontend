"use client";
import React, { ReactNode, useState, useEffect } from 'react';
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
  TeamOutlined,
  ShopOutlined,
  FileTextOutlined,
  ScheduleOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Button, Menu, Avatar, Layout, Drawer, Space, Dropdown } from 'antd';
import { useRouter } from 'next/navigation';
import { useMediaQuery } from 'react-responsive';

const { Sider, Content, Header } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

// Diccionario de iconos basados en el nombre de la ruta
const icons: Record<string, ReactNode> = {
  '/dashboard': <PieChartOutlined />,
  '/nueva-venta': <ShopOutlined />,
  '/habitaciones': <DesktopOutlined />,
  '/ventas': <ContainerOutlined />,
  '/ventas/facturas': <FileTextOutlined />,
  '/reservas': <ScheduleOutlined />,
  '/usuarios': <TeamOutlined />,
};

const App = ({ children, user, logout }: any) => {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    setSelectedKey(window.location.pathname); // Establece la clave seleccionada en función de la ruta actual
  }, [router]);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const toggleDrawer = () => {
    setDrawerVisible(!drawerVisible);
  };

  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

  // Filtrar las rutas del menú según el rol del usuario
  const filteredNav: MenuItem[] = [
    { key: '/dashboard', icon: icons['/dashboard'], label: (<a href='/dashboard'>Dashboard</a>) },
    { key: '/nueva-venta', icon: icons['/nueva-venta'], label: (<a href='/nueva-venta'>Nueva Venta</a>) },
    { key: '/habitaciones', icon: icons['/habitaciones'], label: (<a href='/habitaciones'>Habitaciones</a>) },
    { key: '/ventas', icon: icons['/ventas'], label: (<a href='/ventas'>Ventas</a>) },
    { key: '/ventas/facturas', icon: icons['/ventas/facturas'], label: (<a href='/ventas/facturas'>Facturas</a>) },
    { key: '/reservas', icon: icons['/reservas'], label: (<a href='/reservas'>Reservas</a>) },
    // Solo mostrar la ruta de "Usuarios" si el usuario tiene el rol "admin"
    ...(user?.role === 'admin' ? [
      { key: '/usuarios', icon: icons['/usuarios'], label: (<a href='/usuarios'>Usuarios</a>) }
    ] : []),
  ];

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
  ];

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
                <Dropdown menu={{ items }} trigger={['click']}>
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
              selectedKeys={[selectedKey]}
              defaultOpenKeys={['sub1']}
              mode="inline"
              items={filteredNav}
              theme="light"
            />
          </Drawer>
        </>
      ) : (
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          theme="light"
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            height: '100vh',
            overflow: 'auto'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', backgroundColor: '#fff' }}>
              <Button type="primary" onClick={toggleCollapsed}>
                {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              </Button>
            </div>
            {user && (
              <div style={{ display: 'flex', alignItems: 'center', padding: '16px', backgroundColor: '#fff', justifyContent: 'center' }}>
                <Avatar size={30} icon={<UserOutlined />} />
                {!collapsed && (
                  <span style={{ marginLeft: 10 }}>{user?.first_name} {user?.last_name}</span>
                )}
              </div>
            )}
            <Menu
              selectedKeys={[selectedKey]}
              defaultOpenKeys={['sub1']}
              mode="inline"
              items={filteredNav}
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
      <Layout style={{ marginLeft: isMobile ? 0 : collapsed ? 80 : 200 }}>
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', minHeight: 280 }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;
