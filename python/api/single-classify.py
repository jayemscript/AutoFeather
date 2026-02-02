import sys
import os
from ultralytics import YOLO

MODEL_PATH = "../model/final-version/weights/best.pt"

def classify(image_path):
    if not os.path.exists(image_path):
        print(f"Error: file '{image_path}' does not exist")
        return

    model = YOLO(MODEL_PATH)
    
    # Run prediction
    results = model.predict(image_path, imgsz=640)

    for result in results:
        class_id = result.probs.top1
        confidence = result.probs.top1conf.item()
        class_name = model.names[class_id]
        print(f"Class: {class_name}, Confidence: {confidence:.4f}")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python classify.py cls <image_path>")
        sys.exit(1)

    command = sys.argv[1]
    image_path = sys.argv[2]

    if command.lower() == "cls":
        classify(image_path)
    else:
        print(f"Unknown command: {command}")


# how to run
# python single-classify.py cls "C:/Users/Admin/Documents/thesis/dataset/high/img_000001.jpg"