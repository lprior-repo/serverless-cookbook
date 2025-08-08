import { describe, it, expect } from 'vitest';

describe('ESLint Configuration Test', () => {
  it('should pass with functional programming patterns', () => {
    const addNumbers = (a: number) => (b: number): number => a + b;
    const result = addNumbers(2)(3);
    expect(result).toBe(5);
  });
});