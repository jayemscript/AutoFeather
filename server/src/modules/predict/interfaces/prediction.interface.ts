/**
 * Classification Result Interface
 * Represents the response from YOLOv8 Python API
 */
export interface ClassificationResult {
  modelVersion?: string;
  featherDensity: 'LOW' | 'HIGH';
  confidence: number;
  inferenceTimeMs?: number;
  raw?: {
    class: string;
    confidence: number;
    speed: {
      preprocess_ms: number;
      inference_ms: number;
      postprocess_ms: number;
      total_ms: number;
    };
    image_info?: {
      original_shape: number[];
      model_input_shape: number[];
    };
    top5_predictions?: Array<{
      class: string;
      confidence: number;
    }>;
    all_classes_count?: number;
  };
}

/**
 * Fuzzy Logic Result Interface
 * Represents the fertility prediction based on fuzzy logic
 */
export interface FuzzyLogicResult {
  fertilityScore: number; // 0-100
  fertilityLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  ruleStrengths?: Record<string, number>;
  inputs?: {
    featherDensity: 'LOW' | 'HIGH';
    temperature: number;
    humidity?: number;
  };
  explanation?: string;
}

/**
 * Python API Response Interface
 */
export interface PythonPredictResponse {
  status: 'success' | 'failed';
  message: string;
  data: {
    class: string;
    confidence: number;
    speed: {
      preprocess_ms: number;
      inference_ms: number;
      postprocess_ms: number;
      total_ms: number;
    };
    image_info: {
      original_shape: number[];
      model_input_shape: number[];
    };
    top5_predictions: Array<{
      class: string;
      confidence: number;
    }>;
    all_classes_count: number;
  };
}
