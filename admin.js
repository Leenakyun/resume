import { 
    auth, db, storage,
    signInWithEmailAndPassword, signOut, onAuthStateChanged,
    doc, getDoc, setDoc
} from "./firebase.js";

import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

// DOM 요소 선택
const loginSection = document.getElementById("login-section");
const adminDashboard = document.getElementById("admin-dashboard");
const loginForm = document.getElementById("login-form");
const btnLogout = document.getElementById("btn-logout");

const portfolioMainForm = document.getElementById("portfolio-main-form");
const profName = document.getElementById("prof-name");
const profJob = document.getElementById("prof-job");
const profImage = document.getElementById("prof-image");
const uploadThumb = document.getElementById("upload-thumb");

const prevName = document.getElementById("prev-name");
const prevJob = document.getElementById("prev-job");
const prevIntro = document.getElementById("prev-intro");
const prevImg = document.getElementById("prev-img");
const prevCareer = document.getElementById("prev-career");
const prevProjects = document.getElementById("prev-projects");

const careerListContainer = document.getElementById("career-list");
const btnAddCareer = document.getElementById("btn-add-career");
const projectListContainer = document.getElementById("project-list");
const btnAddProject = document.getElementById("btn-add-project");

// 로컬 상태 배열 데이터
let careerData = [];
let projectData = [];

// --- Quill 에디터 초기화 ---
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

// --- 인증 상태 체킹 ---
onAuthStateChanged(auth, (user) => {
    if (user) {
        loginSection.classList.add("hidden");
        adminDashboard.classList.remove("hidden");
        loadAllPortfolioData(); 
    } else {
        loginSection.classList.remove("hidden");
        adminDashboard.classList.add("hidden");
    }
});

// 로그인 및 로그아웃 핸들러
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    try {
        await signInWithEmailAndPassword(auth, email, password);
        alert("로그인에 성공했습니다.");
    } catch (error) {
        alert("로그인 실패: 정보를 확인하세요.");
    }
});

btnLogout.addEventListener("click", async () => {
    try { await signOut(auth); alert("로그아웃 되었습니다."); } catch (error) { console.error(error); }
});

// --- 실시간 미리보기 연동 리팩토링 (STEP 10) ---
function updatePreview() {
    prevName.textContent = profName.value || "이름 미설정";
    prevJob.textContent = profJob.value || "";
    
    // 경력 프리뷰 렌더링
    prevCareer.innerHTML = careerData.map(item => `
        <div class="preview-item">
            <div class="preview-item-header">
                <span>${item.company || '회사명 미입력'}</span>
                <span style="font-size:0.9rem; color:#666;">${item.period || ''}</span>
            </div>
            <div style="font-size:0.95rem; color:var(--secondary-sky);">${item.role || ''}</div>
        </div>
    `).join('');

    // 프로젝트 프리뷰 렌더링
    prevProjects.innerHTML = projectData.map(item => `
        <div class="preview-item" style="margin-bottom: 1rem;">
            <div style="font-weight:bold; color:var(--primary-navy);">${item.title || '프로젝트명 미입력'}</div>
            <div style="font-size:0.9rem; white-space:pre-wrap; color:#475569; margin:0.25rem 0;">${item.description || ''}</div>
            ${item.github ? `<a href="${item.github}" target="_blank" style="font-size:0.85rem; color:var(--secondary-sky); text-decoration:none;">GitHub Link ↗</a>` : ''}
        </div>
    `).join('');
}

profName.addEventListener("input", updatePreview);
profJob.addEventListener("input", updatePreview);
quill.on('text-change', () => { prevIntro.innerHTML = quill.root.innerHTML; });

// 이미지 선택 시 로컬 프리뷰
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

// --- 동적 CRUD 렌더링 엔진 (STEP 9) ---

// 1. 경력 폼 렌der
function renderCareerList() {
    careerListContainer.innerHTML = "";
    careerData.forEach((item, index) => {
        const div = document.createElement("div");
        div.className = "crud-item";
        div.innerHTML = `
            <div class="form-group" style="margin-bottom:0.5rem;">
                <input type="text" placeholder="회사명/조직명" value="${item.company || ''}" oninput="updateCareerItem(${index}, 'company', this.value)">
            </div>
            <div class="form-group" style="margin-bottom:0.5rem;">
                <input type="text" placeholder="역할 및 직무" value="${item.role || ''}" oninput="updateCareerItem(${index}, 'role', this.value)">
            </div>
            <div class="form-group" style="margin-bottom:0.5rem;">
                <input type="text" placeholder="기간 (예: 2024.01 ~ 2026.05)" value="${item.period || ''}" oninput="updateCareerItem(${index}, 'period', this.value)">
            </div>
            <button type="button" class="btn-delete" onclick="deleteCareerItem(${index})">삭제</button>
        `;
        careerListContainer.appendChild(div);
    });
    updatePreview();
}

