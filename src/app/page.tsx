"use client";
import React, { useState } from "react";
import { Layout, Button, Menu, Row, Col, Card, Typography, Divider, Drawer } from "antd";
import {
  CalendarOutlined,
  BarChartOutlined,
  UserOutlined,
  CheckCircleOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const { Header, Content, Footer } = Layout;
const { Title, Paragraph } = Typography;

const PaginaPrincipal: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [drawerVisible, setDrawerVisible] = useState(false);

  const handleLogin = () => router.push("/login");
  const handleRegister = () => router.push("/register");
  const handleDashboard = () => router.push("/dashboard");
  const handleLogout = () => signOut();

  const toggleDrawer = () => setDrawerVisible(!drawerVisible);

  return (
    <Layout className="min-h-screen">
      {/* Encabezado */}
      <Header style={{ backgroundColor: "white", borderBottom: "none" }} className="px-4 lg:px-6">
        <div className="flex items-center justify-between">
          <Link href="#" className="flex items-center">
            <Title level={3} className="ml-2 mb-0">
              HotelApp
            </Title>
          </Link>
          <div className="hidden md:flex gap-6">
            <Menu mode="horizontal" selectable={false} className="border-none flex gap-6">
              <Menu.Item key="features">
                <Link href="#features">Características</Link>
              </Menu.Item>
              <Menu.Item key="pricing">
                <Link href="#pricing">Precios</Link>
              </Menu.Item>
            </Menu>
            <div className="flex items-center gap-4">
              {status === "authenticated" ? (
                <>
                  <Button type="default" onClick={handleDashboard}>
                    Dashboard
                  </Button>
                  <Button type="primary" onClick={handleLogout}>
                    Cerrar Sesión
                  </Button>
                </>
              ) : (
                <Button type="default" onClick={handleLogin}>
                  Iniciar Sesión
                </Button>
              )}
            </div>
          </div>
          {/* Menú hamburguesa para dispositivos móviles */}
          <div className="md:hidden">
            <Button type="text" icon={<MenuOutlined />} onClick={toggleDrawer} />
          </div>
        </div>
      </Header>

      {/* Menú lateral para dispositivos móviles */}
      <Drawer
        title="Menú"
        placement="right"
        onClose={toggleDrawer}
        visible={drawerVisible}
        className="md:hidden"
      >
        <Menu mode="vertical" selectable={false}>
          <Menu.Item key="features">
            <Link href="#features">Características</Link>
          </Menu.Item>
          <Menu.Item key="pricing">
            <Link href="#pricing">Precios</Link>
          </Menu.Item>
        </Menu>
        <Divider />
        <div className="flex flex-col gap-4">
          {status === "authenticated" ? (
            <>
              <Button block type="default" onClick={handleDashboard}>
                Dashboard
              </Button>
              <Button block type="primary" onClick={handleLogout}>
                Cerrar Sesión
              </Button>
            </>
          ) : (
            <Button block type="primary" onClick={handleLogin}>
              Iniciar Sesión
            </Button>
          )}
        </div>
      </Drawer>

      {/* Contenido Principal */}
      <Content className="bg-gray-50">
        {/* Sección Hero */}
        <div className="py-48 md:py-[350px] text-center">
          <div className="container mx-auto px-4">
            <Title level={1} className="mb-4">
              Revoluciona la Gestión de tu Hotel
            </Title>
            <Paragraph className="text-lg text-gray-600">
              Optimiza las operaciones, mejora la satisfacción de los huéspedes y aumenta los ingresos con HotelApp, la solución todo en uno para hoteleros modernos.
            </Paragraph>
          </div>
        </div>

        {/* Sección de Características */}
        <div id="features" className="py-12 md:py-24 bg-white">
          <div className="container mx-auto px-4">
            <Title level={2} className="text-center mb-12">
              Características Principales
            </Title>
            <Row gutter={[24, 24]}>
              <Col xs={24} md={8}>
                <Card hoverable>
                  <CalendarOutlined className="text-primary text-4xl mb-4" />
                  <Title level={3}>Gestión Inteligente de Reservas</Title>
                  <Paragraph>
                    Administra fácilmente reservas, asignaciones de habitaciones y check-ins/check-outs con nuestra interfaz intuitiva.
                  </Paragraph>
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card hoverable>
                  <UserOutlined className="text-primary text-4xl mb-4" />
                  <Title level={3}>Gestión de Relaciones con Huéspedes</Title>
                  <Paragraph>
                    Construye relaciones duraderas con los huéspedes mediante experiencias personalizadas y herramientas de comunicación.
                  </Paragraph>
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card hoverable>
                  <BarChartOutlined className="text-primary text-4xl mb-4" />
                  <Title level={3}>Analíticas en Tiempo Real</Title>
                  <Paragraph>
                    Toma decisiones basadas en datos con informes completos sobre ocupación, ingresos y satisfacción de huéspedes.
                  </Paragraph>
                </Card>
              </Col>
            </Row>
          </div>
        </div>

        {/* Sección de Precios */}
        <div id="pricing" className="py-12 md:py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <Title level={2} className="text-center mb-12">
              Precios Simples y Transparentes
            </Title>
            <Row gutter={[24, 24]}>
              <Col xs={24} md={8}>
                <Card>
                  <Title level={4}>Básico</Title>
                  <Paragraph>Para pequeños hoteles y B&Bs</Paragraph>
                  <Divider />
                  <Title level={2}>$49/mes</Title>
                  <ul>
                    <li>
                      <CheckCircleOutlined className="text-primary mr-2" />
                      Hasta 20 habitaciones
                    </li>
                    <li>
                      <CheckCircleOutlined className="text-primary mr-2" />
                      Reportes básicos
                    </li>
                    <li>
                      <CheckCircleOutlined className="text-primary mr-2" />
                      Soporte por correo
                    </li>
                  </ul>
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card>
                  <Title level={4}>Profesional</Title>
                  <Paragraph>Para hoteles medianos</Paragraph>
                  <Divider />
                  <Title level={2}>$99/mes</Title>
                  <ul>
                    <li>
                      <CheckCircleOutlined className="text-primary mr-2" />
                      Hasta 100 habitaciones
                    </li>
                    <li>
                      <CheckCircleOutlined className="text-primary mr-2" />
                      Analíticas avanzadas
                    </li>
                    <li>
                      <CheckCircleOutlined className="text-primary mr-2" />
                      Soporte telefónico 24/7
                    </li>
                  </ul>
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card>
                  <Title level={4}>Empresarial</Title>
                  <Paragraph>Para grandes cadenas de hoteles</Paragraph>
                  <Divider />
                  <Title level={2}>Personalizado</Title>
                  <ul>
                    <li>
                      <CheckCircleOutlined className="text-primary mr-2" />
                      Habitaciones ilimitadas
                    </li>
                    <li>
                      <CheckCircleOutlined className="text-primary mr-2" />
                      Integraciones personalizadas
                    </li>
                    <li>
                      <CheckCircleOutlined className="text-primary mr-2" />
                      Gestor de cuentas dedicado
                    </li>
                  </ul>
                </Card>
              </Col>
            </Row>
          </div>
        </div>
      </Content>

      {/* Pie de página */}
      <Footer className="bg-white py-6 text-center">
        <Paragraph type="secondary">© 2024 HotelApp. Todos los derechos reservados.</Paragraph>
      </Footer>
    </Layout>
  );
};

export default PaginaPrincipal;
