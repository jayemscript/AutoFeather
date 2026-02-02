import { ChickenBreedInfo } from './chicken-breed-api.interface';

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
}

export interface PredictionRequest {
  title: string;
  description: string;
  image: string;
  chickenBreed: ChickenBreedInfo | null;
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