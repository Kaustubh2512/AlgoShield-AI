# routes/monitor.py
import re
import logging
from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from utils.supabase_client import get_supabase_client
from monitoring.monitoring_manager import manager
from monitoring.risk_engine import evaluate_contract_baseline
from utils.blockchain_indexer import fetch_contract_transactions

logger = logging.getLogger(__name__)

router = APIRouter()

_ALGO_ADDR_RE = re.compile(r'^[A-Z2-7]{58}$')
_NUMERIC_RE = re.compile(r'^\d+$')

class StartMonitorRequest(BaseModel):
    contract_address: str
    email: str
    telegram_chat_id: Optional[str] = None
    app_id: Optional[int] = 0

@router.post("/monitor/start")
async def start_monitoring(req: StartMonitorRequest):
    supabase = get_supabase_client()

    try:
        existing = supabase.table("monitored_contracts").select("*").eq("contract_address", req.contract_address).execute()
        if existing.data:
            job = existing.data[0]
            email_val = req.email
            if req.telegram_chat_id or req.app_id:
                parts = [req.email, req.telegram_chat_id or "", str(req.app_id) if req.app_id else ""]
                email_val = "##".join(parts)
            supabase.table("monitored_contracts").update({"status": "active", "email": email_val}).eq("id", job["id"]).execute()
            return {
                "job_id": job["id"],
                "message": "Already monitoring this contract",
                "status": "active"
            }
    except Exception as e:
        logger.warning(f"Check existing failed: {e}")

    email_val = req.email
    if req.telegram_chat_id or req.app_id:
        parts = [req.email, req.telegram_chat_id or "", str(req.app_id) if req.app_id else ""]
        email_val = "##".join(parts)

    try:
        res = supabase.table("monitored_contracts").insert({
            "contract_address": req.contract_address,
            "email": email_val,
            "status": "active",
            "last_txn": 0
        }).execute()
        job_id = res.data[0]["id"]
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to register contract: {e}")

    # Baseline scan: check recent on-chain activity
    initial_status = "SAFE"
    explanation = "Monitoring started successfully."
    try:
        target = req.contract_address
        txns = await fetch_contract_transactions(target, min_round=0)
        if txns:
            initial_status, explanation, _ = evaluate_contract_baseline(target, txns)
            logger.info(f"Baseline scan for {req.contract_address}: {initial_status}")
    except Exception as e:
        logger.warning(f"Baseline scan failed: {e}")

    # Write initial alert to Supabase
    try:
        initial_alert = {
            "contract_address": req.contract_address,
            "message": f"Monitoring Started — {initial_status}: {explanation}",
            "risk_level": initial_status,
            "timestamp": datetime.utcnow().isoformat()
        }
        supabase.table("alerts").insert(initial_alert).execute()
    except Exception as e:
        logger.warning(f"Failed to write initial alert: {e}")

    return {
        "job_id": job_id,
        "message": "Monitoring started successfully",
        "status": "active",
        "initial_status": initial_status,
        "explanation": explanation
    }


@router.post("/monitor/stop/{job_id}")
async def stop_monitoring(job_id: str):
    supabase = get_supabase_client()
    res = supabase.table("monitored_contracts").update({"status": "inactive"}).eq("id", job_id).execute()

    if not res.data:
        raise HTTPException(status_code=404, detail="Monitor job not found")

    return {"message": "Monitoring stopped", "job_id": job_id}


@router.websocket("/monitor/ws/{app_id}")
async def websocket_endpoint(websocket: WebSocket, app_id: int):
    await manager.connect(app_id, websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(app_id, websocket)
    except Exception as e:
        logger.error(f"WebSocket error for app {app_id}: {e}")
        manager.disconnect(app_id, websocket)


@router.get("/monitor/{contract_address}/alerts")
async def get_alerts(contract_address: str):
    supabase = get_supabase_client()

    alerts_res = supabase.table("alerts").select("*").eq("contract_address", contract_address).order("timestamp", desc=True).limit(20).execute()

    alert_list = []
    for a in alerts_res.data:
        alert_list.append({
            "id": a["id"],
            "severity": a.get("risk_level", "SAFE"),
            "description": a["message"],
            "timestamp": a["timestamp"]
        })

    return {
        "contract_address": contract_address,
        "alerts": alert_list
    }


@router.get("/monitor/jobs/{wallet_address}")
async def get_monitor_jobs(wallet_address: str):
    supabase = get_supabase_client()
    res = supabase.table("monitored_contracts").select("*").execute()

    jobs = []
    for job in res.data:
        jobs.append({
            "job_id": job["id"],
            "contract_address": job["contract_address"],
            "status": job["status"],
            "created_at": job.get("created_at", "")
        })

    return jobs


@router.get("/monitor/list")
async def list_monitored_contracts():
    supabase = get_supabase_client()
    response = supabase.table("monitored_contracts").select("*").execute()
    return {"contracts": response.data}
