import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerRequest } from './customer-request.entity';
import { RequestNote } from './request-note.entity';
import { RequestsController } from './requests.controller';
import { RequestsService } from './requests.service';
import { KeywordClassifier } from './keyword-classifier';
import { ClassificationService } from './classification.service';
import { ClassificationRecord } from './classification-record.entity';
import { CLASSIFIER_PROVIDER } from './classifier-provider';

@Module({
  imports: [TypeOrmModule.forFeature([CustomerRequest, RequestNote, ClassificationRecord])],
  controllers: [RequestsController],
  providers: [
    RequestsService,
    ClassificationService,
    // Swap useClass for an LLM-backed provider; nothing else changes.
    { provide: CLASSIFIER_PROVIDER, useClass: KeywordClassifier },
  ],
})
export class RequestsModule {}
