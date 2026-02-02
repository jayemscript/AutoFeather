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
import { PartialType } from '@nestjs/swagger';

export class CreatePredictionDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsNotEmpty()
  @IsString()
  chickenBreed: string;

  @IsString()
  @IsNotEmpty()
  image: string;

  @IsNumber()
  @IsOptional()
  temperature: number;

  @IsNumber()
  @IsNotEmpty()
  humidity?: number;

  @IsUUID()
  @IsNotEmpty()
  @IsString()
  preparedBy: string;
}

export class UpdatePredictionDto extends PartialType(CreatePredictionDto) {}
