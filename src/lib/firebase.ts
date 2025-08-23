import { initializeApp, getApp, getApps } from 'firebase/app';

const firebaseConfig = {
  "projectId": "jana-vedhi",
  "appId": "1:58755657437:web:fc0365aa390a0df99a7534",
  "storageBucket": "jana-vedhi.firebasestorage.app",
  "apiKey": "AIzaSyA5kdUurfOK91spUC5bILo_0WHU4WWYGec",
  "authDomain": "jana-vedhi.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "58755657437"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export { app };
