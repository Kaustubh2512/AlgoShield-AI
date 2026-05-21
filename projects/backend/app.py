# backend/app.py
import uuid, hashlib, os
from dotenv import load_dotenv
load_dotenv()
from datetime import datetime
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from database import scans_col, certificates_col, monitor_jobs_col, alerts_col, create_indexes

# ── APScheduler for monitoring
from apscheduler.schedulers.background import BackgroundScheduler
from pymongo import MongoClient
import certifi

ca = certifi.where()
scheduler = BackgroundScheduler()

_sync_db = None
try:
    MONGODB_URL = os.getenv("MONGODB_URL")
    if MONGODB_URL:
        if "localhost" in MONGODB_URL or "127.0.0.1" in MONGODB_URL:
            client = MongoClient(
                MONGODB_URL,
                serverSelectionTimeoutMS=5000
            )
        else:
            client = MongoClient(
                MONGODB_URL, 
                tlsCAFile=ca, 
                tlsAllowInvalidCertificates=True,
                serverSelectionTimeoutMS=5000
            )
        _sync_db = client[os.getenv("MONGODB_DB_NAME", "algoshield")]
    else:
        print("DB init warning: MONGODB_URL is not set")
except Exception as e:
    print(f"DB init warning: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    try:
        await create_indexes()
        print("[OK] MongoDB Indexes verified")
    except Exception as e:
        print(f"[WARN] Database initialization skipped or failed: {e}")

    try:
        from services.monitor_service import run_monitoring_cycle
        scheduler.add_job(run_monitoring_cycle, 'interval', seconds=30, id='monitor', replace_existing=True)
        scheduler.start()
        print("[OK] Background Monitoring started")
    except Exception as e:
        print(f"[WARN] Scheduler failed to start: {e}")

    print("[READY] AlgoShield AI Backend is ready")
    yield
    # Shutdown logic
    scheduler.shutdown(wait=False)

app = FastAPI(title="AlgoShield AI", version="2.0.0", lifespan=lifespan)

# Allow frontend origins in production - update this with your Vercel URL
ALLOWED_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from routes.scan import router as scan_router
from routes.monitor import router as monitor_router
app.include_router(scan_router)
app.include_router(monitor_router)

# ──────────────────────────────────────────────
# ROUTE 4 — Mint NFT Certificate
# ──────────────────────────────────────────────
class MintRequest(BaseModel):
    scan_id: str
    wallet_address: str

@app.post("/mint-certificate")
async def mint_certificate(req: MintRequest):
    scan = await scans_col.find_one({"_id": req.scan_id})
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    if scan["score"] < 70:
        raise HTTPException(status_code=400, detail=f"Score must be 70+ to mint. Current: {scan['score']}")
    if scan["wallet_address"] != req.wallet_address:
        raise HTTPException(status_code=403, detail="Wallet address mismatch")

    existing = await certificates_col.find_one({"scan_id": req.scan_id})
    if existing:
        existing["cert_id"] = existing.pop("_id")
        existing["created_at"] = existing["created_at"].isoformat()
        return {**existing, "message": "Already minted"}

    try:
        from blockchain.nft_minter import mint_security_certificate
        mint_result = mint_security_certificate(
            recipient_address=req.wallet_address,
            app_id=0,
            security_score=scan["score"],
            scan_id=req.scan_id,
            contract_hash=scan["contract_hash"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Minting failed: {e}")

    cert_id = str(uuid.uuid4())
    doc = {
        "_id": cert_id,
        "scan_id": req.scan_id,
        "wallet_address": req.wallet_address,
        "asset_id": mint_result["asset_id"],
        "txn_id": mint_result["txn_id"],
        "explorer_url": mint_result["explorer_url"],
        "score": scan["score"],
        "filename": scan.get("filename"),
        "created_at": datetime.utcnow()
    }
    await certificates_col.insert_one(doc)
    return {"cert_id": cert_id, **mint_result, "minted_at": doc["created_at"].isoformat()}

# ──────────────────────────────────────────────
# ROUTE 5 — Get certificates for wallet
# ──────────────────────────────────────────────
@app.get("/certificates/{wallet_address}")
async def get_certificates(wallet_address: str):
    cursor = certificates_col.find({"wallet_address": wallet_address}).sort("created_at", -1)
    results = []
    async for doc in cursor:
        results.append({
            "cert_id":      doc["_id"],
            "scan_id":      doc["scan_id"],
            "asset_id":     doc["asset_id"],
            "txn_id":       doc["txn_id"],
            "explorer_url": doc["explorer_url"],
            "score":        doc["score"],
            "filename":     doc.get("filename"),
            "minted_at":    doc["created_at"].isoformat()
        })
    return results

# Inline monitor routes moved to routes/monitor.py
# Dead monitor_cycle code removed

# ──────────────────────────────────────────────
# ROUTE 8 — Health check
# ──────────────────────────────────────────────
@app.get("/health")
def health():
    return {"status": "AlgoShield AI running", "version": "2.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
