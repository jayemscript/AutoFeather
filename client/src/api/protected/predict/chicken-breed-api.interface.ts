import { UserData } from '@/interfaces/user-api.interface';

export enum BreedPurposeEnum {
  EGG = 'egg',
  MEAT = 'meat',
  DUAL = 'dual',
}

export interface ChickenBreedInfo {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  version: number;

  code: string;
  chickenName: string;
  image: string;
  scientificName: string;
  originCountry: string;
  description: string;
  purpose: BreedPurposeEnum;
  eggColor: string;
  eggPerYear: number;
  meatType: string;
  plumageColor: string;
  combType: string;
  averageWeight: number;
  temperament: string;
  climateTolerance: string;
  broodiness: boolean;
  preparedBy: UserData | null;
}

export interface ChickenBreedRequest {
  code: string;
  chickenName: string;
  image: string;
  scientificName: string;
  originCountry: string;
  description: string;
  purpose: BreedPurposeEnum;
  eggColor: string;
  eggPerYear: number;
  meatType: string;
  plumageColor: string;
  combType: string;
  averageWeight: number;
  temperament: string;
  climateTolerance: string;
  broodiness: boolean;
  preparedBy: UserData | null;
}

export interface ChickenBreedReponse {
  status: string;
  message: string;
  data: ChickenBreedInfo | null;
}

export interface GetAllPaginatedChickenBreed {
  status: string;
  message: string;
  totalItems: number;
  totalPages: number;
  currentPage: number;
  chicken_breed_records: ChickenBreedInfo[];
}
