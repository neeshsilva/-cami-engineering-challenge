import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClassificationCategory, ClassificationResult } from './keyword-classifier';
import { CLASSIFIER_PROVIDER, ClassifierProvider } from './classifier-provider';
import { ClassificationRecord } from './classification-record.entity';
import { RequestsService } from './requests.service';

export const MAX_MESSAGE_LENGTH = 2000;
export const DEFAULT_HISTORY_LIMIT = 50;
export const MAX_HISTORY_LIMIT = 200;

export type ClassifyResponse = ClassificationResult & { requestId: string | null };

export type HistoryItem = {
  id: string;
  requestId: string | null;
  message: string;
  category: ClassificationCategory;
  confidence: number;
  provider: string;
  createdAt: string;
};

export type HistoryFilter = { category?: ClassificationCategory; limit: number };

/** Business rules applied on top of the raw classifier output. Pure, so it is unit-tested directly. */
export function applyConfidenceRules(
  message: string,
  raw: ClassificationResult,
): ClassificationResult {
  let result = raw;

  // Soften confidence for very short messages.
  if (message.split(/\s+/).length < 3 && result.category !== 'unknown') {
    result = { category: result.category, confidence: Math.max(0.5, result.confidence - 0.15) };
  }

  // Prefer "unknown" when confidence is weak.
  if (result.confidence < 0.55) {
    result = { category: 'unknown', confidence: result.confidence };
  }

  return result;
}

@Injectable()
export class ClassificationService {
  constructor(
    @Inject(CLASSIFIER_PROVIDER) private readonly classifier: ClassifierProvider,
    private readonly requestsService: RequestsService,
    @InjectRepository(ClassificationRecord)
    private readonly records: Repository<ClassificationRecord>,
  ) {}

  /** `message` must already be trimmed and validated (see controller). */
  async classify(message: string, requestId?: string): Promise<ClassifyResponse> {
    const result = applyConfidenceRules(message, await this.classifier.classify(message));

    // Runs first so an unknown requestId 404s before anything is recorded.
    if (requestId) {
      await this.requestsService.applyClassification(requestId, result);
    }

    // ponytail: not in one transaction with applyClassification; a failed insert leaves the
    // request updated without a history row. Wrap both in a transaction if history must be exact.
    await this.records.insert({
      requestId: requestId ?? null,
      message,
      category: result.category,
      confidence: result.confidence,
      provider: this.classifier.name,
    });

    return { ...result, requestId: requestId ?? null };
  }

  async history({ category, limit }: HistoryFilter): Promise<HistoryItem[]> {
    const rows = await this.records.find({
      where: category ? { category } : {},
      order: { createdAt: 'DESC' },
      take: limit,
    });
    return rows.map((r) => ({
      id: r.id,
      requestId: r.requestId,
      message: r.message,
      category: r.category,
      confidence: r.confidence,
      provider: r.provider,
      createdAt: r.createdAt.toISOString(),
    }));
  }
}
