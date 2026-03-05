let selectedMode = '';
let selectedCategory = '';
let selectedFlavors = new Set(['상관없음']);
let userIngredients = '';

let historyStack = [];
let currentStepId = 'step-1';

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
    console.log(userIngredients)
}

// [직접만들기 전용] 3단계: 요리 스타일 선택
function selectCookCategory(cat) {
    selectedCategory = cat;
    // 모든 버튼 비활성화 후 선택된 버튼만 활성화 스타일 적용
    document.querySelectorAll('#step-3-cook-category .btn-sub').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    console.log(selectedCategory)
    // 추천받기 버튼 노출
    document.getElementById('btn-cook-final').style.display = 'block';
}

// [배달 전용] 2단계: 카테고리 선택
function selectDeliveryCategory(cat) {
    selectedCategory = cat;
    showStep('step-3-delivery');
    console.log(selectedCategory)
}

// [배달 전용] 3단계: 맛 토글
function toggleFlavor(elem, flavor) {
    if (flavor === '상관없음') {
        selectedFlavors.clear();
        selectedFlavors.add('상관없음');
        document.querySelectorAll('.btn-chip').forEach(btn => btn.classList.remove('active'));
        elem.classList.add('active');
        console.log('0')
    } else {
        selectedFlavors.delete('상관없음');
        document.querySelector('.btn-chip[onclick*="상관없음"]').classList.remove('active');
        console.log('1')
        if (selectedFlavors.has(flavor)) {
            selectedFlavors.delete(flavor);
            elem.classList.remove('active');
            console.log('2')
        } else {
            selectedFlavors.add(flavor);
            elem.classList.add('active');
            console.log(flavor)
        }
    }
}

// 최종 제출 (직접 만들기)
function submitCookFinal() {
    showStep('result-area');
    document.getElementById('result-text').innerText =
        `[${selectedCategory}] 스타일로 "${userIngredients}" 재료를 활용한 최고의 레시피를 AI가 생성 중입니다...`;

    // 여기서 실제 FastAPI 백엔드로 fetch 요청을 보낼 수 있습니다.
}

// 최종 제출 (배달)
function submitDelivery() {
    const flavors = Array.from(selectedFlavors);
    showStep('result-area');
    document.getElementById('result-text').innerText =
        `${selectedCategory} 메뉴 중 ${flavors.join(', ')} 특징을 가진 음식을 랜덤으로 선정 중입니다!`;
}