import os
from google import genai
from dotenv import load_dotenv


def get_client():
    """API 클라이언트 초기화 및 유효성 검사"""
    load_dotenv()
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("[ERROR] .env 파일에서 GEMINI_API_KEY를 찾을 수 없습니다.")
        return None

    try:
        client = genai.Client(api_key=api_key)
        return client
    except Exception as e:
        print(f"[ERROR] 클라이언트 생성 실패: {e}")
        return None


def request_to_gemini(client, final_prompt):
    """최종 조립된 프롬프트를 Gemini에게 전송하고 답변을 반환합니다."""
    try:
        model_id = "gemini-2.5-flash"  # 사용자님의 기존 모델 유지

        response = client.models.generate_content(
            model=model_id,
            contents=final_prompt,
        )

        if response.text:
            return response.text
        return "AI가 응답을 생성했지만 내용이 비어있습니다."
    except Exception as e:
        return f"[AI 통신 에러] {str(e)}"