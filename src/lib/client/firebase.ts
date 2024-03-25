import {initializeApp} from "firebase/app";
import {getFirestore} from "firebase/firestore";
import {getAnalytics} from "@firebase/analytics";
import {PUBLIC_FIREBASE_CONFIG} from "$env/static/public";

const firebaseConfig = JSON.parse(atob(PUBLIC_FIREBASE_CONFIG))
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const analytics = getAnalytics(app);
