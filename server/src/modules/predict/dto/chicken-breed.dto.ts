import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsNumber,
  IsDate,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { BreedPurposeEnum } from '../enums/chicken-breed.enum';
import { PartialType } from '@nestjs/swagger';

export class CreateChickenBreadDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  chickenName: string;

  @IsString()
  @IsOptional()
  image: string;

  @IsString()
  @IsOptional()
  scientificName: string;

  @IsString()
  @IsOptional()
  originCountry: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsNotEmpty()
  @IsEnum(BreedPurposeEnum)
  purpose: BreedPurposeEnum;

  @IsString()
  @IsOptional()
  eggColor: string;

  @IsNumber()
  @IsOptional()
  eggPerYear: number;

  @IsString()
  @IsOptional()
  meatType: string;

  @IsString()
  @IsOptional()
  plumageColor: string;

  @IsString()
  @IsOptional()
  combType: string;

  @IsNumber()
  @IsOptional()
  average_weight: number;

  @IsString()
  @IsOptional()
  temperament: string;

  @IsString()
  @IsOptional()
  climateTolerance: string;

  @IsBoolean()
  broodiness: boolean;

  @IsUUID()
  @IsNotEmpty()
  preparedBy: string;
}

export class UpdateChickenBreedDto extends PartialType(CreateChickenBreadDto) {}
