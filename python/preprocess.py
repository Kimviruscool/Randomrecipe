import re


def clean_text(text):
    """AI 답변에서 **, * 와 같은 마크다운 기호를 제거합니다."""
    if not text:
        return ""
    # **텍스트** 또는 * 리스트 기호를 제거합니다.
    cleaned = text.replace("**", "").replace("*", "").replace("***","").replace("###","").replace("##","").replace("#","")
    # 양끝 공백을 정리합니다.
    return cleaned.strip()


def split_recipe(text):
    """답변을 [재료]와 [순서] 부분으로 나눕니다."""
    # AI에게 답변 형식을 지정해준 뒤, 해당 키워드로 쪼갭니다.
    parts = text.split("[순서]")

    ingredients = parts[0].replace("[재료]", "").strip() if "[재료]" in parts[0] else parts[0]
    steps = parts[1].strip() if len(parts) > 1 else "조리 순서 정보가 없습니다."

    return {
        "ingredients": clean_text(ingredients),
        "steps": clean_text(steps)
    }