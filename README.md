# 🛡️ AlgoShield AI

![Algorand](https://img.shields.io/badge/Algorand-000?style=for-the-badge&logo=algorand)
![AI-Powered](https://img.shields.io/badge/AI--Powered-00ff88?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react)
![MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

**AI-powered smart contract security scanner for the Algorand blockchain** — scan TEAL contracts for vulnerabilities, get AI-generated fixes, monitor deployed contracts 24/7, and mint security certificates as NFTs.

---

## ✨ Features

| | |
|---|---|
| **🔬 AI Scanner** | ML model + SLM + RAG pipeline classifies contracts as Safe/Risky with confidence scoring |
| **💡 Smart Fixes** | Per-vulnerability suggestion cards with severity, code patch, and exploit impact |
| **📡 Live Monitoring** | Background scheduler polls deployed contracts, alerts via Telegram & Supabase |
| **🪙 NFT Certificates** | Mint ARC-69 security certificates on Algorand for scans scoring ≥ 70% |
| **🖥️ Dual Frontend** | React/TypeScript (Vite + Tailwind + Three.js) + React/JSX variant |
| **⚙️ CLI & SDK** | Interactive wizard, CI/CD flags (`--format json`, `--fail-on`), watch mode |

---

## 🏗️ Architecture

```
┌──────────────┐    ┌─────────────────────────────────────┐    ┌──────────────┐
│  Frontend    │    │  Backend (FastAPI)                   │    │  CLI (Node)  │
│  React/TS    │◄──►│  ┌────────┐ ┌────────┐ ┌────────┐  │◄──►│  algoshield  │
│  React/JSX   │    │  │ML Core │ │Monitor │ │NFT     │  │    │  scan        │
│              │    │  │sklearn │ │APSched │ │AlgoSDK │  │    │  watch       │
│              │    │  │SLM/RAG │ │Telegram│ │ARC-69  │  │    │  mint        │
│              │    │  │ChromaDB│ │Supabase│ │        │  │    │              │
└──────────────┘    └────────┴────────┴────────┴────────┘  └──────────────┘
                           │           │
                     ┌─────▼────┐ ┌───▼────┐
                     │ MongoDB  │ │Algorand│
                     │ Scans    │ │Testnet │
                     │ Certs    │ │Indexer │
                     └──────────┘ └────────┘
```

---

## 🚀 Quick Start

### Backend
```bash
cd projects/backend
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```

### Frontend
```bash
cd projects/frontend
npm install
npm run dev
```

### CLI
```bash
cd projects/algoshield-sdk
npm install
node bin\algoshield.js              # interactive wizard
node bin\algoshield.js scan c.teal  # quick scan
node bin\algoshield.js mint <id> --wallet <addr>  # mint NFT
node bin\algoshield.js watch .      # watch for changes
```

---

## 📁 Structure

```
projects/
├── backend/          # FastAPI server
│   ├── app.py        # Routes & entrypoint
│   ├── blockchain/   # Algorand SDK + NFT minter
│   ├── ml_models/    # Inference, suggester, SLM
│   ├── routes/       # scan, monitor, certificates
│   ├── services/     # monitor_service (scheduler)
│   └── utils/        # Feature extraction, RAG pipeline
├── frontend/         # React/TypeScript (Vite, Tailwind)
├── frontend-jsx/     # React/JSX variant
├── algoshield-sdk/   # Node.js CLI (`@kaustubh2512/algoshield`)
├── contracts/        # TEAL smart contracts (safe, risky, vulnerable)
├── dataset/          # ML training data
└── docs/             # Documentation
```

---

## 🔑 Environment

| Variable | Purpose |
|---|---|
| `MONGODB_URL` | MongoDB connection |
| `SUPABASE_URL` / `SUPABASE_KEY` | Monitoring & alerts |
| `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` | Telegram alerts |
| `ALGORAND_MNEMONIC` / `ALGORAND_NETWORK` | NFT minting |
| `INDEXER_URL` / `INDEXER_PORT` | Algorand Indexer |

---

## 📡 API

| Method | Endpoint | Action |
|---|---|---|
| POST | `/api/scan` | Upload TEAL for analysis |
| GET | `/api/scan/{id}` | Get scan results |
| POST | `/api/monitor` | Create monitoring job |
| DELETE | `/api/monitor/{id}` | Remove job |
| POST | `/api/mint/{scan_id}` | Mint NFT certificate |

---

## 🛡️ License

MIT — [github.com/Kaustubh2512/AlgoShield-AI](https://github.com/Kaustubh2512/AlgoShield-AI)

---

## 🤝 Team

Developed with ❤️ by **TEAM QANTAS** for the **Algorand 3.0 Hack Series 🐍**.

*Securing the decentralized future, one block at a time.*

#   A l g o S h i e l d - A I
