from pathlib import Path
import os

import requests
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

# .env を読み込む
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

app = FastAPI()

frontend_dir = BASE_DIR / "frontend"

# 環境変数を取得
SAKURA_API_URL = os.getenv("SAKURA_API_URL", "https://api.ai.sakura.ad.jp/v1/chat/completions")
SAKURA_API_KEY = os.getenv("SAKURA_API_KEY")
SAKURA_MODEL = os.getenv("SAKURA_MODEL", "gpt-oss-120b")

# 静的ファイルのマウント
app.mount("/scripts", StaticFiles(directory=frontend_dir / "scripts"), name="scripts")
app.mount("/styles", StaticFiles(directory=frontend_dir / "styles"), name="styles")


@app.get("/", response_class=HTMLResponse)
def serve_index():
    index_path = frontend_dir / "index.html"
    return index_path.read_text(encoding="utf-8")


@app.post("/chat")
async def chat(request: Request):
    if not SAKURA_API_KEY:
        return JSONResponse(
            status_code=500,
            content={"response": "サーバー設定エラー: SAKURA_API_KEY が設定されていません。"},
        )

    data = await request.json()
    messages = data.get("messages", [])

    if not isinstance(messages, list):
        return JSONResponse(
            status_code=400,
            content={"response": "リクエスト形式が正しくありません。messages は配列である必要があります。"},
        )

    headers = {
        "Authorization": f"Bearer {SAKURA_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": SAKURA_MODEL,
        "messages": messages,
    }

    try:
        response = requests.post(
            SAKURA_API_URL,
            headers=headers,
            json=payload,
            timeout=30,
        )
        response.raise_for_status()

        result = response.json()
        ai_response = result["choices"][0]["message"]["content"]

        return {"response": ai_response}

    except requests.exceptions.Timeout:
        return JSONResponse(
            status_code=504,
            content={"response": "エラー: APIへの接続がタイムアウトしました。"},
        )
    except requests.exceptions.HTTPError:
        return JSONResponse(
            status_code=response.status_code,
            content={"response": f"エラー: {response.status_code} - {response.text}"},
        )
    except requests.exceptions.RequestException as e:
        return JSONResponse(
            status_code=502,
            content={"response": f"エラー: API通信に失敗しました。{str(e)}"},
        )
    except (KeyError, IndexError, TypeError, ValueError) as e:
        return JSONResponse(
            status_code=500,
            content={"response": f"エラー: APIレスポンスの解析に失敗しました。{str(e)}"},
        )