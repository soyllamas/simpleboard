import {initializeApp, cert, getApps, getApp} from 'firebase-admin/app';
import {getFirestore} from "firebase-admin/firestore";
import {FIREBASE_SERVICE_ACCOUNT} from "$env/static/private";

const value = Buffer.from(FIREBASE_SERVICE_ACCOUNT, 'base64').toString()
const serviceAccount = JSON.parse(value)

// @ts-ignore
!getApps().length ? initializeApp({credential: cert(serviceAccount)}) : getApp();
const firestore = getFirestore();

export {firestore}
