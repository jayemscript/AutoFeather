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
import {
  CreateChickenBreadDto,
  UpdateChickenBreedDto,
} from '../dto/chicken-breed.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { SessionGuard } from 'src/guards/session.guard';
import { User } from 'src/modules/users/entities/user.entity';
import { GetUser } from 'src/decorators/get-user.decorator';
import { ChickenBreedService } from '../services/chicken-breed.service';

@UseGuards(SessionGuard, JwtAuthGuard)
@Controller('chicken-breed')
export class ChickenBreedController {
  constructor(private readonly chickenBreedService: ChickenBreedService) {}

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  async createChickenBreedRecord(
    @Body() createRecord: CreateChickenBreadDto,
    @GetUser() currentUser: User,
  ) {
    const result = await this.chickenBreedService.createChickenBreedRecord(
      createRecord,
      currentUser,
    );
    return {
      status: 'success',
      message: 'chicken breed record created successfully',
      data: result,
    };
  }

  @Patch('update/:id')
  @HttpCode(HttpStatus.OK)
  async updateChickenBreedRecord(
    @Param('id') id: string,
    @Body() updateRecord: UpdateChickenBreedDto,
    @GetUser() currentUser: User,
  ) {
    const result = await this.chickenBreedService.updateChickenBreedRecord(
      id,
      updateRecord,
      currentUser,
    );
    return {
      status: 'success',
      message: 'Updated Record',
      data: result,
    };
  }

  @Get('get-all-paginated')
  @HttpCode(HttpStatus.OK)
  async getAllPaginatedChickenBreed(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('keyword') keyword?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('filters') filters?: string,
  ) {
    const result = await this.chickenBreedService.getAllPaginatedChickenBreed(
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

  @Get('list')
  @HttpCode(HttpStatus.OK)
  async getAllChickenBreedList() {
    const result = await this.chickenBreedService.getAllChickenBreedList();
    return {
      status: 'success',
      message: result.message,
      data: result.data,
    };
  }
}
