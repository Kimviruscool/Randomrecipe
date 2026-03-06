from fastapi import APIRouter, Request
from python.gemini import get_client
from python.prompt import build_and_run_prompt

router = APIRouter()
client = get_client()  # 서버 시작 시 API 연결 확인

@router.post("/api/recommend")
async def recommend_api(request: Request):
    # 1. JS에서 묶어서 보낸 보따리(JSON)를 받습니다.
    data = await request.json()
    print(f"[RECEIVE] JS로부터 키워드 데이터 수신 완료: {data}")

    # 2. 조립 공장(prompt.py)으로 보따리를 통째로 넘깁니다.
    ai_answer = build_and_run_prompt(client, data)

    # 3. 최종 결과를 다시 JS(브라우저)로 돌려줍니다.
    return {"message": ai_answer}