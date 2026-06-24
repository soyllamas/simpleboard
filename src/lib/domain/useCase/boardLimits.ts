export const boardIdMaxLength = 64;
export const taskIdMaxLength = 128;
export const taskTitleMaxLength = 2_000;
export const boardTaskMaxCount = 300;
export const boardIdPattern = /^[a-z0-9-]+$/;

export function normalizeTaskTitle(value: string) {
	return value.trim().slice(0, taskTitleMaxLength);
}
