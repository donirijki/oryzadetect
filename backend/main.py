import sys
from pathlib import Path

# Pastikan folder backend selalu ada di sys.path,
# agar `detector` bisa diimport dari mana saja uvicorn dijalankan
sys.path.insert(0, str(Path(__file__).parent))

from fastapi import FastAPI, File, UploadFile, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi.middleware.cors import CORSMiddleware
from detector import predict
import uvicorn

# ── Rate Limiter: max 10 request/menit per IP ──
limiter = Limiter(key_func=get_remote_address)

# ── Path ke folder static (hasil build Vite) ──
STATIC_DIR = Path(__file__).parent / "static"

app = FastAPI(
    title="OryzaDetect API",
    description="API deteksi penyakit tanaman padi berbasis CNN VGG16 dengan Grad-CAM",
    version="3.0.0"
)

# ── Tambahkan CORS Middleware ──
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Daftarkan rate limiter ke app
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ────────────────────────────────────────────
# API Routes (harus di-define SEBELUM static mount)
# ────────────────────────────────────────────

@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/predict")
@limiter.limit("25/minute")          # Maks 25 request per menit per IP
async def predict_disease(request: Request, file: UploadFile = File(...)):
    """Deteksi penyakit padi dari gambar daun."""
    # Validasi tipe file
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File harus berupa gambar (JPG/PNG/WEBP)")
    
    # Batas ukuran 10MB
    MAX_SIZE = 10 * 1024 * 1024
    image_bytes = await file.read()
    if len(image_bytes) > MAX_SIZE:
        raise HTTPException(status_code=400, detail="Ukuran file maksimal 10MB")
    
    if len(image_bytes) == 0:
        raise HTTPException(status_code=400, detail="File gambar kosong")

    try:
        result = predict(image_bytes)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        import traceback
        tb = traceback.format_exc()
        print(f"Error in predict: {tb}")
        raise HTTPException(status_code=500, detail=f"Gagal memproses gambar: {str(e)}\n\nTraceback:\n{tb}")


# ────────────────────────────────────────────
# Static Files — Serve frontend React/Vite build
# ────────────────────────────────────────────

if STATIC_DIR.exists():
    # Mount assets (JS, CSS) dan images
    app.mount("/assets", StaticFiles(directory=STATIC_DIR / "assets"), name="assets")
    app.mount("/images", StaticFiles(directory=STATIC_DIR / "images"), name="images")

    # Serve individual static files at root level (favicon, icons, etc.)
    @app.get("/icon.svg")
    @app.get("/apple-icon.png")
    @app.get("/icon-dark-32x32.png")
    @app.get("/icon-light-32x32.png")
    @app.get("/favicon.ico")
    async def static_root_files(request: Request):
        filename = request.url.path.lstrip("/")
        file_path = STATIC_DIR / filename
        if file_path.exists():
            return FileResponse(file_path)
        raise HTTPException(status_code=404)

    # SPA Fallback: semua route lain → index.html
    # Ini memungkinkan React Router menangani client-side routing
    @app.get("/{full_path:path}")
    async def spa_fallback(full_path: str):
        # Jangan serve index.html untuk API routes
        if full_path.startswith("api/") or full_path == "predict":
            raise HTTPException(status_code=404)
        
        index_path = STATIC_DIR / "index.html"
        if index_path.exists():
            return FileResponse(index_path)
        raise HTTPException(status_code=404, detail="Frontend build not found")


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
