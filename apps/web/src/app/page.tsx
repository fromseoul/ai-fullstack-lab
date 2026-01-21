"use client";

import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  DashboardOutlined,
  HomeOutlined,
  LoginOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { Card, Col, Layout, Menu, Row, Space, Tag, Typography } from "antd";
import Link from "next/link";
import { usePathname } from "next/navigation";

const { Header, Content, Footer } = Layout;
const { Title, Paragraph } = Typography;

const menuItems = [
  { key: "/", icon: <HomeOutlined />, label: <Link href="/">홈</Link> },
  { key: "/login", icon: <LoginOutlined />, label: <Link href="/login">로그인</Link> },
  { key: "/signup", icon: <UserAddOutlined />, label: <Link href="/signup">회원가입</Link> },
  { key: "/dashboard", icon: <DashboardOutlined />, label: <Link href="/dashboard">대시보드</Link> },
];

const statusItems = [
  { name: "Frontend: Next.js", active: true },
  { name: "Backend: Express", active: true },
  { name: "Auth: Firebase", active: true },
  { name: "DB: Supabase", active: true },
];

export default function Home() {
  const pathname = usePathname();

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header style={{ display: "flex", alignItems: "center", padding: "0 24px" }}>
        <div style={{ color: "white", fontWeight: "bold", fontSize: 18, marginRight: 24 }}>
          AI Fullstack Lab
        </div>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[pathname]}
          items={menuItems}
          style={{ flex: 1, minWidth: 0 }}
        />
      </Header>

      <Content style={{ padding: "48px 24px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <Space orientation="vertical" size="large" style={{ width: "100%" }}>
            <div style={{ textAlign: "center" }}>
              <Title level={1}>AI Fullstack Lab</Title>
              <Paragraph type="secondary" style={{ fontSize: 16 }}>
                Next.js + Express + Nginx Monorepo
              </Paragraph>
            </div>

            <Card title="Tech Stack" style={{ marginTop: 24 }}>
              <Row gutter={[16, 16]}>
                {statusItems.map((item) => (
                  <Col xs={24} sm={12} key={item.name}>
                    <Card size="small" style={{ background: "#1f1f1f", color: 'white' }}>
                      <Space>
                        {item.active ? (
                          <CheckCircleOutlined style={{ color: "#52c41a" }} />
                        ) : (
                          <ClockCircleOutlined style={{ color: "#faad14" }} />
                        )}
                        <span>{item.name}</span>
                        <Tag color={item.active ? "success" : "warning"}>
                          {item.active ? "연동됨" : "준비중"}
                        </Tag>
                      </Space>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>

            <Card title="Quick Links">
              <Space wrap>
                <Link href="/signup">
                  <Tag icon={<UserAddOutlined />} color="blue" style={{ cursor: "pointer", padding: "4px 12px" }}>
                    회원가입
                  </Tag>
                </Link>
                <Link href="/login">
                  <Tag icon={<LoginOutlined />} color="green" style={{ cursor: "pointer", padding: "4px 12px" }}>
                    로그인
                  </Tag>
                </Link>
                <Link href="/dashboard">
                  <Tag icon={<DashboardOutlined />} color="purple" style={{ cursor: "pointer", padding: "4px 12px" }}>
                    대시보드
                  </Tag>
                </Link>
              </Space>
            </Card>
          </Space>
        </div>
      </Content>

      <Footer style={{ textAlign: "center" }}>
        AI Fullstack Lab ©{new Date().getFullYear()}
      </Footer>
    </Layout>
  );
}
