// #include "sensor.h"
// #include "OLED.h"
// #include "buzzer.h"
#include "app.h"
#include "fakeData.h"

void setup() {
  Serial.begin(115200);

  // setupSensor();
  // setupOLED();
  // setupBuzzer();
  setupApp();
}

void loop() {
  unsigned long now = millis();
  static unsigned long lastSensor = 0;
  static unsigned long lastSend   = 0;
  static float currentGAS1PPM    = 0;
  static float currentGAS2PPM    = 0;

  if (now - lastSensor > 1000) {
    // int rawADC = analogRead(ADC_PIN);
    // Serial.print("Raw ADC Value: ");
    // Serial.println(rawADC);

    currentGAS1PPM = getGAS1PPM(); // getGAS1PPM(rawADC);
    currentGAS2PPM = getGAS2PPM(); // getGAS2PPM(rawADC);

    Serial.print("GAS1: "); Serial.print(currentGAS1PPM, 1); Serial.println(" PPM");
    Serial.print("GAS2: "); Serial.print(currentGAS2PPM, 1); Serial.println(" PPM");

    // updateDisplay(currentGAS1PPM, currentGAS2PPM);
    // checkAlarm(currentGAS1PPM, currentGAS2PPM);
    lastSensor = now;
  }

  if (now - lastSend > 5000) {
    sendDataToApp(currentGAS1PPM, currentGAS2PPM);
    lastSend = now;
  }
}