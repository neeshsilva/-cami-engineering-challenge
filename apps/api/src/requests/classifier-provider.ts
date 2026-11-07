import { ClassificationResult } from './keyword-classifier';

/**
 * Seam for swapping classifiers (keyword today, an LLM later). Async-capable so a
 * network-backed provider fits without changing callers.
 */
export interface ClassifierProvider {
  /** Stored with each history record so results can be traced to their source. */
  readonly name: string;
  classify(message: string): ClassificationResult | Promise<ClassificationResult>;
}

export const CLASSIFIER_PROVIDER = Symbol('CLASSIFIER_PROVIDER');
