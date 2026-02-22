### change the code in requiremnts.txt

# for Raspberry pi with AdaFruit for Dht22

```txt
# FastAPI and Web Framework
fastapi==0.109.0
uvicorn[standard]==0.27.0
python-multipart==0.0.9

# YOLOv8 / Ultralytics (compatible with PyTorch 1.13)
ultralytics<9.0.0

# Computer Vision / Image Processing
opencv-python>=4.8.0
Pillow>=10.0.0
numpy==1.26.4

# Data Validation
pydantic>=2.0.0

# Additional Dependencies
PyYAML>=6.0
requests>=2.31.0

# Sensors / Raspberry Pi Hardware
Adafruit-Blinka==8.56.0
adafruit-circuitpython-busdevice==5.2.11
adafruit-circuitpython-connectionmanager==3.1.3
adafruit-circuitpython-dht==4.0.7
adafruit-circuitpython-requests==4.1.10
adafruit-circuitpython-typing==1.11.2
Adafruit-PlatformDetect==3.77.0
Adafruit-PureIO==1.1.11
binho-host-adapter==0.1.6
lgpio==0.2.2.0
pyftdi==0.56.0
pyserial==3.5
pyusb==1.3.1
sysv_ipc==1.1.0
typing_extensions==4.13.1

# PyTorch (CPU, Pi 4 compatible)
torch==1.13.1
torchvision==0.14.1

httpx
```


# For Windows Only

```txt
# FastAPI and Web Framework
fastapi>=0.109.0
uvicorn[standard]>=0.27.0
python-multipart>=0.0.9

# YOLOv8 / Ultralytics
ultralytics<9.0.0

# Computer Vision / Image Processing
opencv-python>=4.8.0
Pillow>=10.0.0
numpy>=2.1.0

# Data Validation
pydantic>=2.0.0

# Additional Dependencies
PyYAML>=6.0
requests>=2.31.0
typing_extensions>=4.13.1

# PyTorch (CPU, Windows compatible)
torch
torchvision

httpx

```