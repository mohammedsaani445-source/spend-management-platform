import Link from "next/link";

export default function Home() {
  return (
    <main className="container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
      <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1.5rem', color: 'var(--primary)' }}>
        Smart Procurement & Spend Management
      </h1>
      <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '600px', marginBottom: '2.5rem' }}>
        Automate your entire procure-to-pay lifecycle. Control spend, streamline approvals, and gain real-time visibility.
      </p>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <Link href="/login" className="btn btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '1.1rem' }}>
          Login to Platform
        </Link>
        <Link href="/demo" className="btn btn-accent" style={{ padding: '0.75rem 2rem', fontSize: '1.1rem' }}>
          Request Demo
        </Link>
      </div>
    </main>
  );
}
