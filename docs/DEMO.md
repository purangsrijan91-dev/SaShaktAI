# 🎬 SaShaktAI — 90-Second Judge Demonstration Runbook

Follow this rapid step-by-step script to experience the complete **SaShaktAI** senior safety loop.

---

## 🧭 The 4-Stage Progressive Senior Flow

SaShaktAI eliminates confusing modal dialogs and multi-window mazes for seniors through a clean 4-stage lifecycle:

```text
Home
 ↓
Task
 ↓
Inline result
 ↓
Next recommended action
```

---

## ⚡ Quick Start (Zero Dependencies Required)

From the project root:

```bash
# Start the zero-dependency companion server
node server.js
```

Open your browser at: **`http://localhost:3000`**

*(If testing live with Google Gemini, simply create `.env` with `GEMINI_API_KEY=your_key` before starting).*

---

## ⏱️ 90-Second Demonstration Script

### Act 1: Stage 1 — Home Screen (00:00 – 00:20)
1. Point out the **Dual-Device View**:
   * **Left:** *Eleanor's Senior Tablet* (Designed with calm colors, large touch targets, zero popup dialogs).
   * **Right:** *Sarah's Caregiver Safety Circle* (Daughter's live monitoring screen).
2. On Eleanor's Tablet, Eleanor begins on her clean **Home** screen:
   * Status: `🟢 SaShaktAI` | `10:32 AM` | `Your safe daily companion`
   * Greeting: `Good morning, Eleanor` — `How can I help you today?`
   * 4-Stage Flow Stepper: `[● 1. Home] → [○ 2. Task] → [○ 3. Inline Result] → [○ 4. Next Action]`
   * Primary actions: `🎤 TALK TO SASHAKT AI`, `📷 Show me something`, `📅 My day`
   * Reassurance: `👨‍👩‍👧 Sarah (Daughter) is connected & online`

### Act 2: Stage 2 — Task (00:20 – 00:40)
1. Click **`🚨 1. Extortion Scam`** in the Judge Launcher (or `📷 Show me something`):
   * Notice the smooth transition to **Stage 2: Task**.
   * The Document Preview displays the disconnection notice threatening shutoff within 2 hours unless paid with Apple Gift Cards.
   * Watch the **7-Step Gemini Reasoning Pipeline**:
     `[Image Ingest] ➔ [Sent to Gemini] ➔ [Multimodal] ➔ [Extraction] ➔ [Risk] ➔ [Explanation] ➔ [Action]`
   * *(Voice Alternative)*: Tapping `🎤 TALK TO SASHAKT AI` activates the voice visualizer with zero-modal inline input and one-tap suggestion chips.

### Act 3: Stage 3 — Inline Result & Caregiver Mirror (00:40 – 01:10)
1. The analysis completes and renders the **Inline Result** directly below without popping up any modals:
   * **SENIOR VIEW:**
     * Badge: `⚠️ Potential scam`
     * Speech Bubble: `"This message may be suspicious."`
     * Audio Voice reads the reassurance aloud (click `🔊 Listen Again` to replay).
     * AI Confidence: `94% [HIGH]`
     * Extracted Data: Demands `$485.50` via unverified gift cards.
2. Look at **SARAH VIEW** on the right device:
   * Instantly illuminates with a live alert:
     ```text
     🔔 New alert
     Eleanor received a potentially suspicious financial message.
     Risk: HIGH
     Confidence: 94%
     [📄 View message]  [📞 Call Eleanor]
     ```
   * Clicking `[📞 Call Eleanor]` triggers direct phone connection simulation.

### Act 4: Stage 4 — Next Recommended Action (01:10 – 01:25)
1. Look directly beneath Eleanor's inline result:
   * **SENIOR VIEW Next Action Buttons:**
     ```text
     [⛔ Don't click / Don't pay]
     [📞 Contact Sarah]
     ```
2. Click **`[⛔ Don't click / Don't pay]`**:
   * Instant inline feedback banner appears:  
     `🛡️ Decision Confirmed: Payment Blocked`  
     *SaShaktAI blocked any payments and Sarah has been notified that you are safe.*
   * Audit trail on Sarah's screen logs the confirmation in real time.
3. Click **`[🏠 Done — Return to Home]`** to smoothly reset Eleanor back to Stage 1.

### Act 5: Testing Uncertainty & Routine (01:25 – 01:30)
1. Click **`❓ 2. Torn Bill`**:
   * SaShaktAI detects damaged/torn header.
   * AI Confidence drops to `65% [MEDIUM]`.
   * **Uncertainty Explanation:** *"The document image is missing the official sender logo, phone number, and verified billing address."*
   * Next Action shifts to: `[📸 Retake Clear Photo]` and `[📞 Ask Sarah to Check]`.
2. Click **`✅ 3. Safe Electric Bill`**:
   * Official Metro Electric autopay recognized: `✅ Verified Safe Document`.
   * Next Action: `[✅ Got it, thank you]`.

---

## 🧪 Automated Judge Verification Suite

Run the terminal benchmark at any time:

```bash
node tests/judge_evaluator.js
```

**Score:**
```text
🏆 FINAL SCORE: 6 / 6 Tests Passed (100%)
VERDICT: ⭐⭐⭐⭐⭐ ALL JUDGE REQUIREMENTS SATISFIED
```
