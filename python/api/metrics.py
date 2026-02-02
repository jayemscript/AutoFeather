from ultralytics import YOLO

MODEL_PATH = "../model/final-version/weights/best.pt"
DATA_PATH = r"C:\Users\Admin\Downloads\dataset-split"  # same dataset used for training

def metrics():
    model = YOLO(MODEL_PATH)
    results = model.val(data=DATA_PATH)
    print(results)

if __name__ == "__main__":
    metrics()
