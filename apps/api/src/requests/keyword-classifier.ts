import { Injectable } from '@nestjs/common';
import type { ClassifierProvider } from './classifier-provider';

export const CLASSIFICATION_CATEGORIES = ['support', 'sales', 'billing', 'unknown'] as const;
export type ClassificationCategory = (typeof CLASSIFICATION_CATEGORIES)[number];

export type ClassificationResult = {
  category: ClassificationCategory;
  confidence: number;
};

/** Deterministic keyword classifier; the default ClassifierProvider. */
@Injectable()
export class KeywordClassifier implements ClassifierProvider {
  readonly name = 'keyword-v1';

  classify(message: string): ClassificationResult {
    const text = message.toLowerCase();

    if (/bill|invoice|payment|refund|charge/.test(text)) {
      return { category: 'billing', confidence: 0.86 };
    }
    if (/buy|pricing|demo|sales|upgrade|plan/.test(text)) {
      return { category: 'sales', confidence: 0.8 };
    }
    if (/help|broken|error|issue|support|bug/.test(text)) {
      return { category: 'support', confidence: 0.78 };
    }

    return { category: 'unknown', confidence: 0.4 };
  }
}
