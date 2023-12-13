import { initializeApp, getApps, getApp } from "@firebase/app";
import {getAuth} from "@firebase/auth";
import { getFirestore } from "firebase/firestore";

export const firebaseConfig = {
  apiKey: "AIzaSyDwkB1u_fH6zrfqOzk0GqZXBIb2mUWXOoY",
  authDomain: "ynab-connector-38815.firebaseapp.com",
  projectId: "ynab-connector-38815",
  storageBucket: "ynab-connector-38815.appspot.com",
  messagingSenderId: "114513090606",
  appId: "1:114513090606:web:a2bd32e196a6997c44e7bf",
  measurementId: "G-7S9YPSWK26"
};

if (getApps().length === 0) {
  initializeApp(firebaseConfig);
}

const auth = getAuth( getApp());
const db = getFirestore( getApp());

export { auth, db };