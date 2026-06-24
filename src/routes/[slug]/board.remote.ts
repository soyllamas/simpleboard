import * as v from 'valibot';
import { command } from '$app/server';
import { error } from '@sveltejs/kit';
import {
	getBoardActivityFields,
	getBoardExpirationFields,
	type BoardExpiration
} from '$lib/server/board-expiration';
import { firestore } from '$lib/server/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import {
	boardIdMaxLength,
	boardIdPattern,
	boardTaskMaxCount,
	taskIdMaxLength,
	taskTitleMaxLength
} from '$lib/domain/useCase/boardLimits';

type ServerTask = {
	id: string;
	status: 'todo' | 'doing' | 'done';
	title: string;
	updatedAt?: Timestamp;
};

const boardIdSchema = v.pipe(
	v.string(),
	v.minLength(1),
	v.maxLength(boardIdMaxLength),
	v.regex(boardIdPattern)
);
const taskIdSchema = v.pipe(v.string(), v.minLength(1), v.maxLength(taskIdMaxLength));
const taskTitleSchema = v.pipe(v.string(), v.trim(), v.minLength(1), v.maxLength(taskTitleMaxLength));
const taskInputSchema = v.object({
	id: taskIdSchema,
	status: v.picklist(['todo', 'doing', 'done']),
	title: taskTitleSchema
});

const taskSchema = v.object({
	boardId: boardIdSchema,
	task: taskInputSchema
});

const tasksSchema = v.object({
	boardId: boardIdSchema,
	tasks: v.pipe(v.array(taskInputSchema), v.maxLength(boardTaskMaxCount))
});

const deleteTaskSchema = v.object({
	boardId: boardIdSchema,
	taskId: taskIdSchema
});

const expirationSchema = v.object({
	boardId: boardIdSchema,
	expiration: v.picklist(['30', '90', 'never'])
});

type TaskInput = Omit<ServerTask, 'updatedAt'>;

function normalizeTask(task: TaskInput, existingTask?: ServerTask, now = Timestamp.now()): ServerTask {
	const title = task.title.trim();
	const changed = existingTask?.status !== task.status || existingTask?.title !== title;
	const updatedAt = !existingTask || changed ? now : existingTask.updatedAt;

	const normalizedTask: ServerTask = {
		id: task.id,
		status: task.status,
		title
	};

	if (updatedAt) normalizedTask.updatedAt = updatedAt;

	return normalizedTask;
}

function assertCanAddTask(tasks: ServerTask[]) {
	if (tasks.length >= boardTaskMaxCount) {
		throw error(400, `Boards can have up to ${boardTaskMaxCount} tasks`);
	}
}

export const createTask = command(taskSchema, async ({ boardId, task }) => {
	const boardRef = firestore.doc(`boards/${boardId}`);
	const snapshot = await boardRef.get();
	const existingTasks = (snapshot.get('tasks') ?? []) as ServerTask[];

	assertCanAddTask(existingTasks);

	const normalizedTask = normalizeTask(task);
	const updatedTasks = [normalizedTask, ...existingTasks];

	await boardRef.set({ tasks: updatedTasks, ...getBoardActivityFields(snapshot) }, { merge: true });
});

export const updateTask = command(taskSchema, async ({ boardId, task }) => {
	const boardRef = firestore.doc(`boards/${boardId}`);
	const snapshot = await boardRef.get();
	const existingTasks = (snapshot.get('tasks') ?? []) as ServerTask[];

	const normalizedTask = normalizeTask(task, existingTasks.find((t) => t.id === task.id));
	const updatedTasks = existingTasks.map((t) =>
		t.id === normalizedTask.id ? normalizedTask : t
	);

	await boardRef.set({ tasks: updatedTasks, ...getBoardActivityFields(snapshot) }, { merge: true });
});

export const deleteTask = command(deleteTaskSchema, async ({ boardId, taskId }) => {
	const boardRef = firestore.doc(`boards/${boardId}`);
	const snapshot = await boardRef.get();
	const existingTasks = (snapshot.get('tasks') ?? []) as ServerTask[];

	const updatedTasks = existingTasks.filter((t) => t.id !== taskId);

	await boardRef.set({ tasks: updatedTasks, ...getBoardActivityFields(snapshot) }, { merge: true });
});

export const reorderTasks = command(tasksSchema, async ({ boardId, tasks }) => {
	const boardRef = firestore.doc(`boards/${boardId}`);
	const snapshot = await boardRef.get();
	const existingTasks = (snapshot.get('tasks') ?? []) as ServerTask[];
	const existingTasksById = new Map(existingTasks.map((task) => [task.id, task]));
	const now = Timestamp.now();
	const normalizedTasks = tasks.map((task) =>
		normalizeTask(task, existingTasksById.get(task.id), now)
	);

	await boardRef.set({ tasks: normalizedTasks, ...getBoardActivityFields(snapshot, now) }, { merge: true });
});

export const updateExpiration = command(expirationSchema, async ({ boardId, expiration }) => {
	const boardRef = firestore.doc(`boards/${boardId}`);

	await boardRef.set(getBoardExpirationFields(expiration as BoardExpiration), { merge: true });
});
