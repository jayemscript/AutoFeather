'use client';

import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, X, RotateCcw, Video, VideoOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface WebCamProps {
  onCapture?: (imageBase64: string) => void;
  disabled?: boolean;
  className?: string;
}

const videoConstraints = {
  width: 1280,
  height: 720,
  facingMode: 'environment',
};

export default function WebCam({
  onCapture,
  disabled = false,
  className = '',
}: WebCamProps) {
  const webcamRef = useRef<Webcam>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  const handleUserMedia = useCallback(() => {
    setIsCameraReady(true);
    setCameraError(null);
  }, []);

  const handleUserMediaError = useCallback((error: string | DOMException) => {
    console.error('Camera error:', error);
    setIsCameraReady(false);
    
    if (typeof error === 'string') {
      setCameraError(error);
    } else if (error.name === 'NotAllowedError') {
      setCameraError('Camera access denied. Please allow camera permissions.');
    } else if (error.name === 'NotFoundError') {
      setCameraError('No camera found on this device.');
    } else {
      setCameraError('Unable to access camera. Please check your device settings.');
    }
  }, []);

  const capturePhoto = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setCapturedImage(imageSrc);
        onCapture?.(imageSrc);
        setShowCamera(false);
      }
    }
  }, [onCapture]);

  const retake = useCallback(() => {
    setCapturedImage(null);
    setShowCamera(true);
    setIsCameraReady(false);
  }, []);

  const handleRemove = useCallback(() => {
    setCapturedImage(null);
    onCapture?.(null);
    setShowCamera(false);
  }, [onCapture]);

  const startCamera = useCallback(() => {
    setShowCamera(true);
    setCameraError(null);
  }, []);

  const stopCamera = useCallback(() => {
    setShowCamera(false);
    setIsCameraReady(false);
  }, []);

  return (
    <div className={`w-full ${className}`}>
      <div className="relative w-full bg-black rounded-xl overflow-hidden border border-input">
        {capturedImage ? (
          // CAPTURED IMAGE PREVIEW
          <div className="relative w-full aspect-video">
            <img
              src={capturedImage}
              alt="Captured"
              className="w-full h-full object-contain"
            />
            <div className="absolute top-4 right-4 flex gap-2">
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="bg-black/70 hover:bg-black/90 text-white border border-white/20"
                onClick={retake}
                disabled={disabled}
                title="Retake photo"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="destructive"
                className="bg-red-600/70 hover:bg-red-600/90 border border-white/20"
                onClick={handleRemove}
                disabled={disabled}
                title="Remove photo"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : showCamera ? (
          // LIVE CAMERA FEED
          <div className="relative w-full aspect-video">
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              onUserMedia={handleUserMedia}
              onUserMediaError={handleUserMediaError}
              className="w-full h-full object-contain"
              mirrored={false}
            />
            
            {/* Camera Status Indicator */}
            {!isCameraReady && !cameraError && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="text-white text-center">
                  <Video className="w-12 h-12 mx-auto mb-2 animate-pulse" />
                  <p>Loading camera...</p>
                </div>
              </div>
            )}

            {/* Camera Ready - Show Controls */}
            {isCameraReady && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
                <Button
                  type="button"
                  size="lg"
                  onClick={capturePhoto}
                  disabled={disabled}
                  className="bg-primary hover:bg-primary/90 shadow-lg"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Capture Photo
                </Button>
                <Button
                  type="button"
                  size="lg"
                  variant="secondary"
                  onClick={stopCamera}
                  disabled={disabled}
                  className="shadow-lg"
                >
                  <VideoOff className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            )}
          </div>
        ) : (
          // START CAMERA SCREEN
          <div className="flex flex-col items-center justify-center aspect-video p-8 bg-muted/30">
            <div className="mb-4 flex size-20 items-center justify-center rounded-full border-2 bg-background shadow-sm">
              <Camera className="size-10 text-primary" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Camera Capture</h3>
            <p className="mb-6 text-sm text-muted-foreground text-center max-w-xs">
              Click below to start your camera and capture a photo
            </p>
            <Button
              type="button"
              onClick={startCamera}
              disabled={disabled}
              size="lg"
              className="shadow-md"
            >
              <Video className="w-4 h-4 mr-2" />
              Start Camera
            </Button>
          </div>
        )}
      </div>

      {/* Error Alert */}
      {cameraError && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription className="flex items-start gap-2">
            <VideoOff className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Camera Error</p>
              <p className="text-sm">{cameraError}</p>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}