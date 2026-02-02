import sys
import os
from ultralytics import YOLO

MODEL_PATH = "../model/final-version/weights/best.pt"

def classify(image_path, model):
    if not os.path.exists(image_path):
        print(f"Error: file '{image_path}' does not exist")
        return

    # Run prediction
    results = model.predict(image_path, imgsz=640)

    for result in results:
        class_id = result.probs.top1
        confidence = result.probs.top1conf.item()
        class_name = model.names[class_id]
        print(f"{os.path.basename(image_path)} -> Class: {class_name}, Confidence: {confidence:.4f}")

def classify_folder(folder_path):
    if not os.path.exists(folder_path):
        print(f"Error: folder '{folder_path}' does not exist")
        return

    # Load model once
    model = YOLO(MODEL_PATH)

    # Get all image files (jpg, jpeg, png)
    supported_exts = (".jpg", ".jpeg", ".png")
    images = [os.path.join(folder_path, f) for f in os.listdir(folder_path) if f.lower().endswith(supported_exts)]

    if not images:
        print(f"No images found in '{folder_path}'")
        return

    for image_path in images:
        classify(image_path, model)

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python multi.py cls <folder_path>")
        sys.exit(1)

    command = sys.argv[1]
    folder_path = sys.argv[2]

    if command.lower() == "cls":
        classify_folder(folder_path)
    else:
        print(f"Unknown command: {command}")


# how to run
# python multi.py cls "C:/Users/Admin/Documents/thesis/dataset/high/"
