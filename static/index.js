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
    resultText.innerText = "음... 무엇이 좋을지 고민하고 있어요. 잠시만요! 🤔";

    try {
        // fetch를 통해 파이썬의 /api/recommend 주소로 보따리를 던집니다.
        const response = await fetch('/api/recommend', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload) // 보따리를 전송 가능한 상태(문자열)로 만듭니다.
        });

        const data = await response.json();
        resultText.innerText = data.message; // 파이썬이 보내준 정답을 화면에 표시합니다.
    } catch (error) {
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
