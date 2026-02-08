import time
import Adafruit_DHT

DHT_SENSOR = Adafruit_DHT.DHT22
DHT_PIN = 4

def read_dht22():
    humidity, temperature = Adafruit_DHT.read_retry(DHT_SENSOR, DHT_PIN)
    if humidity is not None and temperature is not None:
        return {"temperature": round(temperature, 1), "humidity": round(humidity, 1)}
    else:
        return {"temperature": None, "humidity": None}

if __name__ == "__main__":
    while True:
        result = read_dht22()
        if result['temperature'] is not None:
            print(f"Temp: {result['temperature']}°C, Humidity: {result['humidity']}%")
        else:
            print("Sensor read failed")
        time.sleep(3)