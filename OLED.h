#ifndef OLED_H
#define OLED_H

#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

Adafruit_SSD1306 display(128, 32, &Wire, -1);

// --- Layout ---
#define DIVIDER_X    45
#define GRAPH_W      (128 - DIVIDER_X - 1)
#define MAX_SAMPLES  GRAPH_W   // one sample per pixel column

// --- Per-gas history ---
static float ppmHistory[2][MAX_SAMPLES];
static int   sampleIndex[2] = {0, 0};
static int   sampleCount[2] = {0, 0};

void setupOLED() {
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    for (;;);
  }
  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);
  memset(ppmHistory, 0, sizeof(ppmHistory));
}

void addSample(int gas, float ppm) {
  ppmHistory[gas][sampleIndex[gas]] = ppm;
  sampleIndex[gas] = (sampleIndex[gas] + 1) % MAX_SAMPLES;
  if (sampleCount[gas] < MAX_SAMPLES) sampleCount[gas]++;
}

void drawGasPanel(int gas, float ppm, int panelY) {
  // --- Left: numeric ---
  display.setTextSize(1);
  display.setCursor(0, panelY + 1);
  display.print(gas == 0 ? "G1" : "G2");
  display.setCursor(0, panelY + 9);
  display.print((int)ppm);

  // --- Divider ---
  display.drawFastVLine(DIVIDER_X - 1, panelY, 16, SSD1306_WHITE);

  // --- Right: line graph ---
  float minVal = ppmHistory[gas][0], maxVal = ppmHistory[gas][0];
  for (int i = 1; i < MAX_SAMPLES; i++) {
    if (ppmHistory[gas][i] < minVal) minVal = ppmHistory[gas][i];
    if (ppmHistory[gas][i] > maxVal) maxVal = ppmHistory[gas][i];
  }
  if (maxVal - minVal < 1.0f) maxVal = minVal + 1.0f;

  int prevX = -1, prevY = -1;
  for (int i = 0; i < MAX_SAMPLES; i++) {
    int bufIdx = (sampleIndex[gas] + i) % MAX_SAMPLES;
    float val  = ppmHistory[gas][bufIdx];

    int x = DIVIDER_X + i;
    int y = panelY + 15 - (int)((val - minVal) / (maxVal - minVal) * 15);

    if (prevX >= 0) {
      display.drawLine(prevX, prevY, x, y, SSD1306_WHITE);
    }
    prevX = x;
    prevY = y;
  }
}

void updateDisplay(float ppm1, float ppm2) {
  addSample(0, ppm1);
  addSample(1, ppm2);

  display.clearDisplay();

  drawGasPanel(0, ppm1, 0);   // top half:    y = 0–15
  display.drawFastHLine(0, 16, 128, SSD1306_WHITE);  // horizontal divider
  drawGasPanel(1, ppm2, 17);  // bottom half: y = 17–32

  display.display();
}

#endif