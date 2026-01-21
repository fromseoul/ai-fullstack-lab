export default function DashboardPage() {
  return (
    <main className="container">
      <h1>대시보드</h1>
      <div className="dashboard-grid">
        <div className="card">
          <h3>사용자</h3>
          <p className="stat">0</p>
        </div>
        <div className="card">
          <h3>요청</h3>
          <p className="stat">0</p>
        </div>
        <div className="card">
          <h3>상태</h3>
          <p className="stat active">정상</p>
        </div>
      </div>
    </main>
  );
}
