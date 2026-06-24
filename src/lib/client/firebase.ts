const { initializeApp, getApps, getApp } = await import("@firebase/app");
const { getFirestore } = await import("@firebase/firestore");

import { env } from "$env/dynamic/public";

declare global {
	var FIREBASE_APPCHECK_DEBUG_TOKEN: boolean | string | undefined;
	var FIREBASE_APP_CHECK_INITIALIZED: boolean | undefined;
}

const firebaseConfig = env.PUBLIC_FIREBASE_CONFIG;
if (!firebaseConfig) throw new Error("PUBLIC_FIREBASE_CONFIG is required");

const config = JSON.parse(atob(firebaseConfig));
const app = getApps().length === 0 ? initializeApp(config) : getApp();

async function configureAppCheck() {
	const siteKey = env.PUBLIC_FIREBASE_APP_CHECK_SITE_KEY;
	if (!siteKey || globalThis.FIREBASE_APP_CHECK_INITIALIZED) return;

	const debugToken = env.PUBLIC_FIREBASE_APP_CHECK_DEBUG_TOKEN;
	if (debugToken) {
		globalThis.FIREBASE_APPCHECK_DEBUG_TOKEN = debugToken === "true" ? true : debugToken;
	}

	const { initializeAppCheck, ReCaptchaEnterpriseProvider } = await import("firebase/app-check");
	initializeAppCheck(app, {
		provider: new ReCaptchaEnterpriseProvider(siteKey),
		isTokenAutoRefreshEnabled: true,
	});

	globalThis.FIREBASE_APP_CHECK_INITIALIZED = true;
}

await configureAppCheck();

const db = getFirestore(app);

export { db };
