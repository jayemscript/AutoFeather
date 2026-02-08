import Adafruit_DHT
from datetime import datetime

DHT_SENSOR = Adafruit_DHT.DHT22
DHT_PIN = 4

class SensorService:
    def __init__(self):
        pass
    
    def read_dht22(self):
        humidity, temperature = Adafruit_DHT.read_retry(DHT_SENSOR, DHT_PIN)
        if humidity is not None and temperature is not None:
            return {"temperature": round(temperature, 1), "humidity": round(humidity, 1)}
        else:
            return {"temperature": None, "humidity": None}
    
    def get_temperature(self):
        sensor_data = self.read_dht22()
        
        if sensor_data['temperature'] is not None:
            return {
                "status": "success",
                "data": {
                    "temperature": sensor_data['temperature'],
                    "timestamp": datetime.now().isoformat(),
                    "sensorId": "DHT22_SENSOR_01",
                    "unit": "°C"
                }
            }
        else:
            return {
                "status": "error",
                "message": "Failed to read temperature from sensor",
                "data": None
            }
    
    def get_humidity(self):
        sensor_data = self.read_dht22()
        
        if sensor_data['humidity'] is not None:
            return {
                "status": "success",
                "data": {
                    "humidity": sensor_data['humidity'],
                    "timestamp": datetime.now().isoformat(),
                    "sensorId": "DHT22_SENSOR_01",
                    "unit": "%"
                }
            }
        else:
            return {
                "status": "error",
                "message": "Failed to read humidity from sensor",
                "data": None
            }