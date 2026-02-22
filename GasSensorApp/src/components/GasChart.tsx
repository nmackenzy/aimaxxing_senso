import React from 'react';
import { Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const width = Dimensions.get('window').width - 32;

export default function GasChart({ label, data, threshold, lineColor }) {
  const chartConfig = {
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    color: (opacity = 1) => lineColor(opacity),
    strokeWidth: 2,
  };

  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <LineChart
        data={{ labels: [], datasets: [
          { data, color: lineColor },
          { data: Array(data.length).fill(threshold),
            color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`,
            strokeWidth: 1,
            withDots: false
          }
        ]}}
        width={width} height={180}
        chartConfig={chartConfig}
        bezier style={styles.chart}
      />
    </>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 18, fontWeight: '600', marginTop: 16, marginBottom: 4 },
  chart: { borderRadius: 8 },
});