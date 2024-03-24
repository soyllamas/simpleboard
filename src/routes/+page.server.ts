import type {PageServerLoad} from './$types';
import type {Task} from "$lib/domain/entity/task";
import {firestore} from "$lib/server/firebase-admin";

export const load: PageServerLoad = async () => {
    const snapshot = await firestore.collection('boards/first-board/tasks').get();
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
        tasks: tasks as Task[],
    };
};