"""
Configuration file for the Image Classification API
"""
import os
from pathlib import Path

# Get the base directory (api folder)
BASE_DIR = Path(__file__).resolve().parent

# Model Configuration
MODEL_PATH = os.getenv("MODEL_PATH", str(BASE_DIR.parent / "model" / "final-version" / "weights" / "best.pt"))

# Server Configuration
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", 5000))
RELOAD = os.getenv("RELOAD", "True").lower() == "true"

# CORS Configuration
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")

# Logging Configuration
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")

# API Configuration
API_TITLE = "Image Classification API"
API_DESCRIPTION = "REST API for YOLOv8 Image Classification using Custom Trained Model"
API_VERSION = "1.0.0"

# Model Info
def get_model_info():
    """Get model configuration information"""
    return {
        "model_path": MODEL_PATH,
        "model_exists": Path(MODEL_PATH).exists(),
        "model_size_mb": round(Path(MODEL_PATH).stat().st_size / (1024 * 1024), 2) if Path(MODEL_PATH).exists() else None
    }


# Print configuration on import (for debugging)
if __name__ == "__main__":
    print("=" * 60)
    print("API Configuration")
    print("=" * 60)
    print(f"Model Path: {MODEL_PATH}")
    print(f"Model Exists: {Path(MODEL_PATH).exists()}")
    print(f"Host: {HOST}")
    print(f"Port: {PORT}")
    print(f"Reload: {RELOAD}")
    print("=" * 60)