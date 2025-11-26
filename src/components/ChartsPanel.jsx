import TimeSeriesChart from './TimeSeriesChart.jsx';

export default function ChartsPanel({ history }) {
  const safeHistory = Array.isArray(history) ? history : [];

  return (
    <div className="card charts-panel">
      <div className="chart-grid">
        <TimeSeriesChart data={safeHistory} dataKey="temp" label="Temperature" />
        <TimeSeriesChart data={safeHistory} dataKey="pH" label="pH" />
        <TimeSeriesChart data={safeHistory} dataKey="rpm" label="RPM" />
      </div>
    </div>
  );
}
