import { useEffect } from 'react';
import { CO_THRESHOLD, CH4_THRESHOLD, MAX_POINTS, UPDATE_INTERVAL } from './constants';

export default function useMockData({ mockMode, setCoData, setCh4Data, setLastReading, setCoLog, setCh4Log }) {
  useEffect(() => {
    if (!mockMode) return;
    const interval = setInterval(() => {
      const co  = Math.floor(Math.random() * 80);
      const ch4 = Math.floor(Math.random() * 140);
      setLastReading(new Date().toLocaleTimeString());
      setCoData(prev  => [...prev.slice(-MAX_POINTS), co]);
      setCh4Data(prev => [...prev.slice(-MAX_POINTS), ch4]);
      const time = new Date().toLocaleTimeString();
      if (co  >= CO_THRESHOLD)  setCoLog(prev  => [`${time} — CO: ${co}`,   ...prev.slice(0, 9)]);
      if (ch4 >= CH4_THRESHOLD) setCh4Log(prev => [`${time} — CH4: ${ch4}`, ...prev.slice(0, 9)]);
    }, UPDATE_INTERVAL);
    return () => clearInterval(interval);
  }, [mockMode]);
}