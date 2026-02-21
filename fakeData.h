// fakeData.h
#ifndef FAKE_DATA_H
#define FAKE_DATA_H

#include <Arduino.h>

// Simulate slow-drifting PPM values with occasional spikes
static float _fakePPM(float base, float drift, float spikeChance, float spikeMax) {
  static float val1 = base;
  static float val2 = base;

  float &val = (&drift == &drift) ? val1 : val2; // placeholder, see below
  val += random(-100, 100) / 100.0 * drift;
  val = constrain(val, base * 0.5, base * 2.0);

  if (random(1000) < (int)(spikeChance * 1000)) {
    val += random(0, (int)spikeMax);
  }
  return val;
}

static float _gas1 = 50.0;
static float _gas2 = 20.0;

float getGAS1PPM() {
  _gas1 += random(-10, 10) / 10.0;       // small random walk
  _gas1 = constrain(_gas1, 10.0, 300.0); // realistic bounds
  if (random(100) < 5) _gas1 += random(50, 150); // 5% chance of spike
  _gas1 = constrain(_gas1, 10.0, 300.0);
  return _gas1;
}

float getGAS2PPM() {
  _gas2 += random(-5, 5) / 10.0;
  _gas2 = constrain(_gas2, 5.0, 150.0);
  if (random(100) < 3) _gas2 += random(30, 100); // 3% chance of spike
  _gas2 = constrain(_gas2, 5.0, 150.0);
  return _gas2;
}

#endif