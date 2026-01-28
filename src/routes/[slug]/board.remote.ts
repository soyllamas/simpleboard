import * as v from 'valibot';
import { command } from '$app/server';
import { firestore } from '$lib/server/firebase-admin';

type ServerTask = {
	id: string;
	status: string;
	title: string;
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

function normalizeTask(task: ServerTask): ServerTask {
	return {
		id: task.id,
		status: task.status,
		title: task.title.trim()
	};
}

export const createTask = command(taskSchema, async ({ boardId, task }) => {
	const boardRef = firestore.doc(`boards/${boardId}`);
	const snapshot = await boardRef.get();
	const existingTasks = (snapshot.get('tasks') ?? []) as ServerTask[];

	const normalizedTask = normalizeTask(task);
	const updatedTasks = [normalizedTask, ...existingTasks];

	await boardRef.set({ tasks: updatedTasks }, { merge: true });
});

export const updateTask = command(taskSchema, async ({ boardId, task }) => {
	const boardRef = firestore.doc(`boards/${boardId}`);
	const snapshot = await boardRef.get();
	const existingTasks = (snapshot.get('tasks') ?? []) as ServerTask[];

	const normalizedTask = normalizeTask(task);
	const updatedTasks = existingTasks.map((t) =>
		t.id === normalizedTask.id ? normalizedTask : t
	);

	await boardRef.set({ tasks: updatedTasks }, { merge: true });
});

export const deleteTask = command(deleteTaskSchema, async ({ boardId, taskId }) => {
	const boardRef = firestore.doc(`boards/${boardId}`);
	const snapshot = await boardRef.get();
	const existingTasks = (snapshot.get('tasks') ?? []) as ServerTask[];

	const updatedTasks = existingTasks.filter((t) => t.id !== taskId);

	await boardRef.set({ tasks: updatedTasks }, { merge: true });
});

export const reorderTasks = command(tasksSchema, async ({ boardId, tasks }) => {
	const boardRef = firestore.doc(`boards/${boardId}`);
	const normalizedTasks = tasks.map(normalizeTask);

	await boardRef.set({ tasks: normalizedTasks }, { merge: true });
});
