import mqttStream from '../sample-data/mqttStream.json';

const DEFAULT_BASE_URL = 'http://localhost:8000';
const STREAM_NAMES = ['nofaults', 'single_fault', 'three_faults', 'variable_setpoints'];
const SAMPLE_STREAMS = STREAM_NAMES.reduce(
  (acc, stream) => ({
    ...acc,
    [stream]: mqttStream
  }),
  {}
);
const SAMPLE_INDEX = {};
const MAX_POINTS = 300;

const buildBaseUrl = () => {
  const url = import.meta.env?.VITE_API_URL;
  return url && url.trim().length > 0 ? url : DEFAULT_BASE_URL;
};

const shouldUseSample = () => import.meta.env?.VITE_USE_SAMPLE_DATA === 'true';

const mapRecordToPoint = (record) => ({
  timestamp: record.timestamp,
  temp: record.temperature_C.mean,
  pH: record.pH.mean,
  rpm: record.rpm.mean,
  isAnomaly: Boolean(record.anomaly)
});

const getSamplePayload = (stream) => {
  const records = SAMPLE_STREAMS[stream] ?? mqttStream;
  SAMPLE_INDEX[stream] = ((SAMPLE_INDEX[stream] ?? 0) + 1) % records.length;
  const cursor = SAMPLE_INDEX[stream];
  const historySlice = records.slice(Math.max(0, cursor - MAX_POINTS + 1), cursor + 1);
  const currentRecord = records[cursor];
  const history = historySlice.map(mapRecordToPoint);

  const events = historySlice
    .filter((record) => record.anomaly)
    .map((record) => ({
      timestamp: record.timestamp,
      stream,
      label: record.anomaly.type,
      detail: record.anomaly.message,
      severity: record.anomaly.severity
    }))
    .slice(-10)
    .reverse();

  const anomalyCount = historySlice.filter((record) => record.anomaly).length;
  const confusion = {
    TP: anomalyCount,
    TN: historySlice.length - anomalyCount,
    FP: Math.max(0, Math.floor(anomalyCount / 3)),
    FN: Math.max(0, Math.floor(anomalyCount / 4))
  };

  return {
    stream,
    current: history[history.length - 1],
    history,
    confusion,
    events
  };
};

export async function fetchDashboardState(stream) {
  if (shouldUseSample()) {
    return getSamplePayload(stream);
  }

  const baseUrl = buildBaseUrl();
  const url = new URL('/api/dashboard', baseUrl);
  if (stream) {
    url.searchParams.set('stream', stream);
  }

  const response = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json'
    }
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`API error ${response.status}: ${message || 'Unknown error'}`);
  }

  return response.json();
}
