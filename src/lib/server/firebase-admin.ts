import {initializeApp, cert, getApps, getApp} from 'firebase-admin/app';
import {getFirestore} from "firebase-admin/firestore";
import {FIREBASE_SERVICE_ACCOUNT} from "$env/static/private";

const serviceAccount = JSON.parse(atob(FIREBASE_SERVICE_ACCOUNT))

// @ts-ignore
!getApps().length ? initializeApp({credential: cert(serviceAccount)}) : getApp();
const firestore = getFirestore();

export {firestore}
