# 🧭 SaShaktAI System Architecture

## 1. SaShaktAI Brain Orchestrator Flow

```text
                USER
                  │
                  ▼
           ┌──────────────┐
           │  SaShaktAI   │
           │    BRAIN     │
           └──────┬───────┘
                  │
          Understand intent
                  │
                  ▼
          Assess situation
                  │
       ┌──────────┼──────────┐
       ▼          ▼          ▼
     Vision     Medical    Family
       │          │          │
       └──────────┼──────────┘
                  ▼
             Risk / Need
                  │
                  ▼
              Decision
                  │
        ┌─────────┼─────────┐
        ▼         ▼         ▼
      Explain   Act       Escalate
```

### Brain Pipeline Breakdown:
1. **User Input Ingestion:** Audio voice queries, camera scans, document uploads, or panic/emergency triggers.
2. **SaShaktAI Brain (`js/brain.js`):** Central cognitive orchestrator that coordinates reasoning across all domains.
3. **Understand Intent:** Identifies the user's objective (`VISION` document check, `MEDICAL` schedule/care, `FAMILY` safety circle, or `EMERGENCY` dispatch).
4. **Assess Situation:** Ingests Eleanor's live context (78 years old, independent living, verified accounts ledger, known doctors, primary caregiver Sarah).
5. **Specialist Domain Routing:**
   * **Vision:** Multimodal analysis, OCR extraction, threat signal detection.
   * **Medical:** Cardiology schedule with Dr. Linda Chen, medication list, transit timing buffer (9:45 AM transit for 10:30 AM appointment).
   * **Family:** Caregiver availability, phone call bridging, safety status.
6. **Risk / Need Assessment:** Computes risk severity (`CRITICAL`, `HIGH`, `MEDIUM`, `SAFE`), confidence tier (`HIGH`, `MEDIUM`, `LOW`), and missing information.
7. **Tri-Modal Decision Engine:**
   * **Explain:** Warm, respectful spoken audio voice + transparent plain-language summary & uncertainty reasons.
   * **Act:** Senior-friendly safe action buttons (`[⛔ Don't click / Don't pay]`, `[📸 Retake Clear Photo]`, `[✅ Got it, thank you]`).
   * **Escalate:** Synchronized live priority alerts dispatched to Sarah's Caregiver Portal screen (`caregiverAlertBox`), audit log stream, and direct voice call bridging.

---

## 2. End-to-End Perceptual & Escalation Lifecycle

```text
              SEE / HEAR
                   ↓
              UNDERSTAND
                   ↓
              CONTEXTUALIZE
                   ↓
              ASSESS RISK
                   ↓
             EXPLAIN SIMPLY
                   ↓
              RECOMMEND
                   ↓
              TAKE ACTION
                   ↓
          ┌────────┴────────┐
          ↓                 ↓
      RESOLVE            ESCALATE
                            ↓
                         FAMILY
                            ↓
                         HUMAN
```

| Step | Phase | Function in SaShaktAI |
| :--- | :--- | :--- |
| **1** | **SEE / HEAR** | Multimodal ingestion of voice speech, document camera scans, paper receipts, or panic triggers. |
| **2** | **UNDERSTAND** | Structured entity & semantic intent extraction (OCR parsing, due dates, payment demands, URLs). |
| **3** | **CONTEXTUALIZE** | Cross-referencing Eleanor's verified state: Metro Electric autopay, Dr. Linda Chen, daughter Sarah. |
| **4** | **ASSESS RISK** | Detecting pressure patterns, computing confidence score ($0.0 - 1.0$) and confidence tier. |
| **5** | **EXPLAIN SIMPLY** | Synthesizing warm, jargon-free voice speech and transparent plain-English uncertainty reasons. |
| **6** | **RECOMMEND** | High-contrast next steps (`[⛔ Don't pay]`, `[📸 Retake Photo]`, `[✅ Got it, thank you]`). |
| **7** | **TAKE ACTION** | Immediate senior action execution with reassuring inline visual confirmation banners. |
| **8** | **RESOLVE** | Autonomous resolution for verified documents and safe routines without disturbing family. |
| **9** | **ESCALATE** | Synchronized real-time priority event dispatch to Sarah's Caregiver Portal. |
| **10** | **FAMILY → HUMAN** | Human-in-the-loop intervention (one-tap voice call bridging and live caregiver safety audit). |

---

## 3. Vision & Document Analysis Pipeline

```text
Camera / Image
      ↓
Gemini Vision
      ↓
OCR + document classification
      ↓
Extract:
- sender
- amount
- dates
- phone numbers
- URLs
- payment requests
      ↓
Risk analysis
      ↓
Explain in simple language
      ↓
Recommended action
```

---

## 3. Confidence-Gated Decision Framework

```text
AI confidence HIGH (>= 0.85)  ───► AI acts directly
AI confidence MEDIUM (0.50 - 0.84) ──► Ask clarification
AI confidence LOW (< 0.50)    ───► Human escalation
```

---

## 4. Family Safety Circle & Escalation Hierarchy

```text
                        Eleanor
                           │
            ┌──────────────┼──────────────┐
            ↓              ↓              ↓
          Sarah          David         Caregiver
        (Daughter)       (Son)      (Nurse Jenkins)
```

---

## 5. Secure Backend Proxy & Zero-Client-Key Architecture

```text
                    Browser
                       │
                       │ image / text
                       ▼
              ┌─────────────────┐
              │ Secure Backend   │
              │                 │
              │ API key stored  │
              │ in environment  │
              └────────┬────────┘
                       │
                       ▼
                   Gemini API
                       │
                       ▼
                AI structured result
                       │
                       ▼
                    Browser
```

### Security & Privacy Protections:
* **Zero Client Secrets:** The browser client never touches, receives, or stores `GEMINI_API_KEY`.
* **Environment Isolation:** Secrets are isolated to `.env` or system environment variables loaded on the server.
* **Payload Verification:** Backend validates base64 MIME types and JSON payloads before dispatching to Google AI.
* **Structured Output Enforcement:** Backend guarantees clean JSON schemas returned to the client.

