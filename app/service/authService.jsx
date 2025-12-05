import { signInWithEmailAndPassword } from "firebase/auth";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import { redirect } from "next/navigation";


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