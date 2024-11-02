"use client";
import React from "react";
import { Card, Typography, Tabs, Space, Row, Col } from "antd";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const monthlyData = [
  { month: "Jan", occupancy: 65, adr: 120, revpar: 78, alos: 2.5 },
  { month: "Feb", occupancy: 70, adr: 125, revpar: 87.5, alos: 2.7 },
  { month: "Mar", occupancy: 75, adr: 130, revpar: 97.5, alos: 3.0 },
  { month: "Apr", occupancy: 80, adr: 135, revpar: 108, alos: 3.2 },
  { month: "May", occupancy: 85, adr: 140, revpar: 119, alos: 3.5 },
  { month: "Jun", occupancy: 90, adr: 150, revpar: 135, alos: 3.8 },
  { month: "Jul", occupancy: 95, adr: 160, revpar: 152, alos: 4.0 },
  { month: "Aug", occupancy: 98, adr: 165, revpar: 161.7, alos: 4.2 },
  { month: "Sep", occupancy: 92, adr: 155, revpar: 142.6, alos: 3.9 },
  { month: "Oct", occupancy: 88, adr: 145, revpar: 127.6, alos: 3.6 },
  { month: "Nov", occupancy: 78, adr: 135, revpar: 105.3, alos: 3.1 },
  { month: "Dec", occupancy: 82, adr: 140, revpar: 114.8, alos: 3.3 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const revenueByChannelData = [
  { name: "Direct", value: 400 },
  { name: "OTA", value: 300 },
  { name: "GDS", value: 300 },
  { name: "Corporate", value: 200 },
];

const roomTypeData = [
  { name: "Single", bookings: 400 },
  { name: "Double", bookings: 300 },
  { name: "Suite", bookings: 300 },
  { name: "Family", bookings: 200 },
];

const calculateGrowth = (type: keyof typeof monthlyData[0]) => {
  const currentMonth = monthlyData[monthlyData.length - 1][type];
  const previousMonth = monthlyData[monthlyData.length - 2][type];
  return (((Number(currentMonth) - Number(previousMonth)) / Number(previousMonth)) * 100).toFixed(2);
};

const currentMonthData = monthlyData[monthlyData.length - 1];

export default function VentasDashboard() {
  return (
    <div className="container mx-auto p-4">
      <Title level={1} className="text-3xl font-bold mb-6">
        Hotel Performance Dashboard
      </Title>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <div className="flex flex-col lg:flex-row">

          <div className="flex flex-col mr-0 lg:mr-3 mb-[10px]">
            <div className="mb-[10px]">
              <Card className="h-[190px]">
                <Tabs defaultActiveKey="occupancy">
                  <TabPane tab="Occupancy" key="occupancy">
                    <Text className="text-4xl font-bold" style={{ color: "#0088FE" }}>
                      {currentMonthData.occupancy}%
                    </Text>
                    <p className="text-sm mt-1">
                      {calculateGrowth("occupancy")}% vs last month
                    </p>
                  </TabPane>
                  <TabPane tab="ADR" key="adr">
                    <Text className="text-4xl font-bold" style={{ color: "#00C49F" }}>
                      ${currentMonthData.adr}
                    </Text>
                    <p className="text-sm mt-1">{calculateGrowth("adr")}% vs last month</p>
                  </TabPane>
                  <TabPane tab="RevPAR" key="revpar">
                    <Text className="text-4xl font-bold" style={{ color: "#FFBB28" }}>
                      ${currentMonthData.revpar}
                    </Text>
                    <p className="text-sm mt-1">
                      {calculateGrowth("revpar")}% vs last month
                    </p>
                  </TabPane>
                </Tabs>
              </Card>
            </div>

            <div>
              <Card title="Revenue by Channel">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={revenueByChannelData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {revenueByChannelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </div>
          </div>

          <div className="w-full">
            <Card title="Average Length of Stay">
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="alos" stroke="#8884d8" name="ALOS (days)" />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </div>

        <Row gutter={[16, 16]}>

          <Col xs={24} md={12}>
            <Card title="Occupancy Rate Trend" extra={<Text>Monthly occupancy rate for the year</Text>}>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="occupancy"
                    stroke="#8884d8"
                    fill="#8884d8"
                    name="Occupancy %"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card title="ADR and RevPAR Comparison" extra={<Text>Monthly ADR and RevPAR trends</Text>}>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="adr" stroke="#82ca9d" name="ADR ($)" />
                  <Line type="monotone" dataKey="revpar" stroke="#ffc658" name="RevPAR ($)" />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card title="Room Type Bookings" extra={<Text>Distribution of bookings by room type</Text>}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={roomTypeData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" />
                  <Tooltip />
                  <Bar dataKey="bookings" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>
      </Space>
    </div>
  );
}
