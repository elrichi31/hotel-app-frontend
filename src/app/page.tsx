"use client";
import React from "react";
import { Layout, Button, Menu, Row, Col, Card, Typography, Divider } from "antd";
import {
  CalendarOutlined,
  BarChartOutlined,
  UserOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const { Header, Content, Footer } = Layout;
const { Title, Paragraph } = Typography;

const LandingPage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleLogin = () => router.push("/login");
  const handleRegister = () => router.push("/register");
  const handleDashboard = () => router.push("/dashboard");
  const handleLogout = () => signOut();

  return (
    <Layout className="min-h-screen">
      {/* Header */}
      <Header style={{ backgroundColor: "white", borderBottom: "none" }} className="px-4 lg:px-6">
        <div className="flex items-center justify-between">
          <Link href="#" className="flex items-center">
            <Title level={3} className="ml-2 mb-0">
              HotelApp
            </Title>
          </Link>
          <Menu mode="horizontal" selectable={false} className="border-none flex gap-6">
            <Menu.Item key="features">
              <Link href="#features">Features</Link>
            </Menu.Item>
            <Menu.Item key="pricing">
              <Link href="#pricing">Pricing</Link>
            </Menu.Item>
          </Menu>
          <div className="flex items-center gap-4">
            {status === "authenticated" ? (
              <>
                <Button type="default" onClick={handleDashboard}>
                  Dashboard
                </Button>
                <Button type="primary" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button type="default" onClick={handleLogin}>
                  Login
                </Button>
              </>
            )}
          </div>
        </div>
      </Header>

      {/* Main Content */}
      <Content>
        {/* Hero Section */}
        <div className="py-48 md:py-[350px] text-center">
          <div className="container mx-auto px-4">
            <Title level={1} className="mb-4">
              Revolutionize Your Hotel Management
            </Title>
            <Paragraph className="text-lg text-gray-600">
              Streamline operations, boost guest satisfaction, and increase revenue with HotelApp - the all-in-one solution for modern hoteliers.
            </Paragraph>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="py-12 md:py-24 bg-white">
          <div className="container mx-auto px-4">
            <Title level={2} className="text-center mb-12">
              Key Features
            </Title>
            <Row gutter={[24, 24]}>
              <Col xs={24} md={8}>
                <Card hoverable>
                  <CalendarOutlined className="text-primary text-4xl mb-4" />
                  <Title level={3}>Smart Booking Management</Title>
                  <Paragraph>
                    Effortlessly manage reservations, room assignments, and check-ins/check-outs with our intuitive interface.
                  </Paragraph>
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card hoverable>
                  <UserOutlined className="text-primary text-4xl mb-4" />
                  <Title level={3}>Guest Relationship Management</Title>
                  <Paragraph>
                    Build lasting relationships with guests through personalized experiences and communication tools.
                  </Paragraph>
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card hoverable>
                  <BarChartOutlined className="text-primary text-4xl mb-4" />
                  <Title level={3}>Real-time Analytics</Title>
                  <Paragraph>
                    Make data-driven decisions with comprehensive reports on occupancy, revenue, and guest satisfaction.
                  </Paragraph>
                </Card>
              </Col>
            </Row>
          </div>
        </div>

        {/* Pricing Section */}
        <div id="pricing" className="py-12 md:py-24">
          <div className="container mx-auto px-4">
            <Title level={2} className="text-center mb-12">
              Simple, Transparent Pricing
            </Title>
            <Row gutter={[24, 24]}>
              <Col xs={24} md={8}>
                <Card>
                  <Title level={4}>Starter</Title>
                  <Paragraph>For small hotels and B&Bs</Paragraph>
                  <Divider />
                  <Title level={2}>$49/mo</Title>
                  <ul>
                    <li>
                      <CheckCircleOutlined className="text-primary mr-2" />
                      Up to 20 rooms
                    </li>
                    <li>
                      <CheckCircleOutlined className="text-primary mr-2" />
                      Basic reporting
                    </li>
                    <li>
                      <CheckCircleOutlined className="text-primary mr-2" />
                      Email support
                    </li>
                  </ul>
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card>
                  <Title level={4}>Professional</Title>
                  <Paragraph>For medium-sized hotels</Paragraph>
                  <Divider />
                  <Title level={2}>$99/mo</Title>
                  <ul>
                    <li>
                      <CheckCircleOutlined className="text-primary mr-2" />
                      Up to 100 rooms
                    </li>
                    <li>
                      <CheckCircleOutlined className="text-primary mr-2" />
                      Advanced analytics
                    </li>
                    <li>
                      <CheckCircleOutlined className="text-primary mr-2" />
                      24/7 phone support
                    </li>
                  </ul>
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card>
                  <Title level={4}>Enterprise</Title>
                  <Paragraph>For large hotel chains</Paragraph>
                  <Divider />
                  <Title level={2}>Custom</Title>
                  <ul>
                    <li>
                      <CheckCircleOutlined className="text-primary mr-2" />
                      Unlimited rooms
                    </li>
                    <li>
                      <CheckCircleOutlined className="text-primary mr-2" />
                      Custom integrations
                    </li>
                    <li>
                      <CheckCircleOutlined className="text-primary mr-2" />
                      Dedicated account manager
                    </li>
                  </ul>
                </Card>
              </Col>
            </Row>
          </div>
        </div>
      </Content>

      {/* Footer */}
      <Footer className="py-6 text-center">
        <Paragraph type="secondary">© 2024 HotelApp. All rights reserved.</Paragraph>
      </Footer>
    </Layout>
  );
};

export default LandingPage;
