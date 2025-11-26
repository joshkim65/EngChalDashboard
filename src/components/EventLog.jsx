const formatTime = (timestamp) => {
  if (!timestamp) return '—';
  return new Date(timestamp).toLocaleTimeString([], { hour12: false });
};

export default function EventLog({ events }) {
  const items = Array.isArray(events) ? events : [];

  return (
    <div className="card event-log">
      <div className="card-header">
        <h3>Event Log</h3>
      </div>
      <div className="event-list">
        {items.length === 0 && <div className="empty-state">No events yet.</div>}
        {items.map((event) => (
          <div key={`${event.timestamp}-${event.label ?? 'event'}`} className="event-item">
            <div className="event-meta">
              <span className="event-label">{event.label ?? 'anomaly'}</span>
              {event.severity ? <span className={`event-severity ${event.severity}`}>{event.severity}</span> : null}
              <span className="event-stream">{event.stream}</span>
            </div>
            <div className="event-detail">{event.detail ?? '—'}</div>
            <div className="event-timestamp">{formatTime(event.timestamp)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
