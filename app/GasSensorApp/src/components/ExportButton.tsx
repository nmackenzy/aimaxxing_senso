import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Share } from 'react-native';

export default function ExportButton({ coLog, ch4Log }) {
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

  return (
    <TouchableOpacity style={styles.button} onPress={exportLog}>
      <Text style={styles.text}>Export Log</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: { backgroundColor: '#3498db', padding: 12, borderRadius: 8, alignItems: 'center', marginVertical: 10 },
  text:   { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});