const STREAM_OPTIONS = ['nofaults', 'single_fault', 'three_faults', 'variable_setpoints'];

export default function StreamSelector({ value, onChange }) {
  return (
    <div className="card stream-selector">
      <div className="card-header">
        <h3>Streams</h3>
      </div>
      <div className="pill-group">
        {STREAM_OPTIONS.map((option) => {
          const isActive = value === option;
          return (
            <button
              key={option}
              type="button"
              className={isActive ? 'pill active' : 'pill'}
              onClick={() => onChange(option)}
            >
              {option.replace('_', ' ')}
            </button>
          );
        })}
      </div>
    </div>
  );
}
