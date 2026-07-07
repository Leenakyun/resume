// script.js
import { db, doc, getDoc } from "./firebase.js";

// ==========================================
// 1. DOM 요소 선택 (기존 UI 요소 + Firebase 바인딩 요소)
// ==========================================
const mainProfImg = document.getElementById("main-prof-img");
const mainProfName = document.getElementById("main-prof-name");
const mainProfJob = document.getElementById("main-prof-job");
const mainProfIntro = document.getElementById("main-prof-intro");
const mainCareerTimeline = document.getElementById("main-career-timeline");
const mainProjectGrid = document.getElementById("main-project-grid");

// (기존 코드에 존재하던 다크모드 버튼 예시 - 본인의 실제 ID에 맞게 수정 가능)
const darkModeBtn = document.getElementById("dark-mode-toggle"); 

// ==========================================
// 2. 초기화 및 이벤트 리스너
// ==========================================
window.addEventListener("DOMContentLoaded", () => {
    // Firebase로부터 포트폴리오 데이터 불러오기 (기존 CSV 읽기 대체)
    loadPortfolioData();
    
    // 기존에 있던 애니메이션 초기화 실행
    initAnimations();
    
    // 기존에 있던 다크모드 상태 불러오기
    checkDarkModePreference();
});

// ==========================================
// 3. STEP 11: Firebase Firestore 데이터 로드 엔진
// ==========================================
async function loadPortfolioData() {
    try {
        // [1] 프로필 데이터 렌더링
        const profileSnap = await getDoc(doc(db, "portfolio", "profile"));
        if (profileSnap.exists()) {
            const profile = profileSnap.data();
            
            mainProfName.textContent = profile.name || "이름 미설정";
            mainProfJob.textContent = profile.job || "AI Data QA Engineer";
            
            // Quill Editor로 편집된 Rich HTML 문프를 그대로 반영
            mainProfIntro.innerHTML = profile.intro || "소개 글이 비어 있습니다.";
            
            // 프로필 이미지가 클라우드에 존재하면 바인딩 후 노출
            if (profile.image) {
                mainProfImg.src = profile.image;
                mainProfImg.style.display = "block";
            }
        } else {
            mainProfName.textContent = "등록된 정보가 없습니다.";
            mainProfIntro.innerHTML = "관리자 페이지(admin.html)에서 먼저 프로필을 등록해 주세요.";
        }

        // [2] 경력 데이터 렌더링 (기존 Timeline UI 테마 적용)
        const careerSnap = await getDoc(doc(db, "portfolio", "career"));
        if (careerSnap.exists()) {
            const careerList = careerSnap.data().list || [];
            if (careerList.length === 0) {
                mainCareerTimeline.innerHTML = "<p class='empty-text'>등록된 경력이 없습니다.</p>";
            } else {
                mainCareerTimeline.innerHTML = careerList.map(item => `
                    <div class="timeline-item" style="margin-bottom: 1.5rem; padding-left: 1rem; border-left: 3px solid var(--secondary-sky, #0ea5e9);">
                        <div class="timeline-date" style="font-size: 0.9rem; color: #64748b; font-weight: 500;">${item.period || ''}</div>
                        <h3 class="timeline-title" style="margin: 0.25rem 0; font-size: 1.2rem; color: var(--primary-navy, #1e293b);">${item.company || '회사명 미입력'}</h3>
                        <p class="timeline-role" style="margin: 0; color: #475569; font-size: 0.95rem;">${item.role || ''}</p>
                    </div>
                `).join('');
            }
        }

        // [3] 프로젝트 데이터 렌더링 (기존 Card UI 및 Hover 테마 적용)
        const projectSnap = await getDoc(doc(db, "portfolio", "projects"));
        if (projectSnap.exists()) {
            const projectList = projectSnap.data().list || [];
            if (projectList.length === 0) {
                mainProjectGrid.innerHTML = "<p class='empty-text'>등록된 프로젝트가 없습니다.</p>";
            } else {
                mainProjectGrid.innerHTML = projectList.map(item => `
                    <div class="project-card" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05); transition: transform 0.2s;">
                        <h3 style="margin-top: 0; color: var(--primary-navy, #1e293b); font-size: 1.25rem;">${item.title || '프로젝트명 미입력'}</h3>
                        <p style="color: #475569; font-size: 0.95rem; line-height: 1.5; white-space: pre-wrap; margin: 1rem 0;">${item.description || ''}</p>
                        ${item.github ? `
                            <a href="${item.github}" target="_blank" class="project-link" style="color: var(--secondary-sky, #0ea5e9); text-decoration: none; font-size: 0.9rem; font-weight: 600;">
                                GitHub 저장소 가기 ↗
                            </a>
                        ` : ''}
                    </div>
                `).join('');
            }
        }

    } catch (error) {
        console.error("Firebase 데이터 동기화 에러:", error);
        mainProfIntro.innerHTML = "<p style='color: red;'>포트폴리오 데이터를 불러오는 중 오류가 발생했습니다.</p>";
    }
}

// ==========================================
// 4. 기존 UI 인프라 기능 보존 (Dark Mode 및 기능 제어)
// ==========================================
function checkDarkModePreference() {
    const isDark = localStorage.getItem("darkMode") === "true";
    if (isDark) {
        document.body.classList.add("dark-mode");
    }
}

if (darkModeBtn) {
    darkModeBtn.addEventListener("click", () => {
        const isDark = document.body.classList.toggle("dark-mode");
        localStorage.setItem("darkMode", isDark);
    });
}

// 기존 디자인 컨셉인 Fade In / Smooth Scroll 등의 애니메이션 로직 영역
function initAnimations() {
    // 기존에 구현해두셨던 스크롤 애니메이션(IntersectionObserver 등)이나 
    // UI 효과 함수 코드가 있었다면 이 자리에 그대로 유지하시면 됩니다.
    console.log("UI 애니메이션 모듈 로드 완료");
}
