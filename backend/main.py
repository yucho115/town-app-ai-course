from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from pathlib import Path

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
