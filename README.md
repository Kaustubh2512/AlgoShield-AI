# AlgoShield AI

> AI-powered smart contract security scanner for the Algorand blockchain

AlgoShield AI scans TEAL smart contracts for vulnerabilities using machine learning, provides actionable remediation suggestions, monitors deployed contracts in real-time, and mints scan certificates as NFTs on the Algorand blockchain.

---

## Architecture

```
                ┌──────────────┐
                │   Frontend   │  React/TypeScript + React/JSX (Vite)
                └──────┬───────┘
                       │ HTTP/REST
                ┌──────▼───────┐
                │   Backend    │  FastAPI (Python)
                │              │
                │  ┌─────────┐ │
                │  │ ML Core │ │  sklearn, SLM, ChromaDB, RAG
                │  └─────────┘ │
                │  ┌─────────┐ │
                │  │Monitor  │ │  APScheduler, Telegram, Supabase
                │  └─────────┘ │
                │  ┌─────────┐ │
                │  │NFT      │ │  Algorand SDK — mint certificates
                │  └─────────┘ │
                └──────┬───────┘
                       │
            ┌──────────▼──────────┐
            │   CLI (algoshield)  │  Node.js SDK — interactive & CI/CD
            └─────────────────────┘
```

## Features

### AI/ML Vulnerability Scanner
- **Feature extraction** — Parses TEAL bytecode and extracts security-relevant features
- **ML inference** — Trained ensemble model (Random Forest + Gradient Boosting) classifies contracts as Safe or Risky
- **SLM analysis** — Small Language Model fallback for ambiguous results
- **RAG pipeline** — Retrieval-Augmented Generation using ChromaDB for context-aware suggestions
- **Confidence scoring** — Each scan returns a risk percentage and top contributing features

### Smart Remediation Suggestions
- Per-vulnerability suggestion cards with:
  - **Severity** tag (Critical, High, Medium, Low)
  - **Fix** — Specific TEAL code patch
  - **Impact** — What the vulnerability enables
- Historical pattern matching against known exploit datasets

### Real-Time Monitoring
- Background scheduler polls deployed contracts at configurable intervals
- Alerts via **Telegram bot** and **Supabase** push notifications
- Dashboard shows contract health, alert history, and scan trends

### NFT Certificate Minting
- Scans scoring ≥ 70% safety are eligible for NFT minting
- Certificate contains scan hash, risk score, and timestamp on Algorand blockchain
- Configurable via `ALGORAND_MNEMONIC` and `ALGORAND_NETWORK` env vars

### Interactive CLI Wizard
```bash
npx algoshield
# or
algoshield scan ./contract.teal
```
- Zero-config wizard: connects wallet → scans → mints (if ≥ 70%)
- CI/CD flags: `--format json`, `--output report.json`, `--fail-on risk`
- Watch mode: `algoshield watch .` for continuous scanning

### Dual Frontend
- **frontend/** — TypeScript + React (Vite, Tailwind, daisyUI, Three.js)
- **frontend-jsx/** — JavaScript/JSX variant (simpler stack)

---

## Quick Start

### Prerequisites
- Python 3.10+
- Node.js 20+
- MongoDB (local or Atlas)
- Algorand node / PureStake API key

### Backend

```bash
cd projects/backend
python -m venv venv
venv\Scripts\activate    # Windows
pip install -r requirements.txt
cp .env.example .env     # edit with your keys
uvicorn app:app --reload --port 8000
```

### Frontend

```bash
cd projects/frontend
npm install
npm run dev
```

### CLI SDK

```bash
cd projects/algoshield-sdk
npm install
npm link                  # makes `algoshield` available globally
algoshield                # interactive wizard
```

---

## Project Structure

```
├── projects/
│   ├── backend/               # FastAPI server
│   │   ├── app.py             # Main entrypoint & routes
│   │   ├── database.py        # MongoDB connection
│   │   ├── blockchain/        # Algorand integration
│   │   │   └── nft_minter.py  # NFT certificate minting
│   │   ├── ml_models/         # ML inference & suggestions
│   │   │   ├── inference.py   # Model prediction
│   │   │   ├── suggester.py   # Remediation generation
│   │   │   └── slm_inference.py
│   │   ├── routes/            # API endpoints
│   │   │   ├── scan.py        # Contract scanning
│   │   │   ├── monitor.py     # Monitoring CRUD
│   │   │   └── certificates.py
│   │   ├── services/
│   │   │   └── monitor_service.py  # Background scheduler
│   │   ├── utils/              # Feature extraction, RAG pipeline
│   │   └── .env                # Credentials (gitignored)
│   ├── frontend/              # React/TypeScript UI
│   │   ├── src/
│   │   │   ├── pages/         # Dashboard, Scanner, etc.
│   │   │   └── components/    # SuggestionPanel, UploadCard, etc.
│   │   └── package.json
│   ├── frontend-jsx/          # Alternate JSX frontend
│   ├── algoshield-sdk/        # Node.js CLI + SDK
│   │   ├── bin/algoshield.js  # CLI entrypoint
│   │   ├── src/               # Core SDK (formatter, scanner)
│   │   └── package.json
│   ├── contracts/             # Algorand smart contracts
│   │   ├── smart_contracts/   # Safe & sample contracts
│   │   └── tests/
│   ├── dataset/               # ML training data
│   ├── docs/                  # Documentation
│   ├── scripts/               # Utility scripts
│   └── research/              # Research materials
```

## Environment Variables

| Variable | Description |
|---|---|
| `MONGODB_URL` | MongoDB connection string |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_KEY` | Supabase service role key |
| `TELEGRAM_BOT_TOKEN` | Telegram bot API token |
| `TELEGRAM_CHAT_ID` | Telegram alert chat ID |
| `ALGORAND_MNEMONIC` | Algorand wallet mnemonic (for NFT minting) |
| `ALGORAND_NETWORK` | `mainnet` or `testnet` |
| `INDEXER_URL` | Algorand Indexer URL |
| `INDEXER_PORT` | Algorand Indexer port |

## API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/api/scan` | Upload TEAL file for analysis |
| GET | `/api/scan/{id}` | Get scan results |
| GET | `/api/scans` | List all scans |
| POST | `/api/monitor` | Create monitoring job |
| GET | `/api/monitor` | List monitoring jobs |
| DELETE | `/api/monitor/{id}` | Remove monitoring job |
| POST | `/api/mint/{scan_id}` | Mint scan certificate NFT |
| GET | `/api/certificates` | List minted certificates |

## CLI Usage

```bash
# Interactive mode
algoshield

# Scan a specific contract
algoshield scan ./contracts/risky/12174882.teal

# JSON output for CI/CD
algoshield scan ./contract.teal --format json --output report.json

# Watch directory for changes
algoshield watch ./contracts

# Mint certificate for a completed scan
algoshield mint <scan-id>
```

## License

MIT

## Repository

[https://github.com/Kaustubh2512/AlgoShield-AI](https://github.com/Kaustubh2512/AlgoShield-AI)
