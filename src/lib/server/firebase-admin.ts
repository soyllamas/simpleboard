import {initializeApp, cert, getApps, getApp, type ServiceAccount} from 'firebase-admin/app';
import {getFirestore, type Firestore} from "firebase-admin/firestore";
import {env} from "$env/dynamic/private";

let firestoreInstance: Firestore | undefined;

function createFirestore() {
    if (firestoreInstance) return firestoreInstance;

    const value = env.FIREBASE_SERVICE_ACCOUNT;

    if (!value) {
        throw new Error("FIREBASE_SERVICE_ACCOUNT is required");
    }

    const serviceAccount = JSON.parse(Buffer.from(value, 'base64').toString()) as ServiceAccount;

    !getApps().length ? initializeApp({credential: cert(serviceAccount)}) : getApp();
    firestoreInstance = getFirestore();
    return firestoreInstance;
}

const firestore = new Proxy({} as ReturnType<typeof getFirestore>, {
    get(_target, property) {
        const instance = createFirestore();
        const value = Reflect.get(instance, property, instance);
        return typeof value === "function" ? value.bind(instance) : value;
    }
});

export {firestore}
