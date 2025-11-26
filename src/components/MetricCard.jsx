export default function MetricCard({ label, value, unit, sublabel }) {
  return (
    <div className="metric-card">
      <div className="metric-label">{label}</div>
      <div className="metric-value">
        {value}
        {unit ? <span className="metric-unit">{unit}</span> : null}
      </div>
      {sublabel ? <div className="metric-sublabel">{sublabel}</div> : null}
    </div>
  );
}
