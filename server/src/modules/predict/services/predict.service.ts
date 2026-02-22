import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PredictionRecords } from '../entities/predict-entity';
import { User } from 'src/modules/users/entities/user.entity';
import { ChickenBreed } from '../entities/chicken-breed.entity';
import { CreatePredictionDto, UpdatePredictionDto } from '../dto/predict.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PatchService } from 'src/utils/services/patch.service';
import { PaginationService } from 'src/utils/services/pagination.service';
import { AuditService } from 'src/modules/audit/audit.service';
import { FileUploadService } from 'src/utils/services/file-upload.service';
import { PythonApiService } from './python-api.service';
import { FuzzyLogicService } from './fuzzy-logic.service';
import {
  ClassificationResult,
  FuzzyLogicResult,
} from '../interfaces/prediction.interface';

@Injectable()
export class PredictionService {
  private readonly logger = new Logger(PredictionService.name);

  constructor(
    @InjectRepository(PredictionRecords)
    private readonly predictRepository: Repository<PredictionRecords>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ChickenBreed)
    private readonly chickenBreedRepository: Repository<ChickenBreed>,
    private readonly auditService: AuditService,
    private readonly patchService: PatchService<PredictionRecords>,
    private readonly paginationService: PaginationService<PredictionRecords>,
    private readonly fileUploadService: FileUploadService,
    private readonly pythonApiService: PythonApiService,
    private readonly fuzzyLogicService: FuzzyLogicService,
  ) {}

  /** Upload a chicken breed image and return URL */
  async uploadImage(file: Buffer, fileName?: string): Promise<string> {
    if (!file) return '';
    return (await this.fileUploadService.uploadFiles(file, {
      folderName: 'prediction_images',
      fileNames: fileName ? [fileName] : undefined,
      isMultiple: false,
    })) as string;
  }

  /** Replace existing image */
  async replaceImage(
    oldImageUrl: string,
    newFile: Buffer,
    fileName?: string,
  ): Promise<string> {
    if (oldImageUrl) {
      await this.fileUploadService.deleteFile(oldImageUrl);
    }
    return await this.uploadImage(newFile, fileName);
  }

  /**
   * Map YOLOv8 class name to feather density
   * Customize this based on your actual class names from the model
   */
  private mapClassToFeatherDensity(className: string): 'LOW' | 'HIGH' {
    const lowerClass = className.toLowerCase();

    // Example mappings - adjust based on your actual model classes
    if (lowerClass.includes('sparse') || lowerClass.includes('low')) {
      return 'LOW';
    }
    if (lowerClass.includes('dense') || lowerClass.includes('high')) {
      return 'HIGH';
    }

    // Default fallback based on first letter or other logic
    // You should customize this based on your model's output classes
    this.logger.warn(
      `Unknown class "${className}", defaulting to HIGH feather density`,
    );
    return 'HIGH';
  }

  /**
   * Process image classification and fuzzy logic inference
   */
  private async processClassificationAndFuzzy(
    base64Image: string,
    temperature: number,
    humidity?: number,
  ): Promise<{
    classification: ClassificationResult;
    fuzzyResult: FuzzyLogicResult;
  }> {
    // Step 1: Call Python API for image classification
    this.logger.log('Calling Python API for feather density classification...');
    const pythonResponse =
      await this.pythonApiService.predictSingleImage(base64Image);

    // Step 2: Map classification result
    const featherDensity = this.mapClassToFeatherDensity(
      pythonResponse.data.class,
    );

    const classification: ClassificationResult = {
      modelVersion: 'YOLOv8-custom',
      featherDensity,
      confidence: pythonResponse.data.confidence,
      inferenceTimeMs: pythonResponse.data.speed.total_ms,
      raw: pythonResponse.data,
    };

    this.logger.log(
      `Classification complete: ${featherDensity} density (${(classification.confidence * 100).toFixed(2)}% confidence)`,
    );

    // Step 3: Apply fuzzy logic for fertility prediction
    this.logger.log('Applying fuzzy logic for fertility prediction...');
    const fuzzyResult = await this.fuzzyLogicService.inferFertility(
      featherDensity,
      temperature,
      humidity,
    );

    return { classification, fuzzyResult };
  }

  /** CREATE with AI prediction and fuzzy logic */
  async createPredictionRecord(
    createRecord: CreatePredictionDto,
    currentUser: User,
  ): Promise<PredictionRecords> {
    const {
      title,
      description,
      image,
      chickenBreed,
      temperature,
      humidity,
      preparedBy,
    } = createRecord;

    // Validate user
    const preparedByUser = await this.userRepository.findOne({
      where: { id: preparedBy },
    });
    if (!preparedByUser) {
      throw new BadRequestException('Invalid User ID');
    }

    // Step 1: Upload image
    this.logger.log('Processing image upload...');
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const matches = image.match(/^data:image\/(\w+);base64,/);
    const ext = matches ? matches[1] : 'png';
    const fileName = `${title.replace(/\s+/g, '_')}_${Date.now()}.${ext}`;
    const imageUrl = await this.uploadImage(buffer, fileName);

    // Step 2: Get classification and fuzzy logic results
    this.logger.log('Getting AI classification and fuzzy logic results...');
    const { classification, fuzzyResult } =
      await this.processClassificationAndFuzzy(
        image, // Send original base64 with data URI
        temperature,
        humidity,
      );

    // Step 3: Create prediction record
    const newRecord = this.predictRepository.create({
      title,
      image: imageUrl,
      description,
      temperature,
      humidity,
      preparedBy: preparedByUser,
      classification, // Store classification result
      fuzzyResult, // Store fuzzy logic result
    });

    // Step 4: Link chicken breed if provided
    if (chickenBreed) {
      const chickenBreedEntity = await this.chickenBreedRepository.findOne({
        where: { id: chickenBreed },
      });
      if (!chickenBreedEntity) {
        throw new BadRequestException('Invalid Chicken Breed UUID');
      }
      newRecord.chickenBreed = chickenBreedEntity;
    }

    // Step 5: Save to database
    const savedRecord = await this.predictRepository.save(newRecord);
    this.logger.log(`Prediction record saved: ${savedRecord.id}`);

    // Step 6: Audit log
    const TxID = `TX_PREDICT-${savedRecord.id}`;
    await this.auditService.log({
      transactionId: TxID,
      performedBy: currentUser,
      action: 'CREATE',
      title: `Prediction Record Created: ${savedRecord.title}`,
      before: null,
      after: savedRecord,
    });

    return savedRecord;
  }

  /** Get all paginated prediction records */
  async getAllPaginatedPredictionRecord(
    page?: number,
    limit?: number,
    keyword?: string,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc',
    filters?: string | Record<string, any> | Record<string, any>[],
  ) {
    let parsedFilters: Record<string, any> | Record<string, any>[] = {};
    if (filters) {
      if (typeof filters === 'string') {
        try {
          parsedFilters = JSON.parse(filters);
        } catch (err) {
          throw new BadRequestException(
            `Invalid JSON or Invalid variable type in 'filters' : ${err.message}`,
          );
        }
      } else {
        parsedFilters = filters;
      }
    }

    return this.paginationService.paginate(
      this.predictRepository,
      'prediction_record',
      {
        page: page || 1,
        limit: limit || 10,
        keyword: keyword || '',
        searchableFields: ['title'],
        sortableFields: ['title', 'createdAt', 'temperature'],
        sortBy: (sortBy?.trim() as keyof PredictionRecords) || 'createdAt',
        sortOrder: sortOrder || 'desc',
        dataKey: 'prediction_records',
        relations: ['preparedBy', 'chickenBreed'],
        filters: parsedFilters,
        withDeleted: true,
      },
    );
  }

  /**
   * Get single prediction record by ID
   */
  async getPredictionById(id: string): Promise<PredictionRecords> {
    const record = await this.predictRepository.findOne({
      where: { id },
      relations: ['preparedBy', 'chickenBreed'],
    });

    if (!record) {
      throw new NotFoundException(`Prediction record with ID ${id} not found`);
    }

    return record;
  }

  /**
   * Re-run fuzzy logic analysis for existing record
   * Useful if you update temperature/humidity or want to recalculate
   */
  async recomputeFuzzyLogic(id: string): Promise<PredictionRecords> {
    const record = await this.getPredictionById(id);

    if (!record.classification) {
      throw new BadRequestException(
        'Cannot recompute fuzzy logic: No classification data available',
      );
    }

    // Recompute fuzzy logic
    const fuzzyResult = await this.fuzzyLogicService.inferFertility(
      record.classification.featherDensity,
      record.temperature,
      record.humidity,
    );

    // Update record
    record.fuzzyResult = fuzzyResult;
    const updated = await this.predictRepository.save(record);

    this.logger.log(`Fuzzy logic recomputed for record ${id}`);
    return updated;
  }

  async deletePermanent(id: string, currentUser: User) {
    if (!id) {
      throw new BadRequestException('ID is required');
    }

    const record = await this.predictRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!record) {
      throw new NotFoundException(`Prediction record with ID ${id} not found`);
    }

    if (record.image) {
      await this.fileUploadService.deleteFile(record.image);
      this.logger.log(`Deleted image file for record ${id}`);
    }

    const TxID = `TX_PREDICT-DELETE-${record.id}`;
    await this.auditService.log({
      transactionId: TxID,
      performedBy: currentUser,
      action: 'DELETE',
      title: `Prediction Record Permanently Deleted: ${record.title}`,
      before: record,
      after: null,
    });

    await this.predictRepository.delete(record.id);

    return {
      deletedId: record.id,
    };
  }


  async getAnalytics() {
  const records = await this.predictRepository.find({
    relations: ['chickenBreed'],
    withDeleted: false,
  });

  // --- Feather Density Distribution ---
  const featherDensityCounts = { LOW: 0, HIGH: 0 };
  for (const r of records) {
    if (r.classification?.featherDensity) {
      featherDensityCounts[r.classification.featherDensity]++;
    }
  }

  // --- Fertility Level Distribution ---
  const fertilityLevelCounts = { LOW: 0, MEDIUM: 0, HIGH: 0 };
  for (const r of records) {
    if (r.fuzzyResult?.fertilityLevel) {
      fertilityLevelCounts[r.fuzzyResult.fertilityLevel]++;
    }
  }

  // --- Average Fertility Score Over Time (by date) ---
  const scoreByDate: Record<string, { total: number; count: number }> = {};
  for (const r of records) {
    const date = r.createdAt.toISOString().split('T')[0]; // YYYY-MM-DD
    if (!scoreByDate[date]) scoreByDate[date] = { total: 0, count: 0 };
    if (r.fuzzyResult?.fertilityScore != null) {
      scoreByDate[date].total += r.fuzzyResult.fertilityScore;
      scoreByDate[date].count++;
    }
  }
  const fertilityScoreOverTime = Object.entries(scoreByDate)
    .map(([date, { total, count }]) => ({
      date,
      averageFertilityScore: parseFloat((total / count).toFixed(2)),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // --- Average Temperature & Humidity per Fertility Level ---
  const envByLevel: Record<string, { tempTotal: number; humTotal: number; count: number }> = {
    LOW: { tempTotal: 0, humTotal: 0, count: 0 },
    MEDIUM: { tempTotal: 0, humTotal: 0, count: 0 },
    HIGH: { tempTotal: 0, humTotal: 0, count: 0 },
  };
  for (const r of records) {
    const level = r.fuzzyResult?.fertilityLevel;
    if (level && envByLevel[level]) {
      envByLevel[level].tempTotal += r.temperature ?? 0;
      envByLevel[level].humTotal += r.humidity ?? 0;
      envByLevel[level].count++;
    }
  }
  const environmentalByFertility = Object.entries(envByLevel).map(
    ([level, { tempTotal, humTotal, count }]) => ({
      fertilityLevel: level,
      avgTemperature: count ? parseFloat((tempTotal / count).toFixed(2)) : 0,
      avgHumidity: count ? parseFloat((humTotal / count).toFixed(2)) : 0,
      count,
    }),
  );

  // --- Records per Chicken Breed ---
  const breedCounts: Record<string, number> = {};
  for (const r of records) {
    const breedName = r.chickenBreed?.chickenName ?? 'Unknown';
    breedCounts[breedName] = (breedCounts[breedName] ?? 0) + 1;
  }
  const recordsPerBreed = Object.entries(breedCounts).map(([breed, count]) => ({
    breed,
    count,
  }));

  // --- Confidence Distribution (binned: 0-25, 25-50, 50-75, 75-100) ---
  const confidenceBins = { '0-25': 0, '25-50': 0, '50-75': 0, '75-100': 0 };
  for (const r of records) {
    const conf = (r.classification?.confidence ?? 0) * 100;
    if (conf <= 25) confidenceBins['0-25']++;
    else if (conf <= 50) confidenceBins['25-50']++;
    else if (conf <= 75) confidenceBins['50-75']++;
    else confidenceBins['75-100']++;
  }
  const confidenceDistribution = Object.entries(confidenceBins).map(
    ([range, count]) => ({ range, count }),
  );

  return {
    totalRecords: records.length,
    featherDensityDistribution: featherDensityCounts,         // Pie / Donut chart
    fertilityLevelDistribution: fertilityLevelCounts,         // Bar / Pie chart
    fertilityScoreOverTime,                                    // Line chart
    environmentalByFertility,                                  // Grouped bar chart
    recordsPerBreed,                                           // Bar chart
    confidenceDistribution,                                    // Bar / Histogram
  };
}
}
