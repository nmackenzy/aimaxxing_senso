#ifndef SENSOR_H
#define SENSOR_H
#include "DFRobot_MICS.h"

#define ADC_PIN       A7
#define POWER_PIN     3
#define CALIBRATION_TIME 3

// Arduino Nano ESP32: 12-bit ADC, 3.3V reference
#define ADC_MAX       4095.0
#define VCC           3.3

// ⚠️ REPLACE THIS: measure RL on your SENS0440 board with a multimeter (in ohms)
// It's the resistor between the sensor output and GND — commonly 10kΩ
#define RL_OHMS       10000.0

// R0 = sensor resistance in clean air (ohms)
// ⚠️ REPLACE THIS: run calibration in clean air and read the printed R0 value below
#define R0_OHMS       30000.0

DFRobot_MICS_ADC mics(ADC_PIN, POWER_PIN);

void setupSensor() {
  pinMode(POWER_PIN, OUTPUT);
  digitalWrite(POWER_PIN, LOW);
  while (!mics.begin()) {
    Serial.println("No device found! Retrying...");
    delay(1000);
  }
  Serial.println("MICS-5524 connected successfully!");
  uint8_t mode = mics.getPowerState();
  if (mode == SLEEP_MODE) {
    mics.wakeUpMode();
    Serial.println("Sensor woken up.");
  } else {
    Serial.println("Sensor already awake.");
  }
  Serial.println("Warming up sensor, please wait...");
  while (!mics.warmUpTime(CALIBRATION_TIME)) {
    Serial.println("Warm-up in progress...");
    delay(1000);
  }
  Serial.println("Sensor ready!");
}

// Converts raw ADC → sensor resistance Rs
float getRs(int rawADC) {
  float vOut = (rawADC / ADC_MAX) * VCC;
  // Voltage divider: vOut = VCC * RL / (Rs + RL)
  // Solving for Rs:
  if (vOut <= 0) return 1000000.0; // avoid divide-by-zero
  float rs = ((VCC - vOut) / vOut) * RL_OHMS;
  return rs;
}

// Converts raw ADC → sensor resistance Rs
float getRsR0Ratio(int rawADC) {
  float rs = getRs(rawADC);
  return rs / R0_OHMS;
}

// Methane (CH4) curve from MICS-5524 datasheet
// Rs/R0 vs PPM follows: PPM = a * (Rs/R0)^b
// Approximate curve fit for CH4: PPM = 630 * (Rs/R0)^(-2.0)
float getGAS1PPM(int rawADC) {
  float ratio = getRsR0Ratio(rawADC);
  if (ratio > 0.786) return 0.0;
  float ppm = (0.786 - ratio) / 0.000023;
  if (ppm < 1000.0) return 0.0;
  if (ppm > 25000.0) return 25000.0;
  return ppm;
}

// CO curve from MICS-5524 datasheet
// Approximate curve fit for CO: PPM = 530 * (Rs/R0)^(-1.7)
float getGAS2PPM(int rawADC) {
  float ratio = getRsR0Ratio(rawADC);
  if (ratio > 0.425) return 0.0;
  float ppm = (0.425 - ratio) / 0.000405;
  if (ppm > 1000.0) return 1000.0;
  if (ppm < 1.0) return 0.0;
  return ppm;
}

#endif