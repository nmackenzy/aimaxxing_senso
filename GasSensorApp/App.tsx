import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Image, Share, TouchableOpacity} from 'react-native';
import { BleManager } from 'react-native-ble-plx';
import { atob } from 'react-native-quick-base64';
import { LineChart } from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SERVICE_UUID, CHAR_UUID, CO_THRESHOLD, CH4_THRESHOLD, MAX_POINTS, UPDATE_INTERVAL } from './src/constants';
import { getStatusColor } from './src/utils';

const manager = new BleManager();

export default function App() {
  const [connected, setConnected]     = useState(false);
  const [coData, setCoData]           = useState([0]);
  const [ch4Data, setCh4Data]         = useState([0]);
  const [coLog, setCoLog]             = useState([]);
  const [ch4Log, setCh4Log]           = useState([]);
  const [lastReading, setLastReading] = useState(null);
  const lastUpdateTime                = useRef(0);
  const exportLog = async () => {
    try {
      const coText  = coLog.length  > 0 ? coLog.join('\n')  : 'No CO alerts';
      const ch4Text = ch4Log.length > 0 ? ch4Log.join('\n') : 'No CH4 alerts';
      const message = `SENSO GAS MONITOR LOG\nExported: ${new Date().toLocaleString()}\n\n--- CO ALERTS ---\n${coText}\n\n--- CH4 ALERTS ---\n${ch4Text}`;
      await Share.share({ message });
    } catch (e) {
      console.log('Export failed', e);
    }
  };
  
  const width = Dimensions.get('window').width - 32;

  // load saved history when app opens
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const saved = await AsyncStorage.getItem('session_history');
        if (saved) {
          const parsed = JSON.parse(saved);
          setCoLog(parsed.coLog || []);
          setCh4Log(parsed.ch4Log || []);
        }
      } catch (e) {
        console.log('Failed to load history', e);
      }
    };
    loadHistory();
  }, []);

  // save history whenever logs update
  useEffect(() => {
    const saveHistory = async () => {
      try {
        await AsyncStorage.setItem('session_history', JSON.stringify({ coLog, ch4Log }));
      } catch (e) {
        console.log('Failed to save history', e);
      }
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
                  if (co >= CO_THRESHOLD) {
                    setCoLog(prev => [`${time} — CO: ${co}`, ...prev.slice(0, 9)]);
                  }
                  if (ch4 >= CH4_THRESHOLD) {
                    setCh4Log(prev => [`${time} — CH4: ${ch4}`, ...prev.slice(0, 9)]);
                  }
                }
              }
            });
          });
      }
    });
  }, []);

  const chartConfig = {
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    color: (opacity = 1) => `rgba(46, 204, 113, ${opacity})`,
    strokeWidth: 2,
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image
        source={require('./assets/logo.png')} 
        style={styles.logo} 
      />
      <Text style={styles.title}>Senso</Text>
      <Text style={styles.status}>{connected ? 'Connected ✓' : 'Searching...'}</Text>
      
      <View style={[styles.statusBanner, { backgroundColor: getStatusColor(coData[coData.length - 1], CO_THRESHOLD) }]}>
        <Text style={styles.statusText}>CO: {coData[coData.length - 1]} ppm</Text>
        <Text style={styles.statusText}>CH4: {ch4Data[ch4Data.length - 1]} ppm</Text>
      </View>

      <TouchableOpacity style={styles.exportButton} onPress={exportLog}>
        <Text style={styles.exportText}>Export Log</Text>
      </TouchableOpacity>

      <Text style={styles.label}>CO Levels</Text>
      <LineChart
        data={{ labels: [], datasets: [
          { data: coData, color: (opacity = 1) => `rgba(231, 76, 60, ${opacity})` },
          { data: Array(coData.length).fill(CO_THRESHOLD), 
            color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`,
            strokeWidth: 1,
            withDots: false
          }
          ] 
        }}
        width={width} height={180}
        chartConfig={{ ...chartConfig, color: (opacity = 1) => `rgba(231, 76, 60, ${opacity})` }}
        bezier style={styles.chart}
      />

      <Text style={styles.label}>CH4 Levels</Text>
      <LineChart
        data={{ labels: [], datasets: [
          { data: ch4Data, color: (opacity = 1) => `rgba(46, 204, 113, ${opacity})` },
          { data: Array(ch4Data.length).fill(CH4_THRESHOLD),
            color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`,
            strokeWidth: 1,
            withDots: false
          }
          ]
        }}
        width={width} height={180}
        chartConfig={chartConfig}
        bezier style={styles.chart}
      />

      <Text style={styles.timestamp}>
        {lastReading ? `Last reading: ${lastReading}` : 'No readings yet'}
      </Text>

      <Text style={styles.label}>CO Threshold Alerts (≥{CO_THRESHOLD})</Text>
      {coLog.length === 0 
        ? <Text style={styles.noAlert}>No alerts</Text>
        : coLog.map((entry, i) => <Text key={i} style={styles.logEntry}>{entry}</Text>)
      }

      <Text style={styles.label}>CH4 Threshold Alerts (≥{CH4_THRESHOLD})</Text>
      {ch4Log.length === 0
        ? <Text style={styles.noAlert}>No alerts</Text>
        : ch4Log.map((entry, i) => <Text key={i} style={styles.logEntry}>{entry}</Text>)
      }
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:  { padding: 16, backgroundColor: '#fff', paddingTop: 90 },
  title:      { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 },
  logo:       { width: 100, height: 100, resizeMode: 'contain', alignSelf: 'center', marginBottom: 10 },
  status:     { fontSize: 16, color: 'gray', textAlign: 'center', marginBottom: 16 },
  label:      { fontSize: 18, fontWeight: '600', marginTop: 16, marginBottom: 4 },
  chart:      { borderRadius: 8 },
  logEntry:   { fontSize: 14, color: '#e74c3c', paddingVertical: 2 },
  noAlert:    { fontSize: 14, color: 'gray' },
  timestamp: { fontSize: 14, color: 'gray', textAlign: 'center', marginBottom: 8 },
  statusBanner: { padding: 12, borderRadius: 8, marginVertical: 6, alignItems: 'center' },
  statusText:   { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  exportButton: { backgroundColor: '#3498db', padding: 12, borderRadius: 8, alignItems: 'center', marginVertical: 10 },
exportText:   { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});