import os
import httpx
import logging
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

_env_url = os.getenv("INDEXER_API_URL", "https://mainnet-idx.algonode.cloud")
INDEXER_API_URL = _env_url if _env_url else "https://mainnet-idx.algonode.cloud"

async def fetch_contract_transactions(contract_address: str, min_round: int = 0) -> list:
    if not contract_address or not isinstance(contract_address, str):
        logger.error("Invalid contract address provided.")
        raise ValueError("Invalid contract address.")

    # Smart routing: numeric app IDs use the application-id endpoint
    contract_address_stripped = contract_address.strip()
    if contract_address_stripped.isdigit():
        url = f"{INDEXER_API_URL}/v2/transactions"
        params = {"application-id": contract_address_stripped, "limit": 100}
    else:
        url = f"{INDEXER_API_URL}/v2/accounts/{contract_address_stripped}/transactions"
        params = {"limit": 100}

    if min_round > 0:
        params["min-round"] = min_round

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, params=params)

            if response.status_code == 400:
                logger.error(f"Bad Request: Invalid address {contract_address}.")
                return []
            elif response.status_code != 200:
                logger.error(f"Indexer API returned status {response.status_code} for address {contract_address}.")
                response.raise_for_status()

            data = response.json()
            transactions = data.get("transactions", [])

            if not transactions:
                logger.info(f"No transactions found for address {contract_address} (min_round={min_round}).")
            else:
                logger.info(f"Fetched {len(transactions)} transactions for address {contract_address} (min_round={min_round}).")

            return transactions

    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP error occurred while fetching transactions: {e}")
        return []
    except httpx.RequestError as e:
        logger.error(f"Request error occurred while fetching transactions: {e}")
        return []
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return []
