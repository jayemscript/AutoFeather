import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from 'src/shared/entities/base-entity';
import { User } from 'src/modules/users/entities/user.entity';
import { ChickenBreed } from '../entities/chicken-breed.entity';

@Entity('prediction_records')
export class PredictionRecords extends BaseEntity {
  @Column({ name: 'title', type: 'varchar', nullable: false })
  title: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'image', type: 'text', nullable: false })
  image: string;

  // Foreign Key: Chicken Breed
  @ManyToOne(() => ChickenBreed, { nullable: true, eager: true })
  @JoinColumn({ name: 'chicken_breed_id' })
  chickenBreed?: ChickenBreed;

  // --------------------
  // IMAGE CLASSIFICATION RESULT (from Python YOLOv8 API)
  // --------------------
  @Column({
    type: 'jsonb',
    nullable: true,
    comment: 'Image classification inference result from YOLOv8',
  })
  classification: {
    modelVersion?: string;
    featherDensity: 'LOW' | 'HIGH';
    confidence: number;
    inferenceTimeMs?: number;
    raw?: {
      class: string;
      confidence: number;
      speed: {
        preprocess_ms: number;
        inference_ms: number;
        postprocess_ms: number;
        total_ms: number;
      };
      image_info?: {
        original_shape: number[];
        model_input_shape: number[];
      };
      top5_predictions?: Array<{
        class: string;
        confidence: number;
      }>;
      all_classes_count?: number;
    };
  };

  // --------------------
  // ENVIRONMENTAL PARAMETERS
  // --------------------
  @Column({ name: 'temperature', type: 'float', nullable: false })
  temperature: number;

  @Column({ name: 'humidity', type: 'float', nullable: true })
  humidity?: number;

  // --------------------
  // FUZZY LOGIC RESULT
  // --------------------
  @Column({
    type: 'jsonb',
    nullable: true,
    comment: 'Fuzzy logic inference result for fertility prediction',
  })
  fuzzyResult: {
    fertilityScore: number; // 0-100
    fertilityLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    ruleStrengths?: Record<string, number>;
    inputs?: {
      featherDensity: 'LOW' | 'HIGH';
      temperature: number;
      humidity?: number;
    };
    explanation?: string;
  };

  // --------------------
  // METADATA
  // --------------------
  @ManyToOne(() => User, { eager: true, nullable: false })
  @JoinColumn({ name: 'prepared_by_id' })
  preparedBy: User;
}
