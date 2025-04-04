// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

// 🔐 Replace these with your actual project settings
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "project-339726115796.firebaseapp.com",
  projectId: "project-339726115796",
  storageBucket: "project-339726115796.appspot.com",
  messagingSenderId: "YOUR_MSG_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Google Login
window.signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    alert(`Welcome ${result.user.displayName}`);
  } catch (error) {
    console.error("Login failed", error);
  }
};

// Export example (for use in other scripts)
window.addCloudTask = async (task) => {
  try {
    const ref = await addDoc(collection(db, "tasks"), task);
    console.log("Task saved to cloud:", ref.id);
  } catch (e) {
    console.error("Error saving task:", e);
  }
};
