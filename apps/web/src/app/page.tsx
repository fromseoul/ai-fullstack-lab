export default function Home() {
  return (
    <main className="container">
      <h1>AI Fullstack Lab</h1>
      <p>Next.js + Express + Nginx Monorepo</p>
      <div className="status">
        <div className="status-item">
          <span className="dot active"></span>
          <span>Frontend: Next.js</span>
        </div>
        <div className="status-item">
          <span className="dot active"></span>
          <span>Backend: Express</span>
        </div>
        <div className="status-item">
          <span className="dot pending"></span>
          <span>Auth: Firebase (준비중)</span>
        </div>
        <div className="status-item">
          <span className="dot pending"></span>
          <span>DB: Supabase (준비중)</span>
        </div>
      </div>
    </main>
  );
}
