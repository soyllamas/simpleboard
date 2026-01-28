const { initializeApp, getApps, getApp } = await import("@firebase/app");
const { getFirestore } = await import("@firebase/firestore");
const { getAnalytics } = await import("@firebase/analytics");

import { PUBLIC_FIREBASE_CONFIG } from "$env/static/public";

const config = JSON.parse(atob(PUBLIC_FIREBASE_CONFIG));
const app = getApps().length === 0 ? initializeApp(config) : getApp();
const db = getFirestore(app);
const analytics = getAnalytics(app);

export { db, analytics };