window.updateCareerItem = (index, field, value) => {
    careerData[index][field] = value;
    updatePreview();
};

window.deleteCareerItem = (index) => {
    careerData.splice(index, 1);
    renderCareerList();
};

btnAddCareer.addEventListener("click", () => {
    careerData.push({ company: "", role: "", period: "" });
    renderCareerList();
});

// 2. 프로젝트 폼 렌der
function renderProjectList() {
    projectListContainer.innerHTML = "";
    projectData.forEach((item, index) => {
        const div = document.createElement("div");
        div.className = "crud-item";
        div.innerHTML = `
            <div class="form-group" style="margin-bottom:0.5rem;">
                <input type="text" placeholder="프로젝트명" value="${item.title || ''}" oninput="updateProjectItem(${index}, 'title', this.value)" style="font-weight:bold;">
            </div>
            <div class="form-group" style="margin-bottom:0.5rem;">
                <textarea placeholder="프로젝트 설명 및 QA 성과" oninput="updateProjectItem(${index}, 'description', this.value)">${item.description || ''}</textarea>
            </div>
            <div class="form-group" style="margin-bottom:0.5rem;">
                <input type="text" placeholder="GitHub 링크" value="${item.github || ''}" oninput="updateProjectItem(${index}, 'github', this.value)">
            </div>
            <button type="button" class="btn-delete" onclick="deleteProjectItem(${index})">삭제</button>
        `;
        projectListContainer.appendChild(div);
    });
    updatePreview();
}

window.updateProjectItem = (index, field, value) => {
    projectData[index][field] = value;
    updatePreview();
};

window.deleteProjectItem = (index) => {
    projectData.splice(index, 1);
    renderProjectList();
};

btnAddProject.addEventListener("click", () => {
    projectData.push({ title: "", description: "", github: "" });
    renderProjectList();
});

// --- 데이터 로드 및 초기화 통합 ---
async function loadAllPortfolioData() {
    try {
        // 프로필 텍스트 및 이미지 로드
        const profileSnap = await getDoc(doc(db, "portfolio", "profile"));
        if (profileSnap.exists()) {
            const data = profileSnap.data();
            profName.value = data.name || "";
            profJob.value = data.job || "";
            if (data.intro) { quill.root.innerHTML = data.intro; prevIntro.innerHTML = data.intro; }
            if (data.image) {
                prevImg.src = data.image; prevImg.style.display = "block";
                uploadThumb.src = data.image; uploadThumb.style.display = "inline-block";
            }
        }
        
        // 경력 로드
        const careerSnap = await getDoc(doc(db, "portfolio", "career"));
        if (careerSnap.exists()) { careerData = careerSnap.data().list || []; }
        
        // 프로젝트 로드
        const projectSnap = await getDoc(doc(db, "portfolio", "projects"));
        if (projectSnap.exists()) { projectData = projectSnap.data().list || []; }

        renderCareerList();
        renderProjectList();
        updatePreview();
    } catch (error) {
        console.error("데이터 로딩 실패:", error);
    }
}

// --- 전체 동시 저장 로직 (STEP 8 & 9) ---
portfolioMainForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    let imageUrl = prevImg.src; 
    const file = profImage.files[0];

    try {
        // 1. 신규 사진 파일 처리
        if (file) {
            const fileExtension = file.name.split('.').pop();
            const storageRef = ref(storage, `profile/profile_${Date.now()}.${fileExtension}`);
            const snapshot = await uploadBytes(storageRef, file);
            imageUrl = await getDownloadURL(snapshot.ref);
        }

        // 2. Firestore 프로필 저장
        await setDoc(doc(db, "portfolio", "profile"), {
            name: profName.value,
            job: profJob.value,
            intro: quill.root.innerHTML,
            image: imageUrl,
            updatedAt: new Date().toISOString()
        }, { merge: true });

        // 3. Firestore 경력 배열 저장
        await setDoc(doc(db, "portfolio", "career"), { list: careerData });

        // 4. Firestore 프로젝트 배열 저장
        await setDoc(doc(db, "portfolio", "projects"), { list: projectData });
        
        alert("모든 변경사항이 성공적으로 통합 저장되었습니다!");
        loadAllPortfolioData(); // 싱크 맞추기 위해 재로드
    } catch (error) {
        console.error("저장 오류:", error);
        alert("저장 중 오류가 발생했습니다.");
    }
});
