export default function Loading() {
  return (
    <div className="wrap" style={{ padding: "48px 28px" }} aria-busy="true" aria-live="polite">
      <div style={{ height: 14, width: 140, borderRadius: 8, background: "var(--line, #EADFCC)", opacity: 0.8 }} />
      <div style={{ height: 40, width: "min(420px,70%)", borderRadius: 12, background: "var(--line, #EADFCC)", opacity: 0.7, marginTop: 16 }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: 16, marginTop: 28 }}>
        {[0, 1, 2].map((i) => <div key={i} style={{ height: 230, borderRadius: 20, background: "var(--line, #EADFCC)", opacity: 0.5 }} />)}
      </div>
    </div>
  );
}
