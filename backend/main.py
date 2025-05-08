from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from openai import AzureOpenAI
from pathlib import Path
from typing import List, Literal
from pydantic import BaseModel
import os

# パスの設定
BASE_DIR = Path(__file__).resolve().parent.parent  # chatbot-app/
FRONTEND_DIR = BASE_DIR / "frontend"
ENV_PATH = BASE_DIR / ".env"

# .envファイルの読み込み
load_dotenv(dotenv_path=ENV_PATH)

# 環境変数の取得
AZURE_OPENAI_KEY = os.getenv("AZURE_OPENAI_KEY")
AZURE_OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")
AZURE_OPENAI_DEPLOYMENT = os.getenv("AZURE_OPENAI_DEPLOYMENT")
AZURE_OPENAI_API_VERSION = os.getenv("AZURE_OPENAI_API_VERSION")

# OpenAI クライアントの初期化
client = AzureOpenAI(
    api_key=AZURE_OPENAI_KEY,
    api_version=AZURE_OPENAI_API_VERSION,
    azure_endpoint=AZURE_OPENAI_ENDPOINT,
)

# FastAPI アプリの初期化
app = FastAPI()

# CORSの設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 開発中は "*" でOK。本番では絞る。
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# フロントエンドの静的ファイルをマウント
app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="static")

class ChatMessage(BaseModel):
    role: Literal["system", "user", "assistant"]
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]

# ルートで index.html を返す
@app.get("/")
async def root():
    return FileResponse(FRONTEND_DIR / "index.html")

# チャット用のデータモデル
class Message(BaseModel):
    prompt: str

# チャットAPIのエンドポイント
@app.post("/chat")
async def chat(request: ChatRequest):
    try:
        print(f"Received messages: {request.messages}")
        response = client.chat.completions.create(
            model=AZURE_OPENAI_DEPLOYMENT,
            messages=[m.dict() for m in request.messages],
            temperature=0.7,
            max_tokens=1000,
        )
        reply = response.choices[0].message.content
        print(f"AI response: {reply}")
        return {"response": reply}
    except Exception as e:
        print(f"Error occurred: {e}")
        return {"response": "エラーが発生しました。"}