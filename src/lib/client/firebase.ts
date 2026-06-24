const { initializeApp, getApps, getApp } = await import("@firebase/app");
const { getFirestore } = await import("@firebase/firestore");

import { env } from "$env/dynamic/public";

if (!env.PUBLIC_FIREBASE_CONFIG) {
    throw new Error("PUBLIC_FIREBASE_CONFIG is required");
}

const config = JSON.parse(atob(env.PUBLIC_FIREBASE_CONFIG));
const app = getApps().length === 0 ? initializeApp(config) : getApp();
const db = getFirestore(app);

export { db };
