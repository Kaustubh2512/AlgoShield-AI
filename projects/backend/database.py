# backend/database.py
import os, certifi
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
load_dotenv()

ca = certifi.where()

# Fallback defaults so the module never fails to import
scans_col = None
certificates_col = None
monitor_jobs_col = None
alerts_col = None

try:
    MONGODB_URL = os.getenv("MONGODB_URL")
    if MONGODB_URL:
        if "localhost" in MONGODB_URL or "127.0.0.1" in MONGODB_URL:
            client = AsyncIOMotorClient(
                MONGODB_URL,
                serverSelectionTimeoutMS=5000
            )
        else:
            client = AsyncIOMotorClient(
                MONGODB_URL,
                tlsCAFile=ca, 
                tlsAllowInvalidCertificates=True,
                serverSelectionTimeoutMS=5000
            )
        db = client[os.getenv("MONGODB_DB_NAME", "algoshield")]

        scans_col        = db["scans"]
        certificates_col = db["certificates"]
        monitor_jobs_col = db["monitor_jobs"]
        alerts_col       = db["alerts"]
    else:
        print("DB init warning: MONGODB_URL is not set")
except Exception as e:
    print(f"DB init warning: {e}")

async def create_indexes():
    if scans_col is None:
        print("DB init skipped: MongoDB not connected")
        return
    try:
        await scans_col.create_index("wallet_address")
        await scans_col.create_index("created_at")
        await certificates_col.create_index("wallet_address")
        await monitor_jobs_col.create_index([("app_id", 1), ("wallet_address", 1)])
        await alerts_col.create_index("monitor_job_id")
    except Exception as e:
        print(f"DB index creation failed: {e}")
