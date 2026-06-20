import { FieldValue, Timestamp } from 'firebase-admin/firestore';

export type BoardExpiration = '30' | '90' | 'never';

const dayInMilliseconds = 24 * 60 * 60 * 1000;

export const defaultBoardExpiration: BoardExpiration = '30';

export function parseBoardExpiration(value: unknown): BoardExpiration {
	if (value === '30' || value === '90' || value === 'never') return value;
	return defaultBoardExpiration;
}

export function getBoardExpiration(snapshot: { get: (field: string) => unknown }) {
	return parseBoardExpiration(snapshot.get('expiration'));
}

export function getBoardExpirationFields(expiration: BoardExpiration, now = Timestamp.now()) {
	if (expiration === 'never') {
		return {
			expiration,
			expiresAt: FieldValue.delete()
		};
	}

	return {
		expiration,
		expiresAt: Timestamp.fromMillis(now.toMillis() + Number(expiration) * dayInMilliseconds)
	};
}

export function getBoardActivityFields(snapshot: { get: (field: string) => unknown }, now = Timestamp.now()) {
	return getBoardExpirationFields(getBoardExpiration(snapshot), now);
}
