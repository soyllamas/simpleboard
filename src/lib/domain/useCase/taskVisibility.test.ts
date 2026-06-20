import { describe, expect, it } from 'vitest';
import { isTaskVisibleToday } from './taskVisibility';

describe('task visibility', () => {
	it('shows done tasks updated today', () => {
		const today = new Date('2026-06-19T15:00:00');
		const updatedAt = '2026-06-19T02:00:00';

		expect(isTaskVisibleToday({ status: 'done', updatedAt }, today)).toBe(true);
	});

	it('hides done tasks updated before today', () => {
		const today = new Date('2026-06-19T15:00:00');
		const updatedAt = '2026-06-18T23:59:59';

		expect(isTaskVisibleToday({ status: 'done', updatedAt }, today)).toBe(false);
	});

	it('shows unfinished tasks updated before today', () => {
		const today = new Date('2026-06-19T15:00:00');
		const updatedAt = '2026-06-18T23:59:59';

		expect(isTaskVisibleToday({ status: 'todo', updatedAt }, today)).toBe(true);
	});
});
