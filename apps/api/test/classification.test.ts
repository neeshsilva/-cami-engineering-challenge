import { describe, expect, it } from 'vitest';
import { ClassificationService, applyConfidenceRules } from '../src/requests/classification.service';

describe('applyConfidenceRules', () => {
  it('keeps confident results for normal-length messages', () => {
    expect(
      applyConfidenceRules('my invoice is wrong', { category: 'billing', confidence: 0.86 }),
    ).toEqual({ category: 'billing', confidence: 0.86 });
  });

  it('softens confidence for short messages', () => {
    const r = applyConfidenceRules('refund', { category: 'billing', confidence: 0.86 });
    expect(r.category).toBe('billing');
    expect(r.confidence).toBeCloseTo(0.71);
  });

  it('falls back to unknown when softened confidence is weak', () => {
    expect(applyConfidenceRules('help', { category: 'support', confidence: 0.6 })).toEqual({
      category: 'unknown',
      confidence: 0.5,
    });
  });
});

describe('ClassificationService', () => {
  it('uses the injected provider and records the result with its name', async () => {
    const inserted: unknown[] = [];
    const applied: unknown[] = [];
    const provider = { name: 'fake-llm', classify: async () => ({ category: 'sales' as const, confidence: 0.9 }) };
    const service = new ClassificationService(
      provider,
      { applyClassification: async (...args: unknown[]) => applied.push(args) } as never,
      { insert: async (row: unknown) => inserted.push(row) } as never,
    );

    const res = await service.classify('please book a demo', 'req-1');

    expect(res).toEqual({ category: 'sales', confidence: 0.9, requestId: 'req-1' });
    expect(applied).toHaveLength(1);
    expect(inserted).toEqual([
      { requestId: 'req-1', message: 'please book a demo', category: 'sales', confidence: 0.9, provider: 'fake-llm' },
    ]);
  });
});
