export function KpiCard({ label, value, sub }: { label: string; value: string | number; sub: string }) {
  return (
    <section className="card">
      <span className="muted">{label}</span>
      <strong className="metric">{value}</strong>
      <span className="muted">{sub}</span>
    </section>
  );
}
