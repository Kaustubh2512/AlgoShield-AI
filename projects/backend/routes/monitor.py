# routes/monitor.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from utils.supabase_client import get_supabase_client

router = APIRouter()

class StartMonitorRequest(BaseModel):
    wallet_address: str
    app_id: int
    account_address: str
    telegram_chat_id: Optional[str] = None
    alert_email: Optional[str] = None

@router.post("/monitor/start")
async def start_monitoring(req: StartMonitorRequest):
    """Register a contract address for 24/7 anomaly monitoring."""
    supabase = get_supabase_client()
    
    # Check if already monitoring this app for this wallet
    existing = supabase.table("monitored_contracts").select("*").eq("app_id", req.app_id).eq("wallet_address", req.wallet_address).eq("is_active", True).execute()

    if existing.data:
        return {
            "job_id":  existing.data[0]["id"],
            "message": "Already monitoring this contract",
            "is_active": True
        }

    insert_data = {
        "wallet_address": req.wallet_address,
        "app_id": req.app_id,
        "account_address": req.account_address,
        "telegram_chat_id": req.telegram_chat_id,
        "alert_email": req.alert_email,
        "is_active": True,
        "last_round": 0
    }

    res = supabase.table("monitored_contracts").insert(insert_data).execute()
    
    if not res.data:
        raise HTTPException(status_code=500, detail="Failed to insert monitor job")

    return {
        "job_id":  res.data[0]["id"],
        "message": "Monitoring started successfully",
        "is_active": True
    }


@router.post("/monitor/stop/{job_id}")
async def stop_monitoring(job_id: str):
    """Stop a monitoring job."""
    supabase = get_supabase_client()
    res = supabase.table("monitored_contracts").update({"is_active": False}).eq("id", job_id).execute()

    if not res.data:
        raise HTTPException(status_code=404, detail="Monitor job not found")

    return {"message": "Monitoring stopped", "job_id": job_id}


@router.get("/monitor/{app_id}/alerts")
async def get_alerts(app_id: int, wallet_address: str):
    """Get the latest anomaly alerts for a monitored contract."""
    supabase = get_supabase_client()
    
    job_res = supabase.table("monitored_contracts").select("*").eq("app_id", app_id).eq("wallet_address", wallet_address).execute()

    if not job_res.data:
        raise HTTPException(status_code=404, detail="No monitor job found for this app_id and wallet")
        
    job = job_res.data[0]

    alerts_res = supabase.table("alerts").select("*").eq("monitor_job_id", job["id"]).order("created_at", desc=True).limit(20).execute()

    alert_list = []
    for a in alerts_res.data:
        alert_list.append({
            "id":            a["id"],
            "severity":      a["severity"],
            "description":   a["description"],
            "anomaly_score": a["anomaly_score"],
            "txn_id":        a.get("txn_id"),
            "is_read":       a["is_read"],
            "timestamp":     a["created_at"]
        })

    # Mark alerts as read
    supabase.table("alerts").update({"is_read": True}).eq("monitor_job_id", job["id"]).eq("is_read", False).execute()

    return {
        "job_id":    job["id"],
        "is_active": job["is_active"],
        "app_id":    app_id,
        "alerts":    alert_list
    }


@router.get("/monitor/jobs/{wallet_address}")
async def get_monitor_jobs(wallet_address: str):
    """Get all monitor jobs for a wallet."""
    supabase = get_supabase_client()
    res = supabase.table("monitored_contracts").select("*").eq("wallet_address", wallet_address).execute()

    jobs = []
    for job in res.data:
        jobs.append({
            "job_id":          job["id"],
            "app_id":          job["app_id"],
            "account_address": job["account_address"],
            "is_active":       job["is_active"],
            "created_at":      job["created_at"]
        })

    return jobs

@router.get("/monitor/list")
async def list_monitored_contracts():
    """List all monitored contracts."""
    supabase = get_supabase_client()
    response = supabase.table("monitored_contracts").select("*").execute()
    return {"contracts": response.data}
