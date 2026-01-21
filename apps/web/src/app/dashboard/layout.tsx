"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Layout, Menu, Button, Typography, Avatar, Dropdown } from "antd";
import {
  HomeOutlined,
  SettingOutlined,
  LogoutOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

const { Sider, Content, Header } = Layout;
const { Text } = Typography;

const menuItems = [
  { key: "/dashboard", icon: <HomeOutlined />, label: <Link href="/dashboard">홈</Link> },
  { key: "/dashboard/settings", icon: <SettingOutlined />, label: <Link href="/dashboard/settings">설정</Link> },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const userMenuItems = [
    { key: "logout", icon: <LogoutOutlined />, label: "로그아웃", onClick: handleLogout },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        trigger={null}
        style={{ background: "#141414" }}
      >
        <div style={{ padding: 16, textAlign: "center" }}>
          <Text strong style={{ color: "white", fontSize: collapsed ? 14 : 16 }}>
            {collapsed ? "AFL" : "AI Fullstack Lab"}
          </Text>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[pathname]}
          items={menuItems}
          style={{ background: "transparent" }}
        />
      </Sider>

      <Layout>
        <Header style={{
          padding: "0 24px",
          background: "#1f1f1f",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ color: "white" }}
          />
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Avatar icon={<UserOutlined />} style={{ cursor: "pointer" }} />
          </Dropdown>
        </Header>

        <Content style={{ margin: 24, padding: 24, background: "#1f1f1f", borderRadius: 8 }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
