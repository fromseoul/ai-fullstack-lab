"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Form, Input, Button, Card, Typography, Alert, Space } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: { email: string; password: string }) => {
    setError("");
    setLoading(true);

    try {
      await createUserWithEmailAndPassword(auth, values.email, values.password);
      router.push("/dashboard");
    } catch (err) {
      const message = err instanceof Error ? err.message : "회원가입 실패";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      background: "#141414"
    }}>
      <Card style={{ width: 400, maxWidth: "100%" }}>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <div style={{ textAlign: "center" }}>
            <Title level={3} style={{ margin: 0 }}>회원가입</Title>
            <Text type="secondary">새 계정을 만들어보세요</Text>
          </div>

          {error && (
            <Alert message={error} type="error" showIcon closable onClose={() => setError("")} />
          )}

          <Form layout="vertical" onFinish={handleSubmit} requiredMark={false}>
            <Form.Item
              name="email"
              label="이메일"
              rules={[
                { required: true, message: "이메일을 입력해주세요" },
                { type: "email", message: "올바른 이메일 형식이 아닙니다" },
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="email@example.com" size="large" />
            </Form.Item>

            <Form.Item
              name="password"
              label="비밀번호"
              rules={[
                { required: true, message: "비밀번호를 입력해주세요" },
                { min: 6, message: "비밀번호는 6자 이상이어야 합니다" },
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="비밀번호 (6자 이상)" size="large" />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="비밀번호 확인"
              dependencies={["password"]}
              rules={[
                { required: true, message: "비밀번호를 다시 입력해주세요" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("비밀번호가 일치하지 않습니다"));
                  },
                }),
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="비밀번호 확인" size="large" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block size="large">
                회원가입
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: "center" }}>
            <Text type="secondary">
              이미 계정이 있으신가요? <Link href="/login">로그인</Link>
            </Text>
          </div>
        </Space>
      </Card>
    </div>
  );
}
