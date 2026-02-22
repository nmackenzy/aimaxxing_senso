
# hacked2026
---
# Gas Detection System (Hacked2026)

This project is an Arduino-based gas monitoring system designed to detect and visualize concentrations of Methane (CH4) and Carbon Monoxide (CO). It features real-time data visualization on an OLED display , a buzzer alarm system for safety thresholds , and Bluetooth Low Energy (BLE) integration for mobile app connectivity.

---

## Features

* 
**Dual Gas Sensing**: Monitors two distinct gas types using the MICS-5524 sensor.


* 
**Real-Time OLED Dashboard**: Displays numeric PPM values and a rolling historical line graph for both gases.


* 
**Audible Alarms**: Automatically triggers a buzzer when gas levels exceed safety thresholds.


* 
**BLE Connectivity**: Streams sensor data to a mobile application using the Nordic UART Service (NUS) protocol.


* 
**Advanced Signal Processing**: Converts raw ADC signals into accurate PPM values using calibrated resistance ratios.



---

## Hardware Requirements

| Component | Pin / Connection |
| --- | --- |
| **Arduino Nano ESP32** | Main Controller 

 |
| **MICS-5524 Gas Sensor** | ADC_PIN (A7), POWER_PIN (3) 

 |
| **SSD1306 OLED (128x32)** | I2C Interface 

 |
| **Active Buzzer** | A0 

 |

---

## Project Structure

* 
**hacked2026.ino**: The main application logic managing the sensor polling, display updates, and BLE timing loops.


* 
**sensor.h**: Handles the MICS-5524 initialization, warm-up sequences, and the mathematical conversion of raw ADC values to PPM.


* 
**OLED.h**: Manages the graphical interface, including the split-screen layout and line graph rendering.


* 
**buzzer.h**: Defines the safety thresholds and controls the alarm state.


* 
**app.h**: Configures the BLE stack, advertising as 'GasSensor' and handling data transmission.



---

## Configuration and Calibration

Before deploying, ensure the following constants in sensor.h match your specific hardware environment:

1. **RL_OHMS**: Measure the load resistor on your sensor board (typically 10kOhm).
2. **R0_OHMS**: Run the sensor in clean air and update this value with the baseline resistance of your specific sensor.
3. **Alarm Thresholds**: Located in buzzer.h, the default triggers are:
* 
**GAS1 (CH4)**: 20,000.0 PPM.


* 
**GAS2 (CO)**: 500.0 PPM.





---

## Mobile Integration

The system uses the Nordic UART Service (NUS) to broadcast data. You can use any BLE Terminal app to receive data in the following format:
`GAS1: [value], GAS2: [value]` 

Would you like me to provide a simplified version of the code that outputs the raw R0 value for your calibration step?
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