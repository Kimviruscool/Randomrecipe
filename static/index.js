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

// 특정 단계로 화면 이동
function showStep(stepId, saveToHistory = true) {
    if (saveToHistory) historyStack.push(currentStepId);

    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
    document.getElementById(stepId).classList.add('active');

    currentStepId = stepId;

    // 뒤로가기 버튼 표시 제어 (메인화면이나 결과창에서는 숨김)
    const backBtn = document.getElementById('btn-back');
    backBtn.style.display = (stepId === 'step-1' || stepId === 'result-area') ? 'none' : 'block';
}

// 이전 단계로 돌아가기
function goBack() {
    if (historyStack.length > 0) {
        const prevStep = historyStack.pop();
        showStep(prevStep, false);
    }
}

/**
 * [사용자 선택 로직]
 */

// 1단계: 직접 만들기 vs 배달 선택
function selectMode(mode) {
    selectedMode = mode;
    if (mode === 'cook') {
        showStep('step-2-cook');
    } else {
        showStep('step-2-delivery');
    }
}

// 직접 만들기 2단계: 재료 입력 후 카테고리 이동
function goToCookCategory(noIngredients = false) {
    userIngredients = noIngredients ? '없음' : document.getElementById('ingredients').value;
    showStep('step-3-cook-category');
}

// 직접 만들기 3단계: 요리 스타일 선택
function selectCookCategory(cat) {
    selectedCategory = cat;
    // 선택된 버튼에만 active 클래스 적용
    document.querySelectorAll('#step-3-cook-category .btn-sub').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // 최종 추천 버튼 표시
    document.getElementById('btn-cook-final').style.display = 'block';
}

// 배달 전용 2단계: 카테고리 선택
function selectDeliveryCategory(cat) {
    selectedCategory = cat;
    showStep('step-3-delivery');
}

// 배달 전용 3단계: 맛 선택 (칩 토글 로직)
function toggleFlavor(elem, flavor) {
    if (flavor === '상관없음') {
        selectedFlavors.clear();
        selectedFlavors.add('상관없음');
        document.querySelectorAll('.btn-chip').forEach(btn => btn.classList.remove('active'));
        elem.classList.add('active');
    } else {
        selectedFlavors.delete('상관없음');
        const normalChip = document.querySelector('.btn-chip[onclick*="상관없음"]');
        if (normalChip) normalChip.classList.remove('active');

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
 * [데이터 통신 및 페이지네이션]
 */

// 1. 서버에서 받은 데이터를 '---' 기준으로 쪼개는 함수
function parseRecipeData(data) {
    // 파이썬이 보낸 재료와 순서 텍스트를 하나로 합침
    const fullContent = `${data.ingredients}\n---\n${data.steps}`;
    
    // '---' 기호를 기준으로 답변을 조각내어 배열로 변환
    return fullContent.split('---')
        .map(chunk => chunk.trim())
        .filter(chunk => chunk.length > 0);
}

// 2. 화면에 현재 페이지 내용을 표시하고 화살표 제어
function updateRecipeUI() {
    const textEl = document.getElementById('result-text');
    const pageNumEl = document.getElementById('current-page');
    const totalNumEl = document.getElementById('total-pages');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const indicator = document.getElementById('page-indicator');

    if (recipePages.length > 0) {
        // 현재 페이지 텍스트 표시 및 애니메이션 적용
        textEl.innerText = recipePages[currentPageIndex];
        textEl.classList.remove('recipe-page-active');
        void textEl.offsetWidth; // 브라우저 강제 리플로우 (애니메이션 재시작)
        textEl.classList.add('recipe-page-active');

        // 페이지 번호 인디케이터 업데이트
        if (pageNumEl) pageNumEl.innerText = currentPageIndex + 1;
        if (totalNumEl) totalNumEl.innerText = recipePages.length;
        if (indicator) indicator.style.display = 'block';

        // 화살표 버튼 가시성 제어 (첫 페이지면 이전 숨김, 마지막 페이지면 다음 숨김)
        if (prevBtn) prevBtn.style.display = (currentPageIndex === 0) ? 'none' : 'flex';
        if (nextBtn) nextBtn.style.display = (currentPageIndex === recipePages.length - 1) ? 'none' : 'flex';
    }
}

// 3. 화살표 클릭 시 호출되는 페이지 이동 함수
function changePage(direction) {
    currentPageIndex += direction;
    updateRecipeUI();
}

// 4. 공통 API 요청 함수
async function requestAI(payload) {
    showStep('result-area'); // 결과창으로 즉시 이동
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

        // 수신한 데이터를 '---' 기준으로 페이지 리스트화
        recipePages = parseRecipeData(data);
        currentPageIndex = 0;

        if (recipePages.length > 0) {
            updateRecipeUI();
        } else {
            resultText.innerText = "추천 결과를 가져오지 못했습니다. 다시 시도해 주세요.";
        }
    } catch (error) {
        console.error("Error:", error);
        resultText.innerText = "서버와 연결이 끊겼어요. 다시 시도해 볼까요?";
    }
}

/**
 * [최종 제출 함수]
 */

// 직접 만들기 완료
function submitCookFinal() {
    requestAI({
        mode: 'cook',
        ingredients: userIngredients,
        category: selectedCategory
    });
}

// 배달/외식 완료
function submitDelivery() {
    requestAI({
        mode: 'delivery',
        category: selectedCategory,
        flavors: Array.from(selectedFlavors)
    });
}