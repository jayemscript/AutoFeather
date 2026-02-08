'use client';

import React, { useState } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SingleImageUploader from '@/components/customs/single-image-uploader';
import WebCam from '@/components/customs/webcam';

interface ImageCaptureProps {
  /**
   * The current image value - can be a base64 string, blob URL, or regular URL
   */
  value?: string;
  /**
   * Callback when image changes - returns base64 string or null
   */
  onChange?: (base64OrNull: string | null) => void;
  /**
   * Maximum file size in MB for uploads
   */
  maxSizeMB?: number;
  /**
   * Whether the component is disabled
   */
  disabled?: boolean;
  /**
   * Custom class name for the container
   */
  className?: string;
}

export default function ImageCapture({
  value,
  onChange,
  maxSizeMB = 5,
  disabled = false,
  className = '',
}: ImageCaptureProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'camera'>('upload');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const handleWebcamCapture = (imageBase64: string) => {
    setCapturedImage(imageBase64);
    onChange?.(imageBase64);
  };

  const handleRemoveCaptured = () => {
    setCapturedImage(null);
    onChange?.(null);
  };

  const handleUploadChange = (base64OrNull: string | null) => {
    onChange?.(base64OrNull);
    // Clear webcam capture if upload is used
    if (base64OrNull) {
      setCapturedImage(null);
    }
  };

  // Determine which image to display
  const displayImage = capturedImage || value;

  return (
    <div className={`w-full ${className}`}>
      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as 'upload' | 'camera')}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload Image
          </TabsTrigger>
          <TabsTrigger value="camera" className="flex items-center gap-2">
            <Camera className="w-4 h-4" />
            Use Camera
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-0">
          <SingleImageUploader
            value={activeTab === 'upload' ? value : undefined}
            onChange={handleUploadChange}
            valueType="base64"
            maxSizeMB={maxSizeMB}
            disabled={disabled}
          />
        </TabsContent>

        <TabsContent value="camera" className="mt-0">
          {capturedImage ? (
            <div className="relative">
              <div className="relative flex min-h-52 flex-col items-center justify-center overflow-hidden rounded-xl border border-input">
                <img
                  src={capturedImage}
                  alt="Captured from camera"
                  className="w-full h-full object-cover"
                />
              </div>
              {!disabled && (
                <div className="absolute top-4 right-4">
                  <button
                    type="button"
                    className="z-50 flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition-[color,box-shadow] outline-none hover:bg-black/80 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    onClick={handleRemoveCaptured}
                    aria-label="Remove captured image"
                  >
                    <X className="size-4" aria-hidden="true" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <WebCam
              onCapture={handleWebcamCapture}
              disabled={disabled}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}