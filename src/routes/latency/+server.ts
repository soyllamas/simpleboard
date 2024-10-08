import {json} from '@sveltejs/kit';
import type {RequestHandler} from './$types';
import {firestore} from "$lib/server/firebase-admin";

export const GET: RequestHandler = async () => {

    const startTime = performance.now();
    const snapshot = await read();
    const endTime = performance.now();

    const timeTaken = endTime - startTime;
    const data = snapshot.docs.map((snapshot) => snapshot.data());

    return json({
        "latency": timeTaken,
        "data": data,
    });
};

async function read() {
    return firestore.collection(`boards`).limit(25).get();
}