import { describe, expect, it } from 'vitest';
import { Timestamp } from 'firebase-admin/firestore';
import {
	defaultBoardExpiration,
	getBoardActivityFields,
	getBoardExpirationFields,
	parseBoardExpiration
} from './board-expiration';

describe('board expiration', () => {
	it('defaults to 30 days', () => {
		expect(defaultBoardExpiration).toBe('30');
		expect(parseBoardExpiration(undefined)).toBe('30');
		expect(parseBoardExpiration('45')).toBe('30');
	});

	it('sets expiresAt from activity', () => {
		const now = Timestamp.fromMillis(Date.UTC(2026, 0, 1));
		const fields = getBoardActivityFields({ get: () => '90' }, now);

		expect(fields.expiration).toBe('90');
		expect(fields.expiresAt).toBeInstanceOf(Timestamp);
		expect((fields.expiresAt as Timestamp).toMillis()).toBe(
			Date.UTC(2026, 0, 1) + 90 * 24 * 60 * 60 * 1000
		);
	});

	it('removes expiresAt when boards should not be deleted', () => {
		const fields = getBoardExpirationFields('never');

		expect(fields.expiration).toBe('never');
		expect(fields.expiresAt).toBeDefined();
	});
});
