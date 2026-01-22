import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  CreateChickenBreadDto,
  UpdateChickenBreedDto,
} from '../dto/chicken-breed.dto';
import { ChickenBreed } from '../entities/chicken-breed.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PatchService } from 'src/utils/services/patch.service';
import { PaginationService } from 'src/utils/services/pagination.service';
import { AuditService } from 'src/modules/audit/audit.service';
import { User } from 'src/modules/users/entities/user.entity';
import { FileUploadService } from 'src/utils/services/file-upload.service';

@Injectable()
export class ChickenBreedService {
  constructor(
    @InjectRepository(ChickenBreed)
    private readonly chickenBreedRepository: Repository<ChickenBreed>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly auditService: AuditService,
    private readonly patchService: PatchService<ChickenBreed>,
    private readonly paginationService: PaginationService<ChickenBreed>,
    private readonly fileUploadService: FileUploadService,
  ) {}

  /** Upload a chicken breed imahe and return URL */
  async uploadImage(file: Buffer, fileName?: string): Promise<string> {
    if (!file) return '';
    return (await this.fileUploadService.uploadFiles(file, {
      folderName: 'chicken_breed_images',
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
  async createChickenBreedRecord(
    createRecord: CreateChickenBreadDto,
    currentUser: User,
  ): Promise<ChickenBreed> {
    const {
      code,
      chickenName,
      image,
      scientificName,
      originCountry,
      description,
      purpose,
      eggColor,
      eggPerYear,
      meatType,
      plumageColor,
      combType,
      averageWeight,
      temperament,
      climateTolerance,
      broodiness,
      preparedBy,
    } = createRecord;

    const preparedByUser = await this.userRepository.findOne({
      where: { id: preparedBy },
    });
    if (!preparedByUser) {
      throw new BadRequestException('Invalid User ID');
    }

    const existingCode = await this.chickenBreedRepository.findOne({
      where: { code },
    });

    if (existingCode) {
      throw new ConflictException('Code already exists');
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
    const fileName = `${code}.${ext}`;

    // Pass filename to upload
    const imageUrl = await this.uploadImage(buffer, fileName);

    const newRecord = this.chickenBreedRepository.create({
      code,
      chickenName,
      image: imageUrl,
      scientificName,
      originCountry,
      description,
      purpose,
      eggColor,
      eggPerYear,
      meatType,
      plumageColor,
      combType,
      averageWeight,
      temperament,
      climateTolerance,
      broodiness,
      preparedBy: preparedByUser,
    });

    const savedRecord = await this.chickenBreedRepository.save(newRecord);

    const TxID = `TX_CHICKEN_BREED-${savedRecord.id}`;

    // Audit logs
    await this.auditService.log({
      transactionId: TxID,
      performedBy: currentUser,
      action: 'CREATE',
      title: `Chicken Breed Record Created ${savedRecord.chickenName}`,
      before: savedRecord,
      after: savedRecord,
    });

    return savedRecord;
  }

  /** UPDATE */
  async updateChickenBreedRecord(
    id: string,
    updateRecord: UpdateChickenBreedDto,
    currentUser: User,
  ): Promise<{
    old_data: Partial<ChickenBreed>;
    new_data: ChickenBreed;
  }> {
    const chickenBreed = await this.chickenBreedRepository.findOne({
      where: { id },
      relations: ['preparedBy'],
    });
    if (!chickenBreed) throw new NotFoundException('record not found');

    const { preparedBy, image, ...rest } = updateRecord;
    const updatedData: Partial<ChickenBreed> = { ...rest };
    let preparedByUser: User | null = chickenBreed.preparedBy;

    if (preparedBy && chickenBreed.preparedBy?.id !== preparedBy) {
      preparedByUser = await this.userRepository.findOne({
        where: { id: preparedBy },
      });
      if (!preparedByUser) {
        throw new BadRequestException('Invalid preparedBy ID');
      }
      updatedData.preparedBy = preparedByUser;
    }

    //Image Update
    if (image) {
      const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      const matches = image.match(/^data:image\/(\w+);base64,/);
      const ext = matches ? matches[1] : 'png';
      const fileName = `${chickenBreed.code}-${Date.now()}.${ext}`;

      const imageUrl = await this.replaceImage(
        chickenBreed.code,
        buffer,
        fileName,
      );
      updatedData.image = imageUrl;
    }

    const patched = await this.patchService.patch(
      this.chickenBreedRepository,
      id,
      updatedData,
      {
        patchBy: 'id',
        title: 'Record Update',
        description: `Chicken Breed ${id} updated`,
        relations: ['preparedBy'],
      },
    );

    const TxID = `TX_CHICKEN_BREED-${patched.new_data.id}`;

    await this.auditService.log({
      transactionId: TxID,
      performedBy: currentUser,
      action: 'CREATE',
      title: `Record Updated: ${patched.new_data.chickenName}`,
      before: patched.old_data,
      after: patched.new_data,
    });

    return {
      old_data: patched.old_data,
      new_data: patched.new_data,
    };
  }

  /** */
  async getAllPaginatedChickenBreed(
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
      this.chickenBreedRepository,
      'chicken_breed',
      {
        page: page || 1,
        limit: limit || 10,
        keyword: keyword || '',
        searchableFields: ['code', 'chickenName', 'scientificName'],
        sortableFields: ['code', 'chickenName'],
        sortBy: (sortBy?.trim() as keyof ChickenBreed) || 'createdAt',
        sortOrder: sortOrder || 'desc',
        dataKey: 'chicken_breed_records',
        relations: ['preparedBy'],
        filters: parsedFilters,
        withDeleted: true,
      },
    );
  }

  async getAllChickenBreedList(): Promise<{
    message: string;
    data: ChickenBreed[];
  }> {
    const chickenBreedList = await this.chickenBreedRepository.find({
      relations: ['preparedBy'],
      order: { id: 'ASC' },
    });

    return {
      message: 'Successfully fetched all records',
      data: chickenBreedList,
    };
  }
}
