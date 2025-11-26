const formatPercent = (value) => {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return `${(value * 100).toFixed(1)}%`;
};

export default function ConfusionMatrix({ confusion, metrics }) {
  const { TN = 0, FP = 0, FN = 0, TP = 0 } = confusion ?? {};

  return (
    <div className="card confusion-matrix">
      <div className="card-header">
        <h3>Confusion Matrix</h3>
      </div>
      <div className="matrix-grid">
        <div className="matrix-label" />
        <div className="matrix-label">Pred Normal</div>
        <div className="matrix-label">Pred Anomaly</div>

        <div className="matrix-label rotate">Actual Normal</div>
        <div className="matrix-cell">TN<br />{TN}</div>
        <div className="matrix-cell">FP<br />{FP}</div>

        <div className="matrix-label rotate">Actual Anomaly</div>
        <div className="matrix-cell">FN<br />{FN}</div>
        <div className="matrix-cell">TP<br />{TP}</div>
      </div>
      <div className="matrix-metrics">
        <span>Accuracy: {formatPercent(metrics?.accuracy)}</span>
        <span>Precision: {formatPercent(metrics?.precision)}</span>
        <span>Recall: {formatPercent(metrics?.recall)}</span>
        <span>Total: {metrics?.total ?? 0}</span>
      </div>
    </div>
  );
}
