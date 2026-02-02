import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
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

@Injectable()
export class PredictionService {
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
  ) {}

  /** Upload a chicken breed imahe and return URL */
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

  /** CREATE */

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
    const preparedByUser = await this.userRepository.findOne({
      where: { id: preparedBy },
    });
    if (!preparedByUser) {
      throw new BadRequestException('Invalid User ID');
    }

    // image upload
    const base64Data = createRecord.image.replace(
      /^data:image\/\w+;base64,/,
      '',
    );

    const buffer = Buffer.from(base64Data, 'base64');
    // Extract extension from base64 (optional, defaults to png)
    const matches = createRecord.image.match(/^data:image\/(\w+);base64,/);
    const ext = matches ? matches[1] : 'png';
    const fileName = `${title}.${ext}`;
    // Pass filename to upload
    const imageUrl = await this.uploadImage(buffer, fileName);

    const newRecord = this.predictRepository.create({
      title,
      image: imageUrl,
      description,
      temperature,
      humidity,
      preparedBy: preparedByUser,
    });

    if (chickenBreed) {
      const chickenBreedEntity = await this.chickenBreedRepository.findOne({
        where: { id: chickenBreed },
      });
      if (!chickenBreedEntity) {
        throw new BadRequestException('Invalid UUID');
      }
      newRecord.chickenBreed = chickenBreedEntity;
    }

    const savedRecord = await this.predictRepository.save(newRecord);

    const TxID = `TX_PREDICT-${savedRecord.id}`;

    // Audit logs
    await this.auditService.log({
      transactionId: TxID,
      performedBy: currentUser,
      action: 'CREATE',
      title: `Prediction Record Created ${savedRecord.title}`,
      before: savedRecord,
      after: savedRecord,
    });

    return savedRecord;
  }

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
        sortableFields: ['title'],
        sortBy: (sortBy?.trim() as keyof PredictionRecords) || 'createdAt',
        sortOrder: sortOrder || 'desc',
        dataKey: 'prediction_records',
        relations: ['preparedBy', 'chickenBreed'],
        filters: parsedFilters,
        withDeleted: true,
      },
    );
  }
}
