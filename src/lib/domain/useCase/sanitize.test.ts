import { describe, expect, it } from 'vitest';
import { boardIdMaxLength } from './boardLimits';
import { sanitize } from './sanitize';

describe('sanitize', () => {
	it('creates a board slug', () => {
		expect(sanitize('/Mi Tablero Ágil!')).toBe('/mi-tablero-agil');
	});

	it('limits board slugs', () => {
		const slug = sanitize('a'.repeat(boardIdMaxLength + 1)).slice(1);

		expect(slug).toHaveLength(boardIdMaxLength);
	});
});
