# JS data > controller > gemini ai (prompt)
from fastapi import APIRouter, Request
from .gemini import get_ai_response  # gemini.py의 함수 연결

router = APIRouter()


@router.post("/api/recommend")
async def receive_data(request: Request):
    # JS에서 보낸 JSON 데이터를 파싱
    data = await request.json()

    # 전달받은 데이터 확인 (서버 콘솔)
    print(f"Received data: {data}")

    # Gemini AI 로직 호출 (데이터 전달)
    answer = get_ai_response(data)

    return {"answer": answer}