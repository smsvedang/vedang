// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, 
         createUserWithEmailAndPassword, 
         signInWithEmailAndPassword, 
         GoogleAuthProvider, 
         signInWithPopup, 
         signOut, 
         onAuthStateChanged } 
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCzfTrdtXmcaghV89o37uEOUHf942Izxzw",
  authDomain: "aapkadost-ddf05.firebaseapp.com",
  projectId: "aapkadost-ddf05",
  storageBucket: "aapkadost-ddf05.appspot.com",
  messagingSenderId: "472916618815",
  appId: "1:472916618815:web:fffac39df4fedfa76d928a",
  measurementId: "G-KFCJ2G54VP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// ---------------------------
// Signup with Email
// ---------------------------
document.getElementById("signupBtn")?.addEventListener("click", () => {
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;

  createUserWithEmailAndPassword(auth, email, password)
    .then(() => {
      alert("Signup successful! Redirecting...");
      window.location.href = "dashboard.html";
    })
    .catch(err => alert(err.message));
});

// ---------------------------
// Login with Email
// ---------------------------
document.getElementById("loginBtn")?.addEventListener("click", () => {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      alert("Login successful! Redirecting...");
      window.location.href = "dashboard.html";
    })
    .catch(err => alert(err.message));
});

// ---------------------------
// Login with Google
// ---------------------------
document.getElementById("googleLogin")?.addEventListener("click", () => {
  signInWithPopup(auth, provider)
    .then(() => {
      alert("Google login successful! Redirecting...");
      window.location.href = "dashboard.html";
    })
    .catch(err => alert(err.message));
});

// ---------------------------
// Logout
// ---------------------------
document.getElementById("logoutBtn")?.addEventListener("click", () => {
  signOut(auth).then(() => {
    window.location.href = "index.html";
  });
});

// ---------------------------
// Auto Redirect if Logged In
// ---------------------------
onAuthStateChanged(auth, (user) => {
  if (user) {
    // Already logged in
    if (window.location.pathname.endsWith("index.html")) {
      window.location.href = "dashboard.html";
    }
  }
});
