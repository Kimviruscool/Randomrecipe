from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from python.controller import router as api_router # 컨트롤러 추가
import uvicorn

app = FastAPI(title="오뭐먹 프로젝트")

# 정적 파일 경로 및 API 라우터 등록
app.mount("/static", StaticFiles(directory="static"), name="static")
app.include_router(api_router) # controller.py를 서버에 연결

templates = Jinja2Templates(directory="templates")

@app.get("/")
async def root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)