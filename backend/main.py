from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
import os
import openai
from pdf_loader import load_pdf_text
from starlette.middleware.cors import CORSMiddleware
from fastapi import HTTPException
from time import time

load_dotenv()

openai.api_key = os.getenv("OPENAI_API_KEY")
pdf_context = load_pdf_text(os.getenv("PDF_PATH"))

MODEL_PREFERENCES = ["gpt-4o", "gpt-4", "gpt-3.5-turbo"]

def get_first_available_model():
    for model in MODEL_PREFERENCES:
        try:
            openai.ChatCompletion.create(
                model=model,
                messages=[{"role": "system", "content": "ping"}],
                max_tokens=1
            )
            return model
        except Exception:
            continue
    return "gpt-3.5-turbo"

AVAILABLE_MODEL = get_first_available_model()
print(f"🧠 Usando modelo: {AVAILABLE_MODEL}")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

rate_limits = {}

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/chat")
async def chat(request: Request):
    ip = request.client.host
    now = time()
    window = 60
    max_msgs = 10

    times = rate_limits.get(ip, [])
    times = [t for t in times if now - t < window]
    if len(times) >= max_msgs:
        raise HTTPException(429, "Demasiadas solicitudes. Espera un momento.")
    times.append(now)
    rate_limits[ip] = times

    data = await request.json()
    user_message = data["message"]
    conversation_id = data.get("conversation_id", None)

    def event_stream():
        completion = openai.ChatCompletion.create(
            model=AVAILABLE_MODEL,
            messages=[
                {"role": "system", "content": f"You are a helpful assistant. Use the following PDF context:\n{pdf_context}"},
                {"role": "user", "content": user_message}
            ],
            stream=True,
        )
        tokens = 0
        for chunk in completion:
            if "choices" in chunk:
                delta = chunk["choices"][0]["delta"]
                if "content" in delta:
                    yield f"data: {{ \"type\": \"content\", \"content\": \"{delta['content']}\" }}\n\n"
            if "usage" in chunk:
                tokens = chunk["usage"].get("total_tokens", 0)
        cost = tokens / 1000 * 0.01
        yield f"data: {{ \"type\": \"done\", \"tokens\": {tokens}, \"cost\": {cost} }}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")
