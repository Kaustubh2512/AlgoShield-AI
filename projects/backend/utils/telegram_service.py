import os
import requests

def send_telegram_alert(chat_id: str, app_id: int, result: dict):
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    if not token:
        print("⚠️ Telegram token not found, alert not sent.")
        return
    emoji = {"Critical": "🔴", "High": "🟠", "Medium": "🟡", "Low": "🔵"}.get(result.get("severity", "Medium"), "⚠️")
    
    # We use description from unified_result
    description = result.get("description", "Unknown error detected")
    severity = result.get("severity", "Unknown")
    
    try:
        res = requests.post(
            f"https://api.telegram.org/bot{token}/sendMessage",
            json={
                "chat_id": chat_id,
                "text": f"{emoji} *AlgoShield Alert*\nApp: `{app_id}`\nSeverity: *{severity}*\n{description}\n[View](https://allo.info/app/{app_id})",
                "parse_mode": "Markdown"
            },
            timeout=5
        )
        res.raise_for_status()
        print("✅ Telegram alert sent successfully.")
    except Exception as e:
        print(f"⚠️ Telegram alert failed: {e}")
