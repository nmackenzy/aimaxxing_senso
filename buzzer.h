#ifndef BUZZER_H
#define BUZZER_H

const int buzzerPin = A0;

const float GAS1_THRESHOLD = 25000.0;
const float GAS2_THRESHOLD = 1000.0;

void setupBuzzer() {
  pinMode(buzzerPin, OUTPUT);
  digitalWrite(buzzerPin, LOW);
}

void checkAlarm(float gas1ppm, float gas2ppm) {
  if (gas1ppm > GAS1_THRESHOLD || gas2ppm > GAS2_THRESHOLD) {
    digitalWrite(buzzerPin, HIGH);
  } else {
    digitalWrite(buzzerPin, LOW);
  }
}

#endif