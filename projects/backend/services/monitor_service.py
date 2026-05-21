# services/monitor_service.py
import os
import sys
from datetime import datetime
from utils.blockchain_indexer import fetch_contract_transactions
from utils.email_service import send_alert_email
from utils.telegram_service import send_telegram_alert
from ml_models.anomaly import get_monitor
from utils.ai_analyzer import analyze_transaction
from utils.supabase_client import get_supabase_client
from dotenv import load_dotenv

load_dotenv()

def run_monitoring_cycle():
    import asyncio
    try:
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)

        supabase = get_supabase_client()

        response = supabase.table("monitored_contracts").select("*").eq("status", "active").execute()
        active_jobs = response.data

        if not active_jobs:
            return

        for job in active_jobs:
            job_id = job["id"]

            try:
                new_txns = loop.run_until_complete(fetch_contract_transactions(
                    contract_address=job["contract_address"],
                    min_round=job.get("last_txn", 0)
                ))

                if not new_txns:
                    continue

                highest_round = job.get("last_txn", 0) or 0
                for txn in new_txns:
                    rnd = txn.get("confirmed-round", 0)
                    if rnd > highest_round:
                        highest_round = rnd

                supabase.table("monitored_contracts").update(
                    {"last_txn": highest_round + 1}
                ).eq("id", job_id).execute()

                ai_monitor = get_monitor(str(job["contract_address"]))
                ai_monitor.add_transactions(new_txns)

                # Parse delimited email
                email_val = job.get("email", "") or ""
                alert_email = email_val
                telegram_chat_id = None
                app_id = 0
                if "##" in email_val:
                    parts = email_val.split("##")
                    alert_email = parts[0]
                    if len(parts) > 1 and parts[1]:
                        telegram_chat_id = parts[1]
                    if len(parts) > 2 and parts[2]:
                        try:
                            app_id = int(parts[2])
                        except ValueError:
                            app_id = 0

                for txn in new_txns:
                    anomaly_result = ai_monitor.check_transaction(txn)
                    ai_result = analyze_transaction(txn)

                    should_alert = anomaly_result.get("is_anomaly") or ai_result.get("is_risky")

                    if should_alert:
                        combined_severity = anomaly_result.get("severity", "Medium")
                        if ai_result.get("is_risky"):
                            combined_severity = ai_result.get("risk_level", "MEDIUM")

                        alert_doc = {
                            "contract_address": job["contract_address"],
                            "message": anomaly_result.get("description") or ai_result.get("error", "Unknown"),
                            "risk_level": combined_severity,
                            "timestamp": datetime.utcnow().isoformat()
                        }
                        supabase.table("alerts").insert(alert_doc).execute()

                        print(f" Alert — {job['contract_address'][:12]}... | {combined_severity} | {alert_doc['message']}")

                        unified_result = {
                            "severity": combined_severity,
                            "description": alert_doc["message"],
                            "anomaly_score": anomaly_result.get("anomaly_score", 0.0),
                            "label": ai_result.get("label", "UNKNOWN"),
                            "risk_level": ai_result.get("risk_level", "UNKNOWN"),
                            "prediction": ai_result.get("prediction", -1),
                        }

                        if telegram_chat_id:
                            try:
                                send_telegram_alert(telegram_chat_id, app_id, unified_result)
                            except Exception as e:
                                print(f" Telegram alert failed: {e}")

                        if alert_email:
                            try:
                                send_alert_email(
                                    to_email=alert_email,
                                    contract_address=job["contract_address"],
                                    txn_id=txn.get("id", "Unknown"),
                                    txn_type=txn.get("tx-type", "Unknown"),
                                    risk_level=combined_severity,
                                    label=ai_result.get("label", anomaly_result.get("description", "Unknown"))
                                )
                            except Exception as e:
                                print(f" Email alert failed: {e}")

            except Exception as e:
                print(f"Error in monitor job {job_id}: {e}")
    except Exception as e:
        print(f"[WARN] Background monitoring cycle failed: {e}")
