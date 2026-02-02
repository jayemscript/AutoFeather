"""
Prediction Service - Business Logic
Handles YOLOv8 image classification predictions
"""
import base64
import io
import time
import numpy as np
from PIL import Image
from ultralytics import YOLO
from typing import List, Dict, Any
import cv2
import config


class PredictionService:
    """Service class for handling image classification predictions"""
    
    def __init__(self, model_path: str = None):
        """
        Initialize the prediction service with YOLOv8 model
        
        Args:
            model_path: Path to the YOLOv8 model file (defaults to config.MODEL_PATH)
        """
        if model_path is None:
            model_path = config.MODEL_PATH
            
        try:
            self.model = YOLO(model_path)
            self.model_path = model_path
            print(f"✓ Model loaded successfully: {model_path}")
        except Exception as e:
            print(f"✗ Error loading model: {e}")
            raise
    
    def decode_base64_image(self, base64_string: str) -> np.ndarray:
        """
        Decode base64 string to numpy array (image)
        
        Args:
            base64_string: Base64 encoded image string
            
        Returns:
            numpy array of the image
        """
        try:
            # Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
            if "," in base64_string:
                base64_string = base64_string.split(",")[1]
            
            # Decode base64 string - FIXED: use b64decode
            image_bytes = base64.b64decode(base64_string)
            
            # Convert to PIL Image
            image = Image.open(io.BytesIO(image_bytes))
            
            # Convert to RGB if necessary
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Convert to numpy array
            image_array = np.array(image)
            
            return image_array
            
        except Exception as e:
            raise ValueError(f"Failed to decode base64 image: {str(e)}")
    
    def preprocess_image(self, image: np.ndarray) -> Dict[str, Any]:
        """
        Preprocess image for YOLOv8 inference
        
        Args:
            image: Input image as numpy array
            
        Returns:
            Dictionary containing preprocessed image info
        """
        start_time = time.time()
        
        original_shape = image.shape
        
        # YOLOv8 handles preprocessing internally, but we can track it
        preprocess_time = (time.time() - start_time) * 1000  # Convert to ms
        
        return {
            "original_shape": original_shape,
            "preprocess_time_ms": round(preprocess_time, 2)
        }
    
    def predict_single_image(self, base64_image: str) -> Dict[str, Any]:
        """
        Predict classification for a single image
        
        Args:
            base64_image: Base64 encoded image string
            
        Returns:
            Dictionary containing prediction results
        """
        try:
            # Decode image
            image = self.decode_base64_image(base64_image)
            
            # Preprocess
            preprocess_start = time.time()
            preprocess_info = self.preprocess_image(image)
            preprocess_time = (time.time() - preprocess_start) * 1000
            
            # Inference
            inference_start = time.time()
            results = self.model(image, verbose=False)
            inference_time = (time.time() - inference_start) * 1000
            
            # Postprocess
            postprocess_start = time.time()
            result = results[0]
            
            # Get top prediction
            probs = result.probs
            top_class_idx = probs.top1
            top_confidence = float(probs.top1conf)
            class_name = result.names[top_class_idx]
            
            # Get top 5 predictions
            top5_indices = probs.top5
            top5_conf = probs.top5conf
            top5_predictions = [
                {
                    "class": result.names[idx],
                    "confidence": float(conf)
                }
                for idx, conf in zip(top5_indices, top5_conf)
            ]
            
            postprocess_time = (time.time() - postprocess_start) * 1000
            
            # Total speed
            total_time = preprocess_time + inference_time + postprocess_time
            
            return {
                "class": class_name,
                "confidence": round(top_confidence, 4),
                "speed": {
                    "preprocess_ms": round(preprocess_time, 2),
                    "inference_ms": round(inference_time, 2),
                    "postprocess_ms": round(postprocess_time, 2),
                    "total_ms": round(total_time, 2)
                },
                "image_info": {
                    "original_shape": preprocess_info["original_shape"],
                    "model_input_shape": list(result.orig_shape) if hasattr(result, 'orig_shape') else None
                },
                "top5_predictions": top5_predictions,
                "all_classes_count": len(result.names)
            }
            
        except ValueError as ve:
            raise ve
        except Exception as e:
            raise Exception(f"Prediction failed: {str(e)}")
    
    def predict_batch(self, base64_images: List[str]) -> Dict[str, Any]:
        """
        Predict classifications for multiple images
        
        Args:
            base64_images: List of base64 encoded image strings
            
        Returns:
            Dictionary containing batch prediction results
        """
        total_start = time.time()
        predictions = []
        failed_images = []
        
        for idx, base64_image in enumerate(base64_images):
            try:
                prediction = self.predict_single_image(base64_image)
                prediction["image_index"] = idx
                predictions.append(prediction)
            except Exception as e:
                failed_images.append({
                    "image_index": idx,
                    "error": str(e)
                })
        
        total_time = (time.time() - total_start) * 1000
        
        return {
            "total_images": len(base64_images),
            "successful_predictions": len(predictions),
            "failed_predictions": len(failed_images),
            "total_processing_time_ms": round(total_time, 2),
            "average_time_per_image_ms": round(total_time / len(base64_images), 2) if base64_images else 0,
            "predictions": predictions,
            "errors": failed_images if failed_images else None
        }


# Global instance (singleton pattern)
_prediction_service = None


def get_prediction_service(model_path: str = None) -> PredictionService:
    """
    Get or create prediction service instance (Singleton)
    
    Args:
        model_path: Path to YOLOv8 model (defaults to config.MODEL_PATH)
        
    Returns:
        PredictionService instance
    """
    global _prediction_service
    if _prediction_service is None:
        _prediction_service = PredictionService(model_path)
    return _prediction_service