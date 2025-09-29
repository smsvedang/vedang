import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { 
    getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup 
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { getFirestore, setDoc, doc } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-analytics.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCzfTrdtXmcaghV89o37uEOUHf942Izxzw",
  authDomain: "aapkadost-ddf05.firebaseapp.com",
  projectId: "aapkadost-ddf05",
  storageBucket: "aapkadost-ddf05.firebasestorage.app",
  messagingSenderId: "472916618815",
  appId: "1:472916618815:web:fffac39df4fedfa76d928a",
  measurementId: "G-KFCJ2G54VP"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// ===== Auth Functions =====
export async function signUp(){
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const dob = document.getElementById('dob').value;
    if(!dob){ alert("Enter DOB"); return; }
    if(new Date().getFullYear() - new Date(dob).getFullYear() >= 18){ alert("Only under 18 allowed"); return; }

    try{
        const userCred = await createUserWithEmailAndPassword(auth,email,password);
        const user = userCred.user;
        await setDoc(doc(db,"users",user.uid), {username,dob});
        window.location.href="dashboard.html";
    }catch(e){ alert(e.message); }
}

export async function login(){
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    try{
        await signInWithEmailAndPassword(auth,email,password); 
        window.location.href="dashboard.html";
    }
    catch(e){ alert(e.message); }
}

// ===== Google Login =====
export async function googleLogin(){
    const provider = new GoogleAuthProvider();
    try{
        const result = await signInWithPopup(auth,provider);
        const user = result.user;

        let dobInput = prompt("Enter your Date of Birth (YYYY-MM-DD):");
        if(!dobInput){ await signOut(auth); return; }
        const dob = new Date(dobInput);
        if(new Date().getFullYear() - dob.getFullYear() >= 18){ alert("Only under 18 allowed!"); await signOut(auth); return; }

        await setDoc(doc(db,"users",user.uid),{username:user.displayName||"Anonymous",dob:dob.toISOString()});
        window.location.href="dashboard.html";
    }catch(e){ alert(e.message); }
}

export async function logout(){ await signOut(auth); window.location.href="index.html"; }

// ===== Auto Redirect if Already Logged In =====
onAuthStateChanged(auth,user=>{
    if(user && window.location.pathname.includes("index.html")) window.location.href="dashboard.html";
});

// ===== Journal =====
export async function saveJournal(){
    const text = document.getElementById('journalInput')?.value.trim();
    const user = auth.currentUser;
    if(!text || !user) return;
    await setDoc(doc(db,'journals',user.uid), {text});
    document.getElementById('journalInput').value='';
}

// ===== Global Exports =====
window.signUp = signUp;
window.login = login;
window.googleLogin = googleLogin;
window.logout = logout;
window.saveJournal = saveJournal;

// ===== Navigation Helper =====
window.showSection = function(sectionId){
    document.querySelectorAll('.section').forEach(s=>s.style.display='none');
    const sec = document.getElementById(sectionId);
    if(sec) sec.style.display='block';
};
