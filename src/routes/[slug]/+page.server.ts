import type { Task } from '$lib/domain/entity/task';
import { isTaskVisibleToday } from '$lib/domain/useCase/taskVisibility';
import { getBoardExpiration } from '$lib/server/board-expiration';
import { firestore } from '$lib/server/firebase-admin';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, setHeaders, url }) => {
	setHeaders({
		'cache-control': 'no-store'
	});

	const boardId = params.slug;
	const today = new Date();
	const snapshot = await firestore.doc(`boards/${boardId}`).get();
	const tasks = (snapshot.get('tasks') ?? []).map((data: any) => {
		return {
			id: data.id,
			title: data.title,
			status: data.status,
			updatedAt: toDateString(data.updatedAt)
		};
	}) as Task[];

	return {
		boardId: boardId,
		expiration: getBoardExpiration(snapshot),
		tasks,
		visibleTasks: tasks.filter((task) => isTaskVisibleToday(task, today)),
		link: url.host + '/' + boardId
	};
};

function toDateString(value: any) {
	if (!value) return undefined;

	const date = value instanceof Date ? value : value.toDate?.();
	return date instanceof Date ? date.toISOString() : value;
}
