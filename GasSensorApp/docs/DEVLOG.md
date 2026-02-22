# Dev Log — Senso Gas Monitor App
## February 22, 2026

---

### Arduino IDE Opening React Native Files
**Issue:** Arduino IDE was treating the entire `hacked2026` folder as a sketch, pulling in all React Native RCT files and asking to rename them.

**Fix:** Moved the `.ino` file into its own subfolder `ESP32/hacked2026/` so Arduino IDE only sees the ESP32 code.

---

### Bluetooth Permission Never Triggered
**Issue:** `NSBluetoothAlwaysUsageDescription` was nested inside the `NSAppTransportSecurity` dict in `Info.plist` instead of the top level dict. App was asking for Local Network permission instead of Bluetooth.

**Fix:** Moved Bluetooth keys to the correct top level in `Info.plist`:
```xml
<key>NSBluetoothAlwaysUsageDescription</key>
<string>App needs Bluetooth to connect to gas sensor</string>
<key>NSBluetoothPeripheralUsageDescription</key>
<string>App needs Bluetooth to connect to gas sensor</string>
```

---

### BLE State Stuck at Unknown
**Issue:** App was never appearing in Settings → Privacy → Bluetooth. BLE manager was stuck in `Unknown` state and never reaching `PoweredOn`.

**Fix:** Deleted app, clean built in Xcode (Cmd + Shift + K), and reinstalled so iOS properly prompted for Bluetooth permission on first launch.

---

### Device Name Showing as "Arduino"
**Issue:** ESP32 was broadcasting as "Arduino" instead of "GasSensor" despite `BLE.setLocalName("GasSensor")` being set.

**Fix:** Added `BLE.setDeviceName("GasSensor")` alongside `BLE.setLocalName()` in `app.h`:
```cpp
BLE.setDeviceName("GasSensor");
BLE.setLocalName("GasSensor");
```

---

### UUID Case Sensitivity
**Issue:** `react-native-ble-plx` was not matching the service/characteristic UUIDs because they were uppercase.

**Fix:** Changed UUIDs in `constants.js` to lowercase:
```javascript
export const SERVICE_UUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
export const CHAR_UUID    = '6e400003-b5a3-f393-e0a9-e50e24dcca9e';
```

---

### Connection Stuck After Discovering Services
**Issue:** `connectToDevice` was silently failing after `discoverAllServicesAndCharacteristics()` — the second `.then()` in the promise chain never fired.

**Fix:** Rewrote `connectToDevice` using async/await:
```javascript
const connectToDevice = async (device, onStart?) => {
  try {
    const connected  = await device.connect();
    const discovered = await connected.discoverAllServicesAndCharacteristics();
    setConnected(true);
    if (onStart) onStart();
    discovered.onDisconnected(() => { setConnected(false); });
    discovered.monitorCharacteristicForService(SERVICE_UUID, CHAR_UUID, (err, char) => {
      if (err) { setConnected(false); return; }
      handleData(char);
    });
  } catch (err) {
    console.log('connection error:', err);
    setConnected(false);
  }
};
```

---

### Result
App is connected and receiving live CO and CH4 sensor data consistently via BLE from the Arduino Nano ESP32.

---

### Known Issues / Future Work
- Memory management — app stores unbounded data if run for a long time, needs cleanup
- Consider adding average readings per session
- Export log could include graph data not just threshold alerts