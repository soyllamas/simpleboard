import type {Task} from "$lib/domain/entity/task";
import {firestore} from "$lib/server/firebase-admin";
import type {PageServerLoad} from "./$types";
import {sanitize} from "$lib/domain/useCase/sanitize";
import Markdoc from "@markdoc/markdoc";

export const load: PageServerLoad = async ({params, url}) => {
    const boardId = params.slug
    const snapshot = await firestore
        .collection(`boards/${boardId}/tasks`)
        .orderBy('updatedAt', 'desc')
        .get();
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
        link: url.host + "/" + boardId
    };
};
