import {
  Entity,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { BaseEntity } from 'src/shared/entities/base-entity';
import { BreedPurposeEnum } from '../enums/chicken-breed.enum';
import { User } from 'src/modules/users/entities/user.entity';

@Entity('chicken_breed_library')
export class ChickenBreed extends BaseEntity {
  @Column({ name: 'code', unique: true })
  code: string;

  @Column({ name: 'chicken_name' })
  chickenName: string;

  @Column({ name: 'image', type: 'text', nullable: true })
  image?: string;

  @Column({ name: 'scientific_name', nullable: true })
  scientificName?: string;

  @Column({ name: 'origin_country', nullable: true })
  originCountry?: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  // ---- Production traits ----
  @Column({
    name: 'purpose',
    type: 'enum',
    enum: BreedPurposeEnum,
    nullable: true,
  })
  purpose?: BreedPurposeEnum;

  @Column({ name: 'egg_color', nullable: true })
  eggColor?: string;

  @Column({ name: 'egg_per_year', type: 'int', nullable: true })
  eggPerYear?: number;

  @Column({ name: 'meat_type', nullable: true })
  meatType?: string;

  // ---- Physical traits ----
  @Column({ name: 'plumage_color', nullable: true })
  plumageColor?: string;

  @Column({ name: 'comb_type', nullable: true })
  combType?: string;

  @Column({
    name: 'average_weight',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  averageWeight?: number;

  // ---- Behavior & resilience ----
  @Column({ name: 'temperament', nullable: true })
  temperament?: string;

  @Column({ name: 'climate_tolerance', nullable: true })
  climateTolerance?: string;

  @Column({ name: 'broodiness', default: false })
  broodiness: boolean;

  // signatories
  @ManyToOne(() => User, { eager: true, nullable: true })
  @JoinColumn({ name: 'prepared_by_id' })
  preparedBy: User;
}
