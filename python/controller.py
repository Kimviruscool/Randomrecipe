from fastapi import APIRouter, Request
from python.gemini import get_client
from python.prompt import build_and_run_prompt
from python.preprocess import split_recipe  # 전처리 함수 가져오기

router = APIRouter()
client = get_client()


@router.post("/api/recommend")
async def recommend_api(request: Request):
    # 1. JS에서 데이터 수신
    data = await request.json()

    # 2. prompt.py를 통해 AI 답변 생성 (이때 AI에게 [재료], [순서] 형식을 지키라고 프롬프팅 해야 함)
    raw_answer = build_and_run_prompt(client, data)

    # 3. [전처리 추가] 답변 가공 (특수문자 제거 및 조각내기)
    processed_data = split_recipe(raw_answer)

    # 4. 가공된 데이터(딕셔너리 형태)를 JS로 반환
    return processed_data