import type { Task, TaskDate } from '$lib/domain/entity/task';

export function isTaskVisibleToday(task: Pick<Task, 'status' | 'updatedAt'>, today = new Date()) {
	if (task.status !== 'done') return true;

	const updatedAt = getTaskDate(task.updatedAt);
	if (!updatedAt) return true;

	return updatedAt >= getStartOfDay(today);
}

export function getTaskUpdatedAtTime(task: Pick<Task, 'updatedAt'>) {
	return getTaskDate(task.updatedAt)?.getTime() ?? null;
}

function getStartOfDay(date: Date) {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getTaskDate(value: TaskDate | undefined) {
	if (!value) return undefined;
	if (value instanceof Date) return value;
	if (typeof value === 'string' || typeof value === 'number') return getValidDate(value);
	if ('toDate' in value) return value.toDate();
	if ('seconds' in value) return new Date(value.seconds * 1000);
}

function getValidDate(value: string | number) {
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? undefined : date;
}
