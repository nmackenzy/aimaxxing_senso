import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AlertLog({ label, threshold, log }) {
  return (
    <View>
      <Text style={styles.label}>{label} Threshold Alerts (≥{threshold})</Text>
      {log.length === 0
        ? <Text style={styles.noAlert}>No alerts</Text>
        : log.map((entry, i) => <Text key={i} style={styles.entry}>{entry}</Text>)
      }
    </View>
  );
}

const styles = StyleSheet.create({
  label:   { fontSize: 18, fontWeight: '600', marginTop: 16, marginBottom: 4 },
  entry:   { fontSize: 14, color: '#e74c3c', paddingVertical: 2 },
  noAlert: { fontSize: 14, color: 'gray' },
});