let selectedMode = '';
let selectedCategory = '';
let selectedFlavors = new Set(['상관없음']);
let userIngredients = '';

let historyStack = [];
let currentStepId = 'step-1';

let currentRecipe = {
    ingredients: "",
    steps: ""
};

// 화면 전환 함수
function showStep(stepId, saveToHistory = true) {
    if (saveToHistory) historyStack.push(currentStepId);

    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
    document.getElementById(stepId).classList.add('active');

    currentStepId = stepId;

    const backBtn = document.getElementById('btn-back');
    backBtn.style.display = (stepId === 'step-1' || stepId === 'result-area') ? 'none' : 'block';
}

// 뒤로가기
function goBack() {
    if (historyStack.length > 0) {
        const prevStep = historyStack.pop();
        showStep(prevStep, false);
    }
}

// 1단계: 모드 선택
function selectMode(mode) {
    selectedMode = mode;
    if (mode === 'cook') {
        showStep('step-2-cook');
    } else {
        showStep('step-2-delivery');
    }
}

// [직접만들기 전용] 2단계: 재료 입력 후 카테고리 단계로 이동
function goToCookCategory(noIngredients = false) {
    userIngredients = noIngredients ? '없음' : document.getElementById('ingredients').value;
    showStep('step-3-cook-category');
//    console.log(userIngredients)
}

// [직접만들기 전용] 3단계: 요리 스타일 선택
function selectCookCategory(cat) {
    selectedCategory = cat;
    // 모든 버튼 비활성화 후 선택된 버튼만 활성화 스타일 적용
    document.querySelectorAll('#step-3-cook-category .btn-sub').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
//    console.log(selectedCategory)
    // 추천받기 버튼 노출
    document.getElementById('btn-cook-final').style.display = 'block';
}

// [배달 전용] 2단계: 카테고리 선택
function selectDeliveryCategory(cat) {
    selectedCategory = cat;
    showStep('step-3-delivery');
//    console.log(selectedCategory)
}

// [배달 전용] 3단계: 맛 토글
function toggleFlavor(elem, flavor) {
    if (flavor === '상관없음') {
        selectedFlavors.clear();
        selectedFlavors.add('상관없음');
        document.querySelectorAll('.btn-chip').forEach(btn => btn.classList.remove('active'));
        elem.classList.add('active');
//        console.log('0')
    } else {
        selectedFlavors.delete('상관없음');
        document.querySelector('.btn-chip[onclick*="상관없음"]').classList.remove('active');
//        console.log('1')
        if (selectedFlavors.has(flavor)) {
            selectedFlavors.delete(flavor);
            elem.classList.remove('active');
//            console.log('2')
        } else {
            selectedFlavors.add(flavor);
            elem.classList.add('active');
//            console.log(flavor)
        }
    }
}

//add 03.06 send data
async function requestAI(payload) {
    const resultText = document.getElementById('result-text');
    resultText.innerText = "음... 무엇이 좋을지 AI가 고민하고 있어요. 잠시만요! 🤔";

    try {
        const response = await fetch('/api/recommend', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        // 데이터를 조각내어 배열로 저장
        recipePages = parseRecipeData(data);
        currentPageIndex = 0;

        // 화면 갱신
        if (recipePages.length > 0) {
            updateRecipeUI();
        } else {
            resultText.innerText = "추천 결과를 가져오지 못했습니다.";
        }
    } catch (error) {
        console.error("Error:", error);
        resultText.innerText = "서버와 연결이 끊겼어요. 다시 시도해 주세요.";
    }
}

// 최종 제출 (직접 만들기) 0306수정
function submitCookFinal() {
    showStep('result-area');
    // 흩어진 재료들을 하나의 보따리에 담습니다.
    const myData = {
        mode: 'cook',
        ingredients: userIngredients,
        category: selectedCategory
    };
    requestAI(myData); // 보따리 전송!
}

// 최종 제출 (배달) 0306수정
function submitDelivery() {
    showStep('result-area');
    const myData = {
        mode: 'delivery',
        category: selectedCategory,
        flavors: Array.from(selectedFlavors) // Set을 리스트로 바꿔서 담습니다.
    };
    requestAI(myData); // 보따리 전송!
}

// 페이지네이션 관련 전역 변수
let recipePages = [];
let currentPageIndex = 0;

// 1. 서버에서 받은 데이터를 조각내는 함수
function parseRecipeData(data) {
    const pages = [];

    // [페이지 1] 재료 및 메뉴 소개
    if (data.ingredients) {
        pages.push(`🛒 필요 재료\n\n${data.ingredients}`);
    }

    // [페이지 2~N] 조리 순서 분리
    if (data.steps) {
        // 숫자(1. 2. 3.)를 기준으로 텍스트를 나눕니다.
        const stepsArray = data.steps.split(/\n(?=\d+\.)/);

        let tipContent = "";

        stepsArray.forEach(step => {
            const trimmedStep = step.trim();
            // 만약 팁(⭐ 또는 "팁:")이 포함되어 있다면 따로 빼둡니다.
            if (trimmedStep.includes('⭐') || trimmedStep.includes('팁:')) {
                tipContent += trimmedStep + "\n\n";
            } else if (trimmedStep.length > 0) {
                pages.push(`👨‍🍳 조리 단계\n\n${trimmedStep}`);
            }
        });

        // [마지막 페이지] 팁 추가
        if (tipContent) {
            pages.push(`⭐ 셰프의 팁\n\n${tipContent.trim()}`);
        }
    }
    return pages;
}

// 2. 화면 업데이트 함수
function updateRecipeUI() {
    const textEl = document.getElementById('result-text');
    const pageNumEl = document.getElementById('current-page');
    const totalNumEl = document.getElementById('total-pages');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const indicator = document.getElementById('page-indicator');

    // 내용 교체
    textEl.innerText = recipePages[currentPageIndex];
    textEl.classList.remove('recipe-page-active');
    void textEl.offsetWidth; // 애니메이션 리셋
    textEl.classList.add('recipe-page-active');

    // 페이지 번호 및 버튼 가시성 제어
    pageNumEl.innerText = currentPageIndex + 1;
    totalNumEl.innerText = recipePages.length;
    indicator.style.display = 'block';

    prevBtn.style.display = currentPageIndex === 0 ? 'none' : 'flex';
    nextBtn.style.display = currentPageIndex === recipePages.length - 1 ? 'none' : 'flex';
}

// 3. 페이지 이동 함수
function changePage(direction) {
    currentPageIndex += direction;
    updateRecipeUI();
}

