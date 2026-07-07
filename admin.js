// admin.js
import { 
    auth, db, storage,
    signInWithEmailAndPassword, signOut, onAuthStateChanged,
    doc, getDoc, setDoc, updateDoc 
} from "./firebase.js";

// Firebase Storage 모듈 추가 로드 (CDN 방식)
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

// DOM 요소 선택
const loginSection = document.getElementById("login-section");
const adminDashboard = document.getElementById("admin-dashboard");
const loginForm = document.getElementById("login-form");
const btnLogout = document.getElementById("btn-logout");

const profileForm = document.getElementById("profile-form");
const profName = document.getElementById("prof-name");
const profJob = document.getElementById("prof-job");
const profImage = document.getElementById("prof-image");
const uploadThumb = document.getElementById("upload-thumb");

const prevName = document.getElementById("prev-name");
const prevJob = document.getElementById("prev-job");
const prevIntro = document.getElementById("prev-intro");
const prevImg = document.getElementById("prev-img");

// --- STEP 7: Quill 에디터 초기화 ---
const quill = new Quill('#editor-container', {
    theme: 'snow',
    modules: {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['link', 'clean']
        ]
    }
});

// 1. 인증 상태 감시
onAuthStateChanged(auth, (user) => {
    if (user) {
        loginSection.classList.add("hidden");
        adminDashboard.classList.remove("hidden");
        loadExistingProfileData(); 
    } else {
        loginSection.classList.remove("hidden");
        adminDashboard.classList.add("hidden");
    }
});

// 2. 로그인 처리
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    try {
        await signInWithEmailAndPassword(auth, email, password);
        alert("로그인에 성공했습니다.");
    } catch (error) {
        alert("로그인 실패: 이메일 또는 비밀번호를 확인하세요.");
    }
});

// 3. 로그아웃 처리
btnLogout.addEventListener("click", async () => {
    try { await signOut(auth); alert("로그아웃 되었습니다."); } catch (error) { console.error(error); }
});


// --- STEP 10: 실시간 미리보기 기능 고도화 ---
function updatePreview() {
    prevName.textContent = profName.value || "이름 미설정";
    prevJob.textContent = profJob.value || "";
}
profName.addEventListener("input", updatePreview);
profJob.addEventListener("input", updatePreview);

// Quill 에디터 텍스트 변경 시 실시간 프리뷰 연동
quill.on('text-change', () => {
    prevIntro.innerHTML = quill.root.innerHTML; // 에디터 안의 HTML을 그대로 프리뷰에 주입
});

// 로컬 이미지 선택 시 화면에 미리 띄워주기 (로컬 프리뷰)
profImage.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            uploadThumb.src = event.target.result;
            uploadThumb.style.display = "inline-block";
            prevImg.src = event.target.result;
            prevImg.style.display = "block";
        }
        reader.readAsDataURL(file);
    }
});


// 4. Firestore에서 기존 데이터 가져와 폼과 에디터에 채우기
async function loadExistingProfileData() {
    try {
        const docRef = doc(db, "portfolio", "profile");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            profName.value = data.name || "";
            profJob.value = data.job || "";
            
            // Quill 에디터에 기존 HTML 내용 채우기
            if (data.intro) {
                quill.root.innerHTML = data.intro;
                prevIntro.innerHTML = data.intro;
            }
            
            // 기존 프로필 이미지 경로가 있다면 프리뷰에 노출
            if (data.image) {
                prevImg.src = data.image;
                prevImg.style.display = "block";
                uploadThumb.src = data.image;
                uploadThumb.style.display = "inline-block";
            }
            updatePreview();
        }
    } catch (error) {
        console.error("Error loading profile:", error);
    }
}


// --- STEP 8: 이미지 업로드 및 Firestore 최종 데이터 저장 ---
profileForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    let imageUrl = prevImg.src; // 기본값은 기존 이미지 URL 유지
    const file = profImage.files[0];

    try {
        // 1. 새로운 사진 파일이 선택되었다면 Storage에 업로드 진행
        if (file) {
            // 파일명을 고유하게 만들기 위해 타임스탬프 결합 (예: profile/profile_17181923.jpg)
            const fileExtension = file.name.split('.').pop();
            const storageRef = ref(storage, `profile/profile_${Date.now()}.${fileExtension}`);
            
            // 파일 업로드 대기
            const snapshot = await uploadBytes(storageRef, file);
            // 업로드 완료된 파일의 공개 다운로드 URL 추출
            imageUrl = await getDownloadURL(snapshot.ref);
        }

        // 2. Firestore에 최종 텍스트 데이터 및 이미지 URL 저장
        const docRef = doc(db, "portfolio", "profile");
        await setDoc(docRef, {
            name: profName.value,
            job: profJob.value,
            intro: quill.root.innerHTML, // Quill 에디터의 Rich HTML 저장
            image: imageUrl,             // Firebase Storage 이미지 주소 저장
            updatedAt: new Date().toISOString()
        }, { merge: true });
        
        alert("프로필 정보와 이미지가 성공적으로 저장되었습니다!");
    } catch (error) {
        console.error("저장 중 오류 발생:", error);
        alert("저장 중 오류가 발생했습니다.");
    }
});
