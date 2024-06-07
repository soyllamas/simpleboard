import {json} from '@sveltejs/kit';
import type {RequestHandler} from './$types';
import {firestore} from "$lib/server/firebase-admin";

export const GET: RequestHandler = async () => {
    return json({"success": true});
};

async function migrateDatabase() {
    const boards = ["application-refactor", "authentication-redesign", "barbs", "guazz", "hoy", "pachamama", "prg-flutter-mob", "soyllamas", "test", "todays-work"]

    for (const boardId of boards) {
        console.log(`Starting migration for board with id: ${boardId}`)
        const snapshot = await firestore.collection(`boards/${boardId}/tasks`).get()

        console.log(`--- 1. Getting tasks from collection`)
        const tasks = snapshot.docs.map((doc) => doc.data())

        console.log(`--- 2. Saving tasks in "boards/${boardId}"`)
        const boardRef = firestore.doc(`boards/${boardId}`)
        await boardRef.set({"tasks": tasks})

        console.log(`--- 3. Deleting task from "boards/${boardId}/tasks"`)
        const promises = snapshot.docs.map(doc => doc.ref.delete())
        await Promise.all(promises)

        console.log(`--- 4. Migration for "${boardId}" was successful!"`)
        console.log(`===========================`)
    }
}