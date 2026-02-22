'use client';

import axios from '@/configs/axios-instance-client';
import { handleRequest } from '@/configs/api.helper';
import {
  GetAllList,
  GetAllPaginatedParams,
} from '@/interfaces/shared-api.interface';

import {
  PredictionRequest,
  PredictionResponse,
  GetAllPaginatedPrediction,
} from './predict-api.interface';

export async function GetAllPredictionPaginated(
  params: GetAllPaginatedParams,
): Promise<GetAllPaginatedPrediction> {
  return handleRequest(
    axios.get('/predict/get-all-paginated', {
      params: {
        page: params.page,
        limit: params.limit,
        keyword: params.keyword,
        sortBy: params.sortBy,
        sortOrder: params.sortOrder,
        ...(params.filters && { filters: JSON.stringify(params.filters) }),
      },
    }),
  );
}


export async function createPredictionRecord(
  createRecord: PredictionRequest,
): Promise<PredictionResponse> {
  return handleRequest(axios.post('/predict/create', createRecord));
}

export async function deletePermanentlyPredictionRecord(
  id: string,
): Promise<void> {
  return handleRequest(axios.post(`/predict/delete-permanent/${id}`));
}

export async function getAnalytics(): Promise<any> {
  return handleRequest(axios.get('/predict/analytics/summary'));
}
