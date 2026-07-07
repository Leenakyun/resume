// firebase.js
// Firebase SDK 라이브러리 로드 (CDN 방식)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

// TODO: Firebase 콘솔 -> 프로젝트 설정 -> 앱 등록 후 받은 본인의 config 객체로 교체하세요.
const firebaseConfig = {
    apiKey: "AIzaSyB17jVmIkg5K8eEAHH0PIoqA8TY-aeH5kE",
    authDomain: "resume-5c99e.firebaseapp.com",
    databaseURL: "https://resume-5c99e-default-rtdb.firebaseio.com",
    projectId: "resume-5c99e",
    storageBucket: "resume-5c99e.firebasestorage.app",
    messagingSenderId: "647551260750",
    appId: "1:647551260750:web:e26e30aa3fe7e5e638cb1f",
    measurementId: "G-XT5DT9QBQ7"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);

// 각 서비스 인스턴스 내보내기
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// 인증 관련 내보내기
export { signInWithEmailAndPassword, signOut, onAuthStateChanged };
// Firestore 관련 내보내기
export { doc, getDoc, setDoc, updateDoc, collection };
