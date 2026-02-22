import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { BleManager } from 'react-native-ble-plx';
import { atob } from 'react-native-quick-base64';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SERVICE_UUID, CHAR_UUID, CO_THRESHOLD, CH4_THRESHOLD, MAX_POINTS, UPDATE_INTERVAL } from './src/constants';
import StatusBanner from './src/components/StatusBanner';
import GasChart from './src/components/GasChart';
import AlertLog from './src/components/AlertLog';
import ExportButton from './src/components/ExportButton';
import useMockData from './src/mockData';

const manager = new BleManager();

export default function App() {
  const [connected, setConnected]     = useState(false);
  const [coData, setCoData]           = useState([0]);
  const [ch4Data, setCh4Data]         = useState([0]);
  const [coLog, setCoLog]             = useState([]);
  const [ch4Log, setCh4Log]           = useState([]);
  const [lastReading, setLastReading] = useState(null);
  const lastUpdateTime                = useRef(0);
  const [scanning, setScanning]       = useState(false);
  const [mockMode, setMockMode]       = useState(false);
  const reconnect = () => {
    setConnected(false);
    setScanning(true);
    manager.startDeviceScan(null, null, (error, device) => {
      if (error) { console.log(error); setScanning(false); return; }
      if (device?.name === 'ESP32_GasSensor') {
        manager.stopDeviceScan();
        device.connect()
          .then(d => d.discoverAllServicesAndCharacteristics())
          .then(d => {
            setConnected(true);
            setScanning(false);
            d.monitorCharacteristicForService(SERVICE_UUID, CHAR_UUID, (err, char) => {
              if (char?.value) {
                const now = Date.now();
                if (now - lastUpdateTime.current >= UPDATE_INTERVAL) {
                  lastUpdateTime.current = now;
                  const raw = atob(char.value);
                  const parts = raw.split(',');
                  const co  = parseFloat(parts[0].split(':')[1]);
                  const ch4 = parseFloat(parts[1].split(':')[1]);
                  setLastReading(new Date().toLocaleTimeString());
                  setCoData(prev  => [...prev.slice(-MAX_POINTS), co]);
                  setCh4Data(prev => [...prev.slice(-MAX_POINTS), ch4]);
                  const time = new Date().toLocaleTimeString();
                  if (co  >= CO_THRESHOLD)  setCoLog(prev  => [`${time} — CO: ${co}`,   ...prev.slice(0, 9)]);
                  if (ch4 >= CH4_THRESHOLD) setCh4Log(prev => [`${time} — CH4: ${ch4}`, ...prev.slice(0, 9)]);
                }
              }
            });
          });
      }
    });
  };

  useMockData({ mockMode, setCoData, setCh4Data, setLastReading, setCoLog, setCh4Log });

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const saved = await AsyncStorage.getItem('session_history');
        if (saved) {
          const parsed = JSON.parse(saved);
          setCoLog(parsed.coLog || []);
          setCh4Log(parsed.ch4Log || []);
        }
      } catch (e) { console.log('Failed to load history', e); }
    };
    loadHistory();
  }, []);

  useEffect(() => {
    const saveHistory = async () => {
      try {
        await AsyncStorage.setItem('session_history', JSON.stringify({ coLog, ch4Log }));
      } catch (e) { console.log('Failed to save history', e); }
    };
    saveHistory();
  }, [coLog, ch4Log]);

  useEffect(() => {
    manager.startDeviceScan(null, null, (error, device) => {
      if (error) { console.log(error); return; }
      if (device?.name === 'ESP32_GasSensor') {
        manager.stopDeviceScan();
        device.connect()
          .then(d => d.discoverAllServicesAndCharacteristics())
          .then(d => {
            setConnected(true);
            d.monitorCharacteristicForService(SERVICE_UUID, CHAR_UUID, (err, char) => {
              if (char?.value) {
                const now = Date.now();
                if (now - lastUpdateTime.current >= UPDATE_INTERVAL) {
                  lastUpdateTime.current = now;
                  const raw = atob(char.value);
                  const parts = raw.split(',');
                  const co  = parseFloat(parts[0].split(':')[1]);
                  const ch4 = parseFloat(parts[1].split(':')[1]);
                  setLastReading(new Date().toLocaleTimeString());
                  setCoData(prev  => [...prev.slice(-MAX_POINTS), co]);
                  setCh4Data(prev => [...prev.slice(-MAX_POINTS), ch4]);
                  const time = new Date().toLocaleTimeString();
                  if (co  >= CO_THRESHOLD)  setCoLog(prev  => [`${time} — CO: ${co}`,   ...prev.slice(0, 9)]);
                  if (ch4 >= CH4_THRESHOLD) setCh4Log(prev => [`${time} — CH4: ${ch4}`, ...prev.slice(0, 9)]);
                }
              }
            });
          });
      }
    });
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={require('./assets/logo.png')} style={styles.logo} />
      <Text style={styles.title}>Senso</Text>
      {!connected && (
        <TouchableOpacity 
          style={[styles.reconnectButton, { backgroundColor: mockMode ? '#e74c3c' : '#7f8c8d' }]} 
          onPress={() => setMockMode(prev => !prev)}
        >
          <Text style={styles.reconnectText}>{mockMode ? 'Stop Mock Data' : 'Start Mock Data'}</Text>
        </TouchableOpacity>
      )}
      <StatusBanner coData={coData} ch4Data={ch4Data} />
      <ExportButton coLog={coLog} ch4Log={ch4Log} />

      <GasChart
        label="CO Levels"
        data={coData}
        threshold={CO_THRESHOLD}
        lineColor={(opacity = 1) => `rgba(231, 76, 60, ${opacity})`}
      />
      <GasChart
        label="CH4 Levels"
        data={ch4Data}
        threshold={CH4_THRESHOLD}
        lineColor={(opacity = 1) => `rgba(46, 204, 113, ${opacity})`}
      />

      <Text style={styles.timestamp}>
        {lastReading ? `Last reading: ${lastReading}` : 'No readings yet'}
      </Text>

      <AlertLog label="CO"  threshold={CO_THRESHOLD}  log={coLog} />
      <AlertLog label="CH4" threshold={CH4_THRESHOLD} log={ch4Log} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff', paddingTop: 90 },
  title:     { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 },
  logo:      { width: 100, height: 100, resizeMode: 'contain', alignSelf: 'center', marginBottom: 10 },
  status:    { fontSize: 16, color: 'gray', textAlign: 'center', marginBottom: 16 },
  timestamp: { fontSize: 14, color: 'gray', textAlign: 'center', marginBottom: 8, marginTop: 8 },
  reconnectButton: { backgroundColor: '#7f8c8d', padding: 10, borderRadius: 8, alignItems: 'center', marginVertical: 6 },
reconnectText:   { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});