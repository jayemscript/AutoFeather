# 🚀 YOLOv8 Image Classification API - Quick Start Guide

## 📦 Installation Commands

### Step 1: Install Dependencies

```bash
pip install fastapi uvicorn[standard] ultralytics opencv-python Pillow numpy pydantic python-multipart
```

**Or use requirements.txt:**
```bash
pip install -r requirements.txt
```

### Step 2: Verify Your Model Path

**IMPORTANT:** Make sure your trained YOLOv8 model is at:
```
../model/final-version/weights/best.pt
```

The directory structure should look like:
```
your-project/
├── api/
│   ├── main.py
│   ├── predict_controller.py
│   └── predict_service.py
└── model/
    └── final-version/
        └── weights/
            └── best.pt  ← Your trained model here
```

If your model is in a different location, update the `MODEL_PATH` in `config.py`:
```python
# In config.py
MODEL_PATH = "path/to/your/model/best.pt"
```

**Verify your configuration:**
```bash
cd api
python config.py
```

This will show you:
- Current model path
- Whether the model exists
- Model file size

### Step 3: Navigate to API Directory

```bash
cd api
```

### Step 4: Run the Server

```bash
python main.py
```

**Alternative (using uvicorn directly):**
```bash
uvicorn main:app --host 0.0.0.0 --port 5000 --reload
```

## ✅ Verify Installation

1. Open your browser and go to: http://localhost:5000
2. You should see: `{"status":"success","message":"Image Classification API is running"}`
3. Visit the interactive docs: http://localhost:5000/docs

## 📁 File Structure

```
api/
├── main.py                     # Main FastAPI application (entry point)
├── predict_controller.py       # API routes (controller layer)
├── predict_service.py          # Business logic (service layer)
├── config.py                   # Configuration (MODEL_PATH is here!)
├── requirements.txt            # Python dependencies
├── test_client.py             # Test client for API
├── .env.example               # Environment variables template
└── README.md                  # Detailed documentation
```

## 🔌 Testing the API

### Using cURL

```bash
# Health check
curl http://localhost:5000/health

# Predict (you need a base64 encoded image)
curl -X POST "http://localhost:5000/api/predict" \
  -H "Content-Type: application/json" \
  -d '{"images": ["YOUR_BASE64_IMAGE_HERE"]}'
```

### Using Python Test Client

```python
python test_client.py
```

### Using the Interactive Docs

1. Go to http://localhost:5000/docs
2. Click on "POST /api/predict"
3. Click "Try it out"
4. Enter your base64 images
5. Click "Execute"

## 📝 API Endpoint

```
POST http://localhost:5000/api/predict
```

**Request Body:**
```json
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
    "total_images": 1,
    "successful_predictions": 1,
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
        "image_info": {...},
        "top5_predictions": [...]
      }
    ]
  }
}
```

## 🐛 Troubleshooting

### Model Not Found Error
If you see "Error loading model", check:
1. Is your model file at `../model/final-version/weights/best.pt`?
2. Is the path relative to the `api` directory?
3. Does the file `best.pt` exist and is it a valid YOLOv8 model?

**Verify configuration:**
```bash
cd api
python config.py
```

**Fix:** Update the model path in `config.py`:
```python
# In config.py, change this line:
MODEL_PATH = os.getenv("MODEL_PATH", "correct/path/to/your/best.pt")
```

### Port Already in Use
Change the port in `main.py` or use:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Import Errors
Make sure all dependencies are installed:
```bash
pip install -r requirements.txt
```

### Model Loading is Slow
- First time loading is normal (model initialization)
- Subsequent requests will be much faster
- Consider using GPU for faster inference

## 🎯 Next Steps

1. Read the full `README.md` for detailed documentation
2. Customize the model in `predict_service.py`
3. Add authentication if needed
4. Deploy to production server
5. Set up monitoring and logging

## 💡 Tips

- First request will be slower (model loading)
- Use batch predictions for better performance
- Check `/docs` for interactive API documentation
- Enable GPU for faster inference (if available)

---

**Need Help?** Check the detailed README.md file or visit the Swagger docs at http://localhost:5000/docs