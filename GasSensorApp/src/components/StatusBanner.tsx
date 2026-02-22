import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getStatusColor } from '../utils';
import { CO_THRESHOLD, CH4_THRESHOLD } from '../constants';

export default function StatusBanner({ coData, ch4Data }) {
  return (
    <View style={[styles.banner, { backgroundColor: getStatusColor(coData[coData.length - 1], CO_THRESHOLD) }]}>
      <Text style={styles.text}>CO: {coData[coData.length - 1]} ppm</Text>
      <Text style={styles.text}>CH4: {ch4Data[ch4Data.length - 1]} ppm</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { padding: 12, borderRadius: 8, marginVertical: 6, alignItems: 'center' },
  text:   { fontSize: 20, fontWeight: 'bold', color: '#fff' },
});