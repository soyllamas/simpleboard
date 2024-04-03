import type {Task} from "$lib/domain/entity/task";
import {firestore} from "$lib/server/firebase-admin";
import type {PageServerLoad} from "./$types";
import {sanitize} from "$lib/domain/useCase/sanitize";

export const load: PageServerLoad = async ({params}) => {
    const boardId = params.slug
    const snapshot = await firestore.collection(`boards/${boardId}/tasks`).get();
    const docs = snapshot.docs
    const tasks = docs.map(function (doc) {
        const data = doc.data();
        return {
            "id": data.id,
            "status": data.status,
            "title": data.title,
        }
    })
    return {
        boardId: boardId,
        tasks: tasks as Task[],
    };
};