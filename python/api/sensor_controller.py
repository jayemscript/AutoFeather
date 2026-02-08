from fastapi import APIRouter
from sensor_service import SensorService

router = APIRouter()
sensor_service = SensorService()

@router.get("/sensor/temp")
async def get_temperature():
    return sensor_service.get_temperature()

@router.get("/sensor/hum")
async def get_humidity():
    return sensor_service.get_humidity()