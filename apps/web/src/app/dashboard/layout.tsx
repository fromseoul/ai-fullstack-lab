export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <nav>
          <a href="/dashboard">홈</a>
          <a href="/dashboard/settings">설정</a>
        </nav>
      </aside>
      <div className="dashboard-content">{children}</div>
    </div>
  );
}
