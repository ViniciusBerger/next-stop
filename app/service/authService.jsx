import { signInWithEmailAndPassword } from "firebase/auth";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import { redirect } from "next/navigation";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
  updateDoc
} from "firebase/firestore";

const EVENTS = "events";

export async function createEvent(eventData) {
  const docRef = await addDoc(collection(db, EVENTS), eventData);
  return docRef.id;
}

export async function getAllEvents() {
  const snap = await getDocs(collection(db, EVENTS));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getEventById(id) {
  const ref = doc(db, EVENTS, id);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function deleteEvent(id) {
  const ref = doc(db, EVENTS, id);
  await deleteDoc(ref);
}

export async function updateEvent(id, data) {
  const ref = doc(db, EVENTS, id);
  await updateDoc(ref, data);
}

// handle login
export async function loginWithEmail(email,password) {
    
    // validate credentails
    if(!email ||!password) {
        throw new Error("Please enter email and password.")
    }

    // communicate with firebase and efetuate login
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    // return user
    return userCredential.user
}

// sign out
export async function firebaseSignOut(){
    await signOut(auth);

}