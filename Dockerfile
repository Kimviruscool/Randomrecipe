# 1. 가벼운 Python 이미지 선택 (N100 자원 절약)
FROM python:3.11-slim

# 2. 컨테이너 내부 작업 디렉토리 설정
WORKDIR /app

# 3. 필요한 파일들 복사
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 4. 앱 실행 (uvicorn 사용)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]