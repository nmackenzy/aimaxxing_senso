#ifndef SENSOR_H
#define SENSOR_H

#include "DFRobot_MICS.h"

#define ADC_PIN A7
#define CALIBRATION_TIME 3  // Warm-up time in minutes

DFRobot_MICS_ADC mics(ADC_PIN, -1);

void setupSensor() {
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

float getGAS1PPM() {
  return mics.getGasData(CH4);  // Ethanol (10–500 PPM)
}

float getGAS2PPM() {
  return mics.getGasData(CO);      // Carbon Monoxide (1–1000 PPM)
}

#endif