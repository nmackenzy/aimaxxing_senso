# hacked2026
---
# Senso — Gas Monitor App

A mobile app that connects to an ESP32 via Bluetooth to monitor CO and CH4 gas levels in real time.

## Built With
- React Native (iOS)
- Arduino Nano ESP32
- BLE (Bluetooth Low Energy)

## Features
- Real-time CO and CH4 gas level monitoring via Bluetooth
- Line graphs with threshold danger line
- Color coded status banner (green → orange → red)
- Threshold alerts logged with timestamps
- Session history saved locally on device
- Export log via iOS share sheet
- Mock data mode for demo without hardware

## Project Structure
```
GasSensorApp/
  src/
    components/
      StatusBanner.tsx   - color coded gas reading banner
      GasChart.tsx       - line graph with threshold line
      AlertLog.tsx       - threshold alert history list
      ExportButton.tsx   - share log via iOS share sheet
    constants.js         - UUIDs, thresholds, intervals
    utils.js             - helper functions
    mockData.ts          - mock data mode for demo
  App.tsx                - main app, BLE logic, state
```

## Hardware Setup
- Arduino Nano ESP32
- Gas sensor on pin 34
- Data sent over BLE in format: `co:45,ch4:89`

## Thresholds
| Gas | Threshold |
|-----|-----------|
| CO  | 50 ppm    |
| CH4 | 100 ppm   |

## Running the App
1. Install dependencies: `npm install`
2. Install iOS pods: `cd ios && pod install && cd ..`
3. Start Metro: `npx @react-native-community/cli start`
4. Run on simulator: `npx react-native run-ios`
5. Run on device: open `ios/GasSensorApp.xcworkspace` in Xcode and press ▶

## Testing Without Hardware
Press **Start Mock Data** in the app to simulate sensor readings.