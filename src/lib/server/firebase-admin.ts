import {initializeApp, cert, getApps, getApp} from 'firebase-admin/app';
import serviceAccount from './serviceAccount.json';
import {getFirestore} from "firebase-admin/firestore";

// @ts-ignore
!getApps().length ? initializeApp({credential: cert(serviceAccount)}) : getApp();
const firestore = getFirestore();

export {firestore}
