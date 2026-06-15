import { describe, it, expect } from 'vitest';
import { formatUsd } from '@/lib/format';

describe('formatUsd', () => {
  it('formatea un entero en dólares', () => {
    expect(formatUsd(120000)).toBe('US$120,000');
  });

  it('redondea a entero (sin centavos en precios de lista)', () => {
    expect(formatUsd(99999.6)).toBe('US$100,000');
  });
});
