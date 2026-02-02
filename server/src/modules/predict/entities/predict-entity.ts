import { Entity, Column, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from 'src/shared/entities/base-entity';
import { User } from 'src/modules/users/entities/user.entity';
import { ChickenBreed } from '../entities/chicken-breed.entity';

@Entity('prediction_records')
export class PredictionRecords extends BaseEntity {
  @Column({ name: 'title', type: 'varchar', nullable: false })
  title: string;

  @Column({ name: 'descrition', type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'image', type: 'text', nullable: false })
  image: string;

  //FK

  @ManyToOne(() => ChickenBreed, { nullable: true, eager: true })
  @JoinColumn({ name: 'chicken_breed_id' })
  chickenBreed?: ChickenBreed;

  // Image Classfication from api

  @Column({
    type: 'jsonb',
    nullable: true,
    comment: 'Image classficiation Inference Result',
  })
  classification: {
    modelVersion: string;
    featherDensity: 'LOW' | 'HIGH';
    confidence: number;
    inferenceTimeMs?: number;
    raw?: Record<string, any>;
  };

  @Column({ type: 'float' })
  temperature: number;

  @Column({ type: 'float', nullable: true })
  humidity?: number;

  // --------------------
  // FUZZY LOGIC RESULT
  // --------------------
  @Column({
    type: 'jsonb',
    nullable: true,
    comment: 'Fuzzy logic inference result',
  })
  fuzzyResult: {
    fertilityScore: number; // 0–100
    fertilityLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    ruleStrengths?: Record<string, number>;
  };

  @ManyToOne(() => User, { eager: true, nullable: true })
  @JoinColumn({ name: 'prepared_by_id' })
  preparedBy: User;
}
