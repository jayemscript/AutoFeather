# YOLOv8 Image Classification REST API

A FastAPI-based REST API for image classification using Ultralytics YOLOv8 with your custom trained model.

## 📁 Project Structure

```
api/
├── main.py                  # FastAPI application entry point
├── predict_controller.py    # API routes and request handling
├── predict_service.py       # Business logic for predictions
├── config.py                # Configuration file (model path, server settings)
├── requirements.txt         # Python dependencies
├── .env.example            # Environment variables template
└── README.md               # This file

model/
└── final-version/
    └── weights/
        └── best.pt         # Your custom trained YOLOv8 model
```

## 🚀 Installation

### 1. Install Dependencies

```bash
pip install fastapi uvicorn[standard] ultralytics opencv-python Pillow numpy pydantic python-multipart
```

Or use the requirements file:

```bash
pip install -r requirements.txt
```

### 2. Verify Your Model Path

Make sure your trained YOLOv8 model is located at:
```
../model/final-version/weights/best.pt
```

Or update the `MODEL_PATH` in `main.py` or set it as an environment variable.

## 🏃 Running the API

### Development Mode (with auto-reload)

```bash
python main.py
```

Or using uvicorn directly:

```bash
uvicorn main:app --host 0.0.0.0 --port 5000 --reload
```

### Production Mode

```bash
uvicorn main:app --host 0.0.0.0 --port 5000 --workers 4
```

The API will be available at: `http://localhost:5000`

## 📖 API Documentation

Once running, visit:
- **Swagger UI**: http://localhost:5000/docs
- **ReDoc**: http://localhost:5000/redoc

## 🔌 API Endpoints

### 1. Health Check
```http
GET http://localhost:5000/
GET http://localhost:5000/health
```

### 2. Batch Prediction (Main Endpoint)
```http
POST http://localhost:5000/api/predict
Content-Type: application/json

{
  "images": [
    "base64_encoded_image_string_1",
    "base64_encoded_image_string_2"
  ]
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Images classified successfully",
  "data": {
    "total_images": 2,
    "successful_predictions": 2,
    "failed_predictions": 0,
    "total_processing_time_ms": 145.32,
    "average_time_per_image_ms": 72.66,
    "predictions": [
      {
        "class": "cat",
        "confidence": 0.9234,
        "speed": {
          "preprocess_ms": 2.15,
          "inference_ms": 68.42,
          "postprocess_ms": 1.89,
          "total_ms": 72.46
        },
        "image_info": {
          "original_shape": [640, 480, 3],
          "model_input_shape": [640, 640]
        },
        "top5_predictions": [
          {"class": "cat", "confidence": 0.9234},
          {"class": "dog", "confidence": 0.0512},
          {"class": "bird", "confidence": 0.0123}
        ],
        "all_classes_count": 1000,
        "image_index": 0
      }
    ],
    "errors": null
  }
}
```

### 3. Single Image Prediction
```http
POST http://localhost:5000/api/predict/single
Content-Type: application/json

{
  "image": "base64_encoded_image_string"
}
```

### 4. Model Information
```http
GET http://localhost:5000/api/model/info
```

## 💻 Usage Examples

### Python Example
```python
import requests
import base64

# Read and encode image
with open('image.jpg', 'rb') as f:
    image_base64 = base64.b64encode(f.read()).decode('utf-8')

# Make request
response = requests.post(
    'http://localhost:5000/api/predict',
    json={'images': [image_base64]}
)

result = response.json()
print(f"Class: {result['data']['predictions'][0]['class']}")
print(f"Confidence: {result['data']['predictions'][0]['confidence']}")
```

### JavaScript Example
```javascript
// Convert image to base64
const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];
const reader = new FileReader();

reader.onload = async (e) => {
  const base64Image = e.target.result.split(',')[1];
  
  const response = await fetch('http://localhost:5000/api/predict', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      images: [base64Image]
    })
  });
  
  const result = await response.json();
  console.log('Prediction:', result.data.predictions[0]);
};

reader.readAsDataURL(file);
```

### cURL Example
```bash
# Convert image to base64
BASE64_IMAGE=$(base64 -w 0 image.jpg)

# Make request
curl -X POST "http://localhost:5000/api/predict" \
  -H "Content-Type: application/json" \
  -d "{\"images\": [\"$BASE64_IMAGE\"]}"
```

## 📊 Response Structure

### Success Response
- `status`: "success" or "failed"
- `message`: Description of the result
- `data`: Object containing:
  - `total_images`: Number of images processed
  - `successful_predictions`: Count of successful predictions
  - `failed_predictions`: Count of failed predictions
  - `total_processing_time_ms`: Total time taken
  - `average_time_per_image_ms`: Average time per image
  - `predictions`: Array of prediction objects
  - `errors`: Array of error objects (if any)

### Prediction Object
- `class`: Predicted class name
- `confidence`: Confidence score (0-1)
- `speed`: Object with timing information
  - `preprocess_ms`: Preprocessing time
  - `inference_ms`: Model inference time
  - `postprocess_ms`: Postprocessing time
  - `total_ms`: Total prediction time
- `image_info`: Image metadata
- `top5_predictions`: Top 5 class predictions
- `all_classes_count`: Total number of classes in model
- `image_index`: Index in the batch

## 🔧 Configuration

### Model Path Configuration

The model path is now centralized in `config.py`. The default is automatically set to:
```
../model/final-version/weights/best.pt
```

You can change this in multiple ways:

**Option 1: Edit config.py directly (Recommended)**
```python
# In config.py
MODEL_PATH = os.getenv("MODEL_PATH", "your/custom/path/to/best.pt")
```

**Option 2: Use environment variable**
```bash
export MODEL_PATH="../model/final-version/weights/best.pt"
python main.py
```

**Option 3: Create .env file**
```bash
cp .env.example .env
# Edit .env and set MODEL_PATH
```

**Verify your configuration:**
```bash
cd api
python config.py
```
This will print your current configuration and verify if the model exists.

### Other Configuration

All settings are in `config.py`:
- `HOST` - Server host (default: 0.0.0.0)
- `PORT` - Server port (default: 5000)
- `RELOAD` - Auto-reload on code changes (default: True)
- `CORS_ORIGINS` - Allowed CORS origins (default: *)
- `LOG_LEVEL` - Logging level (default: INFO)

Modify `predict_service.py` to change:
- Preprocessing steps
- Postprocessing logic

## 🐛 Error Handling

The API returns appropriate HTTP status codes:
- `200`: Success
- `400`: Bad Request (invalid input)
- `500`: Internal Server Error
- `503`: Service Unavailable (model not loaded)

## 📝 Notes

- The API uses your custom trained YOLOv8 model at `../model/final-version/weights/best.pt`
- The first request may be slower as the model loads into memory
- Base64 images should not include the data URL prefix (or it will be automatically removed)
- Supports common image formats: JPG, PNG, BMP, etc.
- Maximum request size depends on your server configuration
- The model classes and confidence scores will match your training data

## 🚀 Performance Tips

1. Ensure your model file (`best.pt`) is optimized and not too large
2. Batch multiple images in single request for better throughput
3. Use production ASGI server (gunicorn + uvicorn workers) for production
4. Enable GPU if available (CUDA) - YOLOv8 will automatically use it
5. Implement caching for frequently requested predictions
6. Consider model quantization for faster inference if needed

## 📄 License

This project uses YOLOv8 by Ultralytics (AGPL-3.0 license).