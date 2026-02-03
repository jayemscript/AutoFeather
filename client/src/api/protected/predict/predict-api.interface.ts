import { ChickenBreedInfo } from './chicken-breed-api.interface';
import { UserData } from '@/interfaces/user-api.interface';

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

export interface PredictionInfo {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  version: number;
  title: string;
  description: string;
  image: string;
  chickenBreed: ChickenBreedInfo | null;
  temperature: number;
  humidity: number;
  classification: ClassificationResult;
  fuzzyResult: FuzzyLogicResult;
  preparedBy: UserData | null;
}

export interface PredictionRequest {
  title: string;
  description: string;
  image: string;
  chickenBreed: string;
  temperature: number;
  humidity: number;
}

export interface PredictionResponse {
  status: string;
  message: string;
  data: PredictionInfo | null;
}

export interface GetAllPaginatedPrediction {
  status: string;
  message: string;
  totalItems: number;
  totalPages: number;
  currentPage: number;
  prediction_records: PredictionInfo[];
}
