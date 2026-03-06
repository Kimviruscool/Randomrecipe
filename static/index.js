/**
 * [상태 관리 변수]
 */
let selectedMode = '';
let selectedCategory = '';
let selectedFlavors = new Set(['상관없음']);
let userIngredients = '';

let historyStack = [];
let currentStepId = 'step-1';

// 페이지네이션(슬라이드) 관련 변수
let recipePages = [];
let currentPageIndex = 0;

/**
 * [화면 전환 및 네비게이션]
 */

function showStep(stepId, saveToHistory = true) {
    if (saveToHistory) historyStack.push(currentStepId);

    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
    document.getElementById(stepId).classList.add('active');

    currentStepId = stepId;

    const backBtn = document.getElementById('btn-back');
    backBtn.style.display = (stepId === 'step-1' || stepId === 'result-area') ? 'none' : 'block';
}

function goBack() {
    if (historyStack.length > 0) {
        const prevStep = historyStack.pop();
        showStep(prevStep, false);
    }
}

/**
 * [사용자 선택 로직]
 */

function selectMode(mode) {
    selectedMode = mode;
    if (mode === 'cook') {
        showStep('step-2-cook');
    } else {
        showStep('step-2-delivery');
    }
}

function goToCookCategory(noIngredients = false) {
    userIngredients = noIngredients ? '없음' : document.getElementById('ingredients').value;
    showStep('step-3-cook-category');
}

function selectCookCategory(cat) {
    selectedCategory = cat;
    document.querySelectorAll('#step-3-cook-category .btn-sub').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById('btn-cook-final').style.display = 'block';
}

function selectDeliveryCategory(cat) {
    selectedCategory = cat;
    showStep('step-3-delivery');
}

function toggleFlavor(elem, flavor) {
    if (flavor === '상관없음') {
        selectedFlavors.clear();
        selectedFlavors.add('상관없음');
        document.querySelectorAll('.btn-chip').forEach(btn => btn.classList.remove('active'));
        elem.classList.add('active');
    } else {
        selectedFlavors.delete('상관없음');
        const defaultChip = document.querySelector('.btn-chip[onclick*="상관없음"]');
        if(defaultChip) defaultChip.classList.remove('active');

        if (selectedFlavors.has(flavor)) {
            selectedFlavors.delete(flavor);
            elem.classList.remove('active');
        } else {
            selectedFlavors.add(flavor);
            elem.classList.add('active');
        }
    }
}

/**
 * [데이터 통신 및 페이지네이션 핵심 로직]
 */

// 1. 데이터를 페이지별로 나누는 함수 (수정됨)
function parseRecipeData(data, mode) {
    if (mode === 'delivery') {
        // 배달/가서먹기 모드: 전체 내용을 한 페이지에 담습니다.
        return [data.ingredients];
    }

    const pages = [];

    // [페이지 1] 재료 정보
    if (data.ingredients) {
        pages.push(`🛒 필요 재료\n\n${data.ingredients}`);
    }

    // [페이지 2~N] 조리 순서를 숫자(1. 2. 3...) 기준으로 쪼갭니다.
    if (data.steps && !data.steps.includes("조리 순서 정보가 없습니다")) {
        // 정규표현식: 숫자와 마침표(예: 1. 2.)가 나오는 지점 앞에서 자릅니다.
        const stepsArray = data.steps.split(/(?=\d+\.)/);

        stepsArray.forEach(step => {
            const trimmedStep = step.trim();
            if (trimmedStep.length > 0) {
                // 팁이나 마무리 멘트가 섞여있어도 숫자 기준으로 페이지가 생성됩니다.
                pages.push(`👨‍🍳 조리 단계\n\n${trimmedStep}`);
            }
        });
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

    if (recipePages.length > 0) {
        textEl.innerText = recipePages[currentPageIndex];

        // 페이지가 바뀔 때 스크롤을 항상 맨 위로 올립니다.
        document.querySelector('.result-card').scrollTop = 0;

        // 애니메이션 효과
        textEl.classList.remove('recipe-page-active');
        void textEl.offsetWidth;
        textEl.classList.add('recipe-page-active');

        if (pageNumEl) pageNumEl.innerText = currentPageIndex + 1;
        if (totalNumEl) totalNumEl.innerText = recipePages.length;

        // 인디케이터 및 버튼 제어
        if (recipePages.length <= 1) {
            if (indicator) indicator.style.display = 'none';
            if (prevBtn) prevBtn.style.display = 'none';
            if (nextBtn) nextBtn.style.display = 'none';
        } else {
            if (indicator) indicator.style.display = 'block';
            if (prevBtn) prevBtn.style.display = (currentPageIndex === 0) ? 'none' : 'flex';
            if (nextBtn) nextBtn.style.display = (currentPageIndex === recipePages.length - 1) ? 'none' : 'flex';
        }
    }
}

// 3. 페이지 이동 함수
function changePage(direction) {
    currentPageIndex += direction;
    updateRecipeUI();
}

// 4. API 요청 함수 (수정됨)
async function requestAI(payload) {
    showStep('result-area');
    const resultText = document.getElementById('result-text');
    const indicator = document.getElementById('page-indicator');

    resultText.innerText = "음... 무엇이 좋을지 AI가 고민하고 있어요. 잠시만요! 🤔";
    if (indicator) indicator.style.display = 'none';

    try {
        const response = await fetch('/api/recommend', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        // [중요] payload.mode를 전달하여 모드별로 페이지네이션 적용 여부를 결정합니다.
        recipePages = parseRecipeData(data, payload.mode);
        currentPageIndex = 0;

        if (recipePages.length > 0) {
            updateRecipeUI();
        } else {
            resultText.innerText = "추천 결과를 불러오지 못했습니다.";
        }
    } catch (error) {
        console.error("Error:", error);
        resultText.innerText = "서버와 연결이 끊겼어요. 다시 시도해 주세요.";
    }
}

/**
 * [최종 제출 함수]
 */

function submitCookFinal() {
    requestAI({
        mode: 'cook',
        ingredients: userIngredients,
        category: selectedCategory
    });
}

function submitDelivery() {
    requestAI({
        mode: 'delivery',
        category: selectedCategory,
        flavors: Array.from(selectedFlavors)
    });
}