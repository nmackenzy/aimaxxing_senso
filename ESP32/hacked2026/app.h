#ifndef APP_H
#define APP_H

#include <ArduinoBLE.h>

#define NUS_SERVICE_UUID  "6E400001-B5A3-F393-E0A9-E50E24DCCA9E"
#define NUS_TX_CHAR_UUID  "6E400003-B5A3-F393-E0A9-E50E24DCCA9E"

BLEService uartService(NUS_SERVICE_UUID);
BLECharacteristic txCharacteristic(NUS_TX_CHAR_UUID, BLENotify, 20);

void setupApp() {
  if (!BLE.begin()) {
    Serial.println("BLE init failed!");
    while (1);
  }

  BLE.setDeviceName("GasSensor");
  BLE.setLocalName("GasSensor");
  BLE.setAdvertisedService(uartService);
  uartService.addCharacteristic(txCharacteristic);
  BLE.addService(uartService);
  BLE.advertise();
  Serial.println("BLE advertising as 'GasSensor'");
}

void sendDataToApp(float gas1ppm, float gas2ppm) {
  BLE.poll();
  if (!BLE.connected()) return;
  char buf[32];
  snprintf(buf, sizeof(buf), "GAS1:%.1f,GAS2:%.1f\n", gas1ppm, gas2ppm);
  txCharacteristic.writeValue((uint8_t*)buf, strlen(buf));
}

#endif