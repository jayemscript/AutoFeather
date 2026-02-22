from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from predict_controller import router as predict_router
# Uncomment the following line to include the sensor router
from sensor_controller import router as sensor_router
import uvicorn
import config

app = FastAPI(
    title=config.API_TITLE,
    description=config.API_DESCRIPTION,
    version=config.API_VERSION
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS if "*" not in config.CORS_ORIGINS else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(predict_router, prefix="/api", tags=["Prediction"])
# Uncomment the following line to include the sensor router
app.include_router(sensor_router, tags=["Sensor"])

@app.on_event("startup")
async def startup_event():
    model_info = config.get_model_info()
    print("=" * 60)
    print("Image Classification API Starting...")
    print(f"Model Path: {model_info['model_path']}")
    print(f"Model Exists: {model_info['model_exists']}")
    if model_info['model_size_mb']:
        print(f"Model Size: {model_info['model_size_mb']} MB")
    print("=" * 60)

@app.get("/")
async def root():
    model_info = config.get_model_info()
    return {
        "status": "success",
        "message": "Image Classification API is running",
        "version": config.API_VERSION,
        "model_path": config.MODEL_PATH,
        "model_loaded": model_info['model_exists']
    }

@app.get("/health")
async def health_check():
    model_info = config.get_model_info()
    return {
        "status": "success",
        "message": "Service is healthy",
        "data": {
            "api_version": config.API_VERSION,
            "model": "YOLOv8 Custom",
            "model_info": model_info
        }
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=config.HOST,
        port=config.PORT,
        reload=config.RELOAD,
        log_level=config.LOG_LEVEL.lower()
    )