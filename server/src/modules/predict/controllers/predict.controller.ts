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
    };
  }

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
}
