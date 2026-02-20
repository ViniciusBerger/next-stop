// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, inMemoryPersistence, setPersistence } from "firebase/auth";
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDSIqBqHwUgSmYb_VbnU3S-NLnnQUtyuAg",
  authDomain: "next-stop-3d7c4.firebaseapp.com",
  projectId: "next-stop-3d7c4",
  storageBucket: "next-stop-3d7c4.firebasestorage.app",
  messagingSenderId: "565289153313",
  appId: "1:565289153313:web:643be58cbe06951fcc8460"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Manually set to memory persistence to avoid the Native Persistence import error
setPersistence(auth, inMemoryPersistence);

export { auth };