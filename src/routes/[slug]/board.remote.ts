import * as v from 'valibot';
import { command } from '$app/server';
import {
	getBoardActivityFields,
	getBoardExpirationFields,
	type BoardExpiration
} from '$lib/server/board-expiration';
import { firestore } from '$lib/server/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

type ServerTask = {
	id: string;
	status: 'todo' | 'doing' | 'done';
	title: string;
	updatedAt?: Timestamp;
};

const taskSchema = v.object({
	boardId: v.string(),
	task: v.object({
		id: v.string(),
		status: v.picklist(['todo', 'doing', 'done']),
		title: v.string()
	})
});

const tasksSchema = v.object({
	boardId: v.string(),
	tasks: v.array(
		v.object({
			id: v.string(),
			status: v.picklist(['todo', 'doing', 'done']),
			title: v.string()
		})
	)
});

const deleteTaskSchema = v.object({
	boardId: v.string(),
	taskId: v.string()
});

const expirationSchema = v.object({
	boardId: v.string(),
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

export const createTask = command(taskSchema, async ({ boardId, task }) => {
	const boardRef = firestore.doc(`boards/${boardId}`);
	const snapshot = await boardRef.get();
	const existingTasks = (snapshot.get('tasks') ?? []) as ServerTask[];

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
