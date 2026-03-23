import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyDSIqBqHwUgSmYb_VbnU3S-NLnnQUtyuAg",
  authDomain: "next-stop-3d7c4.firebaseapp.com",
  projectId: "next-stop-3d7c4",
  storageBucket: "next-stop-3d7c4.firebasestorage.app",
  messagingSenderId: "565289153313",
  appId: "1:565289153313:web:643be58cbe06951fcc8460"
};

const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

export { auth };