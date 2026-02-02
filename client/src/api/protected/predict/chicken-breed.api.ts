'use client';

import axios from '@/configs/axios-instance-client';
import { handleRequest } from '@/configs/api.helper';
import {
  GetAllList,
  GetAllPaginatedParams,
} from '@/interfaces/shared-api.interface';

import {
  ChickenBreedInfo,
  ChickenBreedRequest,
  ChickenBreedReponse,
  GetAllPaginatedChickenBreed,
} from './chicken-breed-api.interface';

export async function GetAllChickenBreedPaginated(
  params: GetAllPaginatedParams,
): Promise<GetAllPaginatedChickenBreed> {
  return handleRequest(
    axios.get('/chicken-breed/get-all-paginated', {
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

export async function GetAllChickenBreedList(): Promise<GetAllList> {
  return handleRequest(axios.get('/chicken-breed/list'));
}

export async function createChickenBreedRecord(
  createRecord: ChickenBreedRequest,
): Promise<ChickenBreedReponse> {
  return handleRequest(axios.post('/chicken-breed/create', createRecord));
}

export async function updateChickenBreedRecord(
  id: string,
  updateRecord: Partial<ChickenBreedRequest>,
): Promise<any> {
  return handleRequest(axios.patch(`/chicken-breed/update/${id}`, updateRecord));
}

