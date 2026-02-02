"""
Prediction Controller - API Routes
Handles HTTP requests for image classification
"""
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from predict_service import get_prediction_service
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize router
router = APIRouter()

# Initialize prediction service
try:
    prediction_service = get_prediction_service()
except Exception as e:
    logger.error(f"Failed to initialize prediction service: {e}")
    prediction_service = None


# Request Models
class ImageRequest(BaseModel):
    """Model for image classification request"""
    images: List[str] = Field(
        ...,
        description="List of base64 encoded images",
        min_items=1,
        example=["iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="]
    )
    
    @validator('images')
    def validate_images(cls, v):
        """Validate that images list is not empty and contains strings"""
        if not v:
            raise ValueError("Images list cannot be empty")
        
        for idx, img in enumerate(v):
            if not isinstance(img, str):
                raise ValueError(f"Image at index {idx} must be a string")
            if not img.strip():
                raise ValueError(f"Image at index {idx} cannot be empty")
        
        return v


class PredictionData(BaseModel):
    """Model for single prediction data"""
    class_name: str = Field(..., alias="class")
    confidence: float
    speed: Dict[str, float]
    image_info: Dict[str, Any]
    top5_predictions: List[Dict[str, Any]]
    all_classes_count: int
    image_index: Optional[int] = None
    
    class Config:
        populate_by_name = True


class PredictionResponse(BaseModel):
    """Model for prediction response"""
    status: str
    message: str
    data: Dict[str, Any]


# API Endpoints
@router.post(
    "/predict",
    response_model=PredictionResponse,
    status_code=status.HTTP_200_OK,
    summary="Predict image classification",
    description="Classify one or more images using YOLOv8 model"
)
async def predict(request: ImageRequest) -> PredictionResponse:
    """
    Predict image classifications from base64 encoded images
    
    Args:
        request: ImageRequest containing list of base64 images
        
    Returns:
        PredictionResponse with classification results
        
    Raises:
        HTTPException: If prediction service is not initialized or prediction fails
    """
    # Check if service is initialized
    if prediction_service is None:
        logger.error("Prediction service not initialized")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Prediction service is not available"
        )
    
    try:
        logger.info(f"Received prediction request for {len(request.images)} image(s)")
        
        # Predict batch
        result = prediction_service.predict_batch(request.images)
        
        # Check if all predictions failed - RETURN 400 BAD REQUEST
        if result["successful_predictions"] == 0:
            logger.error("All predictions failed")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "status": "failed",
                    "message": "All image predictions failed",
                    "data": result
                }
            )
        
        # Partial or full success
        if result["failed_predictions"] > 0:
            message = f"Images classified with {result['failed_predictions']} error(s)"
            logger.warning(message)
        else:
            message = "Images classified successfully"
            logger.info(message)
        
        return PredictionResponse(
            status="success",
            message=message,
            data=result
        )
        
    except HTTPException:
        # Re-raise HTTPExceptions (like the 400 above)
        raise
    except ValueError as ve:
        logger.error(f"Validation error: {ve}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction failed: {str(e)}"
        )


@router.post(
    "/predict/single",
    response_model=PredictionResponse,
    status_code=status.HTTP_200_OK,
    summary="Predict single image classification",
    description="Classify a single image using YOLOv8 model"
)
async def predict_single(image: str) -> PredictionResponse:
    """
    Predict classification for a single image
    
    Args:
        image: Base64 encoded image string
        
    Returns:
        PredictionResponse with classification result
    """
    # Check if service is initialized
    if prediction_service is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Prediction service is not available"
        )
    
    try:
        logger.info("Received single image prediction request")
        
        # Predict single image
        result = prediction_service.predict_single_image(image)
        
        return PredictionResponse(
            status="success",
            message="Image classified successfully",
            data=result
        )
        
    except ValueError as ve:
        logger.error(f"Validation error: {ve}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction failed: {str(e)}"
        )


@router.get(
    "/model/info",
    summary="Get model information",
    description="Get information about the loaded YOLOv8 model"
)
async def get_model_info():
    """Get information about the loaded model"""
    if prediction_service is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Prediction service is not available"
        )
    
    try:
        model = prediction_service.model
        
        return {
            "status": "success",
            "message": "Model information retrieved",
            "data": {
                "model_type": "YOLOv8 Classification",
                "task": "classify",
                "classes_count": len(model.names) if hasattr(model, 'names') else None,
                "model_name": model.model_name if hasattr(model, 'model_name') else "Unknown"
            }
        }
    except Exception as e:
        logger.error(f"Error getting model info: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get model information: {str(e)}"
        )