from python.gemini import request_to_gemini

def build_and_run_prompt(client, data):
    """JS에서 받은 데이터를 조각조각 채워넣어 질문을 완성하고 AI에 전달합니다."""
    mode = data.get("mode")
    category = data.get("category")

    # [직접 만들기] 모드일 때
    if mode == "cook":
        ingredients = data.get("ingredients")
        # 사용자님이 원하신 대로 f-포맷팅으로 조각조각 채워넣기
        final_prompt = f"나는 지금 '{ingredients}' 재료를 가지고 있어. 이걸로 '{category}' 스타일의 요리를 만들고 싶은데, 랜덤으로 메뉴 1개와 간단한 레시피를 추천해줘. 단 오직 있는재료만 사용해야해 추가적인 재료는 없어. 결과를 줄때 필요재료, 조리방법, 더맛있게만드는 tip을 알려줘 그리고 결과앞에 귀여운 이모지도 하나씩 달아줘"

    # [배달/외식] 모드일 때
    else:
        flavors = ", ".join(data.get("flavors", []))
        final_prompt = f"지금 '{category}' 음식이 당기는데, 특히 '{flavors}' 특징이 있고 지금시간대에 먹기 적당한 메뉴로 딱 하나만 골라서 추천해줘. 추천 이유도 짧게 알려줘. 귀여운 이모지도 넣어줘"

    print(f"[LOG] 조립된 프롬프트 확인: {final_prompt}")

    # 조립된 질문을 gemini.py의 전송 함수로 넘깁니다.
    return request_to_gemini(client, final_prompt)