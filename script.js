// ================================
// HTML 요소 가져오기
// ================================

const intro = document.getElementById("intro");
const career = document.getElementById("career");
const education = document.getElementById("education");
const license = document.getElementById("license");
const skills = document.getElementById("skills");

const upload = document.getElementById("portfolioUpload");
const portfolioList = document.getElementById("portfolioList");

const darkBtn = document.getElementById("darkModeBtn");


// ================================
// CSV 불러오기
// ================================

fetch("resume.csv")
.then(response => response.text())
.then(text => {

    const rows = text.trim().split("\n");

    // 첫 줄(header) 제거
    rows.shift();

    rows.forEach(row => {

        const cols = row.split(",");

        const category = cols[0]?.trim();
        const title = cols[1]?.trim();
        const description = cols.slice(2).join(",").trim();

        switch(category){

            case "소개":

                intro.innerHTML += `
                    <p>${description}</p>
                `;
                break;



            case "경력":

                career.innerHTML += `
                    <div class="timeline">

                        <div class="timeline-item">

                            <h3>${title}</h3>

                            <p>${description}</p>

                        </div>

                    </div>
                `;

                break;



            case "학력":

                education.innerHTML += `
                    <p>
                        <strong>${title}</strong><br>
                        ${description}
                    </p>
                    <br>
                `;

                break;



            case "자격증":

                license.innerHTML += `
                    <p>✔ ${title}</p>
                `;

                break;



            case "기술":

                skills.innerHTML += `
                    <div class="skill">
                        ${title}
                    </div>
                `;

                break;

        }

    });

})

.catch(error=>{

    console.error("CSV 불러오기 실패");

    console.error(error);

});




// ================================
// Portfolio 업로드
// ================================

upload.addEventListener("change", function(){


    portfolioList.innerHTML="";


    for(let file of this.files){

        const li=document.createElement("li");

        li.innerHTML=`
            📄 ${file.name}
            <br>
            (${Math.round(file.size/1024)} KB)
        `;

        portfolioList.appendChild(li);

    }

});




// ================================
// 다크모드
// ================================

darkBtn.addEventListener("click",()=>{

    document.body.classList.toggle("dark");

});




// ================================
// 현재 날짜 출력 (추가 기능)
// ================================

const today = new Date();

console.log(
    "Portfolio Loaded : ",
    today.toLocaleDateString()
);




// ================================
// 부드러운 스크롤 (확장 기능)
// ================================

document.querySelectorAll("a").forEach(anchor=>{

    anchor.addEventListener("click",function(e){

        const target=this.getAttribute("href");

        if(target.startsWith("#")){

            e.preventDefault();

            document.querySelector(target).scrollIntoView({

                behavior:"smooth"

            });

        }

    });

});




// ================================
// 카드 애니메이션
// ================================

window.addEventListener("load",()=>{

    const cards=document.querySelectorAll(".card");

    cards.forEach((card,index)=>{

        card.style.opacity=0;

        setTimeout(()=>{

            card.style.transition=".5s";

            card.style.opacity=1;

        },index*150);

    });

});
