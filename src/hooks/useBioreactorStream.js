import { useEffect, useMemo, useRef, useState } from 'react';
import { fetchDashboardState } from '../api/dashboard.js';

const MAX_POINTS = 300;
const INITIAL_CONFUSION = { TP: 0, TN: 0, FP: 0, FN: 0 };

const deriveMetrics = (confusion) => {
  const { TP, TN, FP, FN } = confusion ?? INITIAL_CONFUSION;
  const total = TP + TN + FP + FN;
  const accuracy = total > 0 ? (TP + TN) / total : 0;
  const precisionDen = TP + FP;
  const recallDen = TP + FN;

  return {
    accuracy,
    precision: precisionDen > 0 ? TP / precisionDen : 0,
    recall: recallDen > 0 ? TP / recallDen : 0,
    total
  };
};

export function useBioreactorStream(initialStream = 'nofaults') {
  const [stream, setStream] = useState(initialStream);
  const [connectionStatus, setConnectionStatus] = useState('idle');
  const [current, setCurrent] = useState(null);
  const [history, setHistory] = useState([]);
  const [confusion, setConfusion] = useState(INITIAL_CONFUSION);
  const [events, setEvents] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const pollRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const poll = async () => {
      setConnectionStatus((status) => {
        if (status === 'open') return status;
        return 'connecting';
      });

      try {
        const payload = await fetchDashboardState(stream);
        if (!isMounted) return;

        setCurrent(payload.current ?? null);
        const trimmedHistory = (payload.history ?? []).slice(-MAX_POINTS);
        setHistory(trimmedHistory);
        setConfusion(payload.confusion ?? INITIAL_CONFUSION);
        setEvents(payload.events ?? []);
        setLastUpdated(payload.current?.timestamp ?? Date.now());
        setConnectionStatus('open');
      } catch (error) {
        console.error('Polling error', error);
        if (!isMounted) return;
        setConnectionStatus('error');
      }
    };

    poll();
    pollRef.current = setInterval(poll, 1000);

    return () => {
      isMounted = false;
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }
      setConnectionStatus('closed');
    };
  }, [stream]);

  const metrics = useMemo(() => deriveMetrics(confusion), [confusion]);

  return {
    stream,
    setStream,
    connectionStatus,
    current,
    history,
    confusion,
    metrics,
    events,
    lastUpdated
  };
}
