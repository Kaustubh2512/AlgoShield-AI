# 🖥️ Member 1 — Frontend Developer Task Sheet

> **Role:** Frontend Developer  
> **Stack:** React (Vite), TypeScript, Tailwind CSS, Pera Wallet  
> **Working Directory:** `projects/frontend/`

---

## ✅ What You've Already Done

- [x] React + Vite + TypeScript project setup
- [x] Landing page with animated Dither background, hero text, feature cards
- [x] Dashboard page with wallet-connected view + action cards
- [x] Scanner page (16KB — full scan flow with upload, App ID fetch, results)
- [x] Certificates page with NFT card grid
- [x] Monitor page (11KB — start monitoring, live alerts feed)
- [x] Pera Wallet integration (connect, disconnect, reconnect, context)
- [x] Components: Navbar, Footer, ScoreGauge, VulnerabilityCard, CodeViewer, AlertBanner
- [x] Animated components: ASCIIText, AnimatedText, DecryptedText, Dither, SpotlightCard
- [x] Protected routes (redirect if wallet not connected)

---

## 📋 Remaining Tasks

### Priority 1: Integrate Kedar's SuggestionPanel Component

Kedar built a dedicated `SuggestionPanel.jsx` component at:  
📂 `Algorand Kedar/frontend/src/components/SuggestionPanel.jsx`

**What to do:**
- [x] Port `SuggestionPanel.jsx` into `projects/frontend/src/components/SuggestionPanel.tsx`
- [x] Convert from JSX → TSX and from pure CSS → Tailwind
- [x] Wire it into the Scanner page (`pages/Scanner.tsx`) after scan results
- [x] The panel should show: security score, severity badges (CRITICAL/HIGH/MEDIUM/LOW), line-by-line fix recommendations
- [x] The `/suggest` endpoint already exists at `POST /suggest` — call it with the uploaded file

**API contract for `/suggest`:**
```json
// POST /suggest (FormData with file)
// Response:
{
  "security_score": 42,
  "suggestions": [
    {
      "line": 14,
      "vulnerability": "Missing RekeyTo Validation",
      "description": "The contract does not check RekeyTo...",
      "fix": "Add: txn RekeyTo / global ZeroAddress / == / assert",
      "severity": "Critical"
    }
  ],
  "summary": "Contract is highly risky..."
}
```

### Priority 2: Add "Get Suggestions" Button to Scanner Page

- [x] After a scan completes on the Scanner page, add a secondary button: **"🧠 Get AI Suggestions"**
- [x] This calls `POST /suggest` with the same file
- [x] Display results in the new SuggestionPanel component below the scan results
- [x] Show a loading skeleton (not spinner) while waiting (SLM inference can take 10-30 seconds)

### Priority 3: Monitoring Page — Email Alert Input

- [x] On the Monitor page (`pages/Monitor.tsx`), add an **email input field** alongside the App ID and Account Address
- [x] Pass `alert_email` in the `POST /monitor/start` request body
- [x] Show a confirmation: "📧 Email alerts enabled for [email]" — shown as badge next to ACTIVE indicator
- [x] Add visual indicator showing email is configured (green mail icon next to monitoring status)

### Priority 4: Monitoring Page — Show Alert History

- [x] On the Monitor page, add a section below the active monitor showing **recent alerts**
- [x] Fetch from `GET /monitor/{app_id}/alerts?wallet_address=...`
- [x] Each alert card shows: severity badge, description, transaction ID (linked to Allo.info), timestamp
- [x] Auto-refresh every 30 seconds (matching the backend polling interval)

### Priority 5: Dashboard — Recent Activity Integration

- [x] On the Dashboard page, show the **last 3 scans** for the connected wallet
- [x] Fetch from `GET /scans/{wallet_address}`
- [x] Each card shows: filename, score (color-coded), risk level badge, date
- [x] Clicking a scan card navigates to the Scanner page

### Priority 6: UI Polish & Responsiveness

- [x] Verify all pages look correct on mobile (< 768px) — responsive typography, stacked layouts, tap-to-upload
- [x] Ensure the drag-and-drop upload becomes tap-to-upload on mobile
- [x] Add loading skeletons (not spinners) for all API calls — Dashboard recent scans, Scanner suggestions
- [x] Add error toast notifications (terminal-style) instead of `alert()` — Toast component with spring animations
- [x] Verify dark theme consistency — no white backgrounds anywhere

---

## 📝 Reference Files from Kedar

| File | Path | Purpose |
|---|---|---|
| SuggestionPanel | `Algorand Kedar/frontend/src/components/SuggestionPanel.jsx` | Port this to main |
| UploadCard | `Algorand Kedar/frontend/src/components/UploadCard.jsx` | Reference for upload UX |
| MonitoringPanel | `Algorand Kedar/frontend/src/components/MonitoringPanel.jsx` | Reference for monitor UI |
| CSS Styles | `Algorand Kedar/frontend/src/index.css` | Glassmorphism CSS reference |
| App Layout | `Algorand Kedar/frontend/src/App.jsx` | API call patterns reference |

---

## ⏱️ Estimated Time

| Task | Est. Time |
|---|---|
| SuggestionPanel integration | 2-3 hrs |
| "Get Suggestions" button + flow | 1-2 hrs |
| Email input on Monitor page | 1 hr |
| Alert history display | 2 hrs |
| Dashboard recent activity | 1-2 hrs |
| UI polish & responsiveness | 2-3 hrs |
| **Total** | **~10-14 hrs** |
