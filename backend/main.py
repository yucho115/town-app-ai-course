from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from pathlib import Path
from fastapi import Request
import requests

app = FastAPI()

# パスの設定
BASE_DIR = Path(__file__).resolve().parent.parent
frontend_dir = BASE_DIR / "frontend"

# 静的ファイルのマウント
app.mount("/scripts", StaticFiles(directory=frontend_dir / "scripts"), name="scripts")
app.mount("/styles", StaticFiles(directory=frontend_dir / "styles"), name="styles")

@app.get("/", response_class=HTMLResponse)
def serve_index():
    index_path = frontend_dir / "index.html"
    return index_path.read_text(encoding="utf-8")

@app.post("/chat")
async def chat(request: Request):
    data = await request.json()
    messages = data.get("messages", [])
    
    # Sakura AI APIを呼び出し
    url = "https://api.ai.sakura.ad.jp/v1/chat/completions"
    headers = {
        "Authorization": "Bearer ee6ef43a-313d-4736-8df6-631a9280fe3d:266uW9jj3Z2fxgysUlzrwEbaqz46caRA1ZgjYQZs",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "gpt-oss-120b",
        "messages": messages
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        if response.status_code == 200:
            result = response.json()
            ai_response = result["choices"][0]["message"]["content"]
        else:
            ai_response = f"エラー: {response.status_code} - {response.text}"
    except Exception as e:
        ai_response = f"エラー: {str(e)}"
    
    return {"response": ai_response}
