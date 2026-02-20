/* PURPOSE: connecting data from gas sensor to app on phone through Bluetooth*/
//note: not using wifi since MQTT does not work on public wifi
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

//note: generated unique identifiers for app to know which bluetooth service and data channel to connect to 
// this is done through https://www.uuidgenerator.net/
#define SERVICE_UUID          "3e35c214-47fa-4a79-bbd3-904d9d243cda"
#define CHARACTERISTIC_UUID   "56da9e39-0d4e-4c0f-a2be-52c96ebca9f5"
#define SEC_TO_NEXT_READING   1000

/*data channel, can have multiple characteristics (eg. one of gas sensor, one for temp or smth else if adding on later)*/
BLECharacteristic *pCharacteristic;
bool deviceConnected = false;

//run when phone connects/disconnects from esp32
class ServerCallbacks : public BLEServerCallbacks {
  void onConnect(BLEServer * pServer) 
  {
    deviceConnected = true; 
  }
  void onDisconnect(BLEServer * pServer) 
  {
     deviceConnected = false; 
  }
};

void setup() {
  //for DEBUGGING
  Serial0.begin(115200);                           //serial monitor

  BLEDevice::init("ESP32_GasSensor");             //setting the bluetooth device name
  
  BLEServer *pServer = BLEDevice::createServer(); //creating BLE server
  pServer->setCallbacks(new ServerCallback());    //attach connect/disconnect handlers

  //service container
  BLEService *pService = pServer->createService(SERVICE_UUID);

  //notify := pushes data to app auto
  pCharacteristic = pService->createCharacteristic(CHARACTERISTIC_UUID, BLECharacteristic::PROPERTY_NOTIFY);
  pCharacteristic->addDescriptor(new BLE2902());
  pService->start();

  //broadcasts so phone can find the esp32
  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->start();

  Serial0.println("Waiting for connection...");
}

void loop() {
  if (deviceConnected) 
  {
    int sensorVal = analogRead(34);               //read gas sensor on pin 34
    String val = String(sensorVal);               //convert num to str
    pCharacteristic->setBalue(value.c_str());     //set the val to send
    pCharacteristic->notify();                    //push val to the app
    delay(SEC_TO_NEXT_READING);                   //wait no. of sec before next reading
  }
}
