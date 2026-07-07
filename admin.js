// admin.js
import { 
    auth, db, 
    signInWithEmailAndPassword, signOut, onAuthStateChanged,
    doc, getDoc, setDoc, updateDoc 
} from "./firebase.js";

// DOM 요소 선택
const loginSection = document.getElementById("login-section");
const adminDashboard = document.getElementById("admin-dashboard");
const loginForm = document.getElementById("login-form");
const btnLogout = document.getElementById("btn-logout");

const profileForm = document.getElementById("profile-form");
const profName = document.getElementById("prof-name");
const profJob = document.getElementById("prof-job");
const profIntro = document.getElementById("prof-intro");

const prevName = document.getElementById("prev-name");
const prevJob = document.getElementById("prev-job");
const prevIntro = document.getElementById("prev-intro");

// 1. 인증 상태 감시 (onAuthStateChanged)
onAuthStateChanged(auth, (user) => {
    if (user) {
        // 로그인 성공 상태
        loginSection.classList.add("hidden");
        adminDashboard.classList.remove("hidden");
        loadExistingProfileData(); // 기존 데이터 불러오기
    } else {
        // 로그아웃 혹은 비로그인 상태
        loginSection.classList.remove("hidden");
        adminDashboard.classList.add("hidden");
    }
});

// 2. 이메일/비밀번호 로그인 처리
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
        alert("로그인에 성공했습니다.");
    } catch (error) {
        console.error("Login Error:", error);
        alert("로그인 실패: 이메일 또는 비밀번호를 확인하세요.");
    }
});

// 3. 로그아웃 처리
btnLogout.addEventListener("click", async () => {
    try {
        await signOut(auth);
        alert("로그아웃 되었습니다.");
    } catch (error) {
        console.error("Logout Error:", error);
    }
});

// 4. 실시간 미리보기 (React처럼 입력 즉시 Preview 반영)
function updatePreview() {
    prevName.textContent = profName.value || "이름 미설정";
    prevJob.textContent = profJob.value || "";
    prevIntro.textContent = profIntro.value || "";
}

profName.addEventListener("input", updatePreview);
profJob.addEventListener("input", updatePreview);
profIntro.addEventListener("input", updatePreview);

// 5. Firestore에서 기존 데이터 가져와 폼에 채우기
async function loadExistingProfileData() {
    try {
        // 핸들러 문서 스키마: portfolio 콜렉션의 profile 문서
        const docRef = doc(db, "portfolio", "profile");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            profName.value = data.name || "";
            profJob.value = data.job || "";
            profIntro.value = data.intro || "";
            updatePreview(); // 불러온 데이터 바탕으로 프리뷰 갱신
        } else {
            console.log("기존 프로필 데이터가 없습니다. 새로 작성해주세요.");
        }
    } catch (error) {
        console.error("Error loading profile:", error);
    }
}

// 6. 프로필 데이터 Firestore 저장
profileForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    try {
        const docRef = doc(db, "portfolio", "profile");
        // 문서가 없으면 생성(setDoc), 있으면 덮어쓰기/업데이트
        await setDoc(docRef, {
            name: profName.value,
            job: profJob.value,
            intro: profIntro.value,
            updatedAt: new Date().toISOString()
        }, { merge: true }); // 기존 다른 필드(이메일, 링크 등)가 있다면 보존하기 위해 merge 사용
        
        alert("프로필이 성공적으로 저장 및 실시간 반영되었습니다.");
    } catch (error) {
        console.error("Error saving profile:", error);
        alert("저장 중 오류가 발생했습니다.");
    }
});
