import { Module } from '@nestjs/common';

//services
import { ChickenBreedService } from './services/chicken-breed.service';

//controllers
import { ChickenBreedController } from './controllers/chicken-breed.controller';

//modules
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from 'src/shared.module';
import { User } from 'src/modules/users/entities/user.entity';
import { Employee } from '../employee/entities/employee.entity';
import { SocketModule } from 'src/modules/sockets/socket.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuditModule } from '../audit/audit.module';
import { AuthModule } from 'src/modules/auth/auth.module';
import { FileUploadService } from 'src/utils/services/file-upload.service';

//entities
import { ChickenBreed } from './entities/chicken-breed.entity';

@Module({
  controllers: [ChickenBreedController],
  providers: [FileUploadService, ChickenBreedService],
  imports: [
    TypeOrmModule.forFeature([User, ChickenBreed]),
    SharedModule,
    SocketModule,
    NotificationsModule,
    AuditModule,
    AuthModule,
  ],
  exports: [ChickenBreedService],
})
export class PredictModule {}
