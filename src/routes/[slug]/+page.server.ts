import type { Task } from '$lib/domain/entity/task';
import { getBoardExpiration } from '$lib/server/board-expiration';
import { firestore } from '$lib/server/firebase-admin';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url }) => {
	const boardId = params.slug;
	const snapshot = await firestore.doc(`boards/${boardId}`).get();
	const tasks = (snapshot.get('tasks') ?? []).map((data: any) => {
		return {
			id: data.id,
			title: data.title,
			status: data.status,
			updatedAt: toDateString(data.updatedAt)
		};
	});
	return {
		boardId: boardId,
		expiration: getBoardExpiration(snapshot),
		tasks: tasks as Task[],
		link: url.host + '/' + boardId
	};
};

function toDateString(value: any) {
	if (!value) return undefined;

	const date = value instanceof Date ? value : value.toDate?.();
	return date instanceof Date ? date.toISOString() : value;
}
