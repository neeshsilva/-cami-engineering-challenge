import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import type { ClassificationCategory } from './keyword-classifier';

/** Append-only log of every classification produced, including ad-hoc ones without a request. */
@Entity({ name: 'classification_records' })
export class ClassificationRecord {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'request_id', type: 'uuid', nullable: true })
  requestId!: string | null;

  /** Snapshot of the classified text; the request's message may differ or not exist. */
  @Column({ type: 'text' })
  message!: string;

  @Column({ type: 'varchar', length: 32 })
  category!: ClassificationCategory;

  @Column({ type: 'double precision' })
  confidence!: number;

  @Column({ type: 'varchar', length: 64 })
  provider!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
