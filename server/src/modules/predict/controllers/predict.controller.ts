import {
  Controller,
  Get,
  Post,
  Patch,
  HttpCode,
  HttpStatus,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CreatePredictionDto } from '../dto/predict.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { SessionGuard } from 'src/guards/session.guard';
import { User } from 'src/modules/users/entities/user.entity';
import { GetUser } from 'src/decorators/get-user.decorator';
import { PredictionService } from '../services/predict.service';

@UseGuards(SessionGuard, JwtAuthGuard)
@Controller('predict')
export class PredictionController {
  constructor(private readonly predictService: PredictionService) {}

  /**
   * Create new prediction record
   * - Uploads image
   * - Calls Python API for feather density classification
   * - Applies fuzzy logic for fertility prediction
   * - Stores results in database
   */
  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  async createPredictionRecord(
    @Body() createRecord: CreatePredictionDto,
    @GetUser() currentUser: User,
  ) {
    const result = await this.predictService.createPredictionRecord(
      createRecord,
      currentUser,
    );

    return {
      status: 'success',
      message: 'Prediction Record Created successfully',
      data: result,
      insights: {
        featherDensity: result.classification?.featherDensity,
        confidence: result.classification?.confidence,
        fertilityLevel: result.fuzzyResult?.fertilityLevel,
        fertilityScore: result.fuzzyResult?.fertilityScore,
        explanation: result.fuzzyResult?.explanation,
      },
    };
  }

  /**
   * Get all prediction records with pagination
   */
  @Get('get-all-paginated')
  @HttpCode(HttpStatus.OK)
  async getAllPaginatedPredictionRecord(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('keyword') keyword?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('filters') filters?: string,
  ) {
    const result = await this.predictService.getAllPaginatedPredictionRecord(
      page ? parseInt(page, 10) : undefined,
      limit ? parseInt(limit, 10) : undefined,
      keyword,
      sortBy,
      sortOrder,
      filters,
    );

    return {
      status: 'success',
      message: 'All Records Fetched Successfully',
      ...result,
    };
  }

  /**
   * Get single prediction record by ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getPredictionById(@Param('id') id: string) {
    const result = await this.predictService.getPredictionById(id);

    return {
      status: 'success',
      message: 'Record Fetched Successfully',
      data: result,
    };
  }

  /**
   * Recompute fuzzy logic for existing record
   * Useful if temperature/humidity is updated or you want to recalculate
   */
  @Post(':id/recompute-fuzzy')
  @HttpCode(HttpStatus.OK)
  async recomputeFuzzyLogic(
    @Param('id') id: string,
    @GetUser() currentUser: User,
  ) {
    const result = await this.predictService.recomputeFuzzyLogic(id);

    return {
      status: 'success',
      message: 'Fuzzy logic recomputed successfully',
      data: result,
      insights: {
        fertilityLevel: result.fuzzyResult?.fertilityLevel,
        fertilityScore: result.fuzzyResult?.fertilityScore,
        explanation: result.fuzzyResult?.explanation,
      },
    };
  }
}
