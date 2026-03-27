import { describe, it, expect } from 'vitest';
import { cn, formatCurrency } from '@/frontend/lib/utils';

describe('lib/utils', () => {
    it('cn should merge class names correctly', () => {
        const result = cn('text-red-500', 'bg-blue-500');
        expect(result).toContain('text-red-500');
        expect(result).toContain('bg-blue-500');
    });

    it('cn should handle conditional classes', () => {
        const result = cn('text-red-500', false && 'bg-blue-500', 'p-4');
        expect(result).toBe('text-red-500 p-4');
    });

    it('formatCurrency should correctly format numbers as currency', () => {
        const result = formatCurrency(1200, 'EUR');
        expect(result).toBe('€1,200');
    });

    it('formatCurrency should default to USD', () => {
        const result = formatCurrency(50);
        expect(result).toBe('$50');
    });
});
