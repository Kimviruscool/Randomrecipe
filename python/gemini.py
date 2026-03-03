import os
from google import genai
from dotenv import load_dotenv

# API 유효성 검사
def get_client():
    print("Def get api CHECK")
    load_dotenv()

    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        print("Not found API KEY CHECK THE .env file")
        return None

    print(f"[SUCCESS] (Key: {api_key[:2]}***)")

    try:
        # 2026년 표준 SDK인 google-genai 클라이언트 생성
        client = genai.Client(api_key=api_key)
        print("[SUCCESS] Gemini API 클라이언트 초기화 성공")
        return client
    except Exception as e:
        print(f"[ERROR] 클라이언트 생성 실패: {e}")
        return None

# AI 호출
def get_ai():
    print("Def get ai CHECK")

    model_key = get_client()

    if not model_key:
        print("Not found model key CHECK THE def get_client")
        return None

    try:
        model_id = "gemini-2.5-flash"

        prompt = "지금 시간대에 먹을 음식을 추천해줘 딱 하나만 테스트용이라 아무거나 추천해줘"

        response = model_key.models.generate_content(
            model=model_id,
            contents=prompt,
        )

        # print(response)
        print("성공")

        if response.text:
            print(f"\n AI의 추천 : {response.text}")
            return response.text
        else:
            print("응답은 성공했으나 텍스트내용 없음")
            return None

    except Exception as e:
        print(f"[ERROR] {e}")
        return None

if __name__ == "__main__":
    print("=== '오뭐먹' API 연결 테스트 시작 ===")
    get_ai()
    print("\n=== 테스트 종료 ===")