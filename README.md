# SaShaktAI (सशक्त AI)
> **Context-Aware Multimodal Voice & Scam Defense Companion for Independent Seniors**

[![Node.js](https://img.shields.io/badge/Node.js-24.x-green.svg)](https://nodejs.org)
[![Google Gemini 2.5](https://img.shields.io/badge/AI-Google%20Gemini%202.5%20Flash-4285F4.svg)](https://deepmind.google/technologies/gemini/)
[![Zero External Dependencies](https://img.shields.io/badge/Dependencies-Zero%20(Native%20Node)-blue.svg)]()
[![Tests Passing](https://img.shields.io/badge/Tests-25%2F25%20Passing%20(100%25)-success.svg)]()
[![License](https://img.shields.io/badge/License-MIT-purple.svg)]()

---

## 🌟 Overview

**SaShaktAI** empowers seniors living independently with calm, reliable AI protection against predatory extortion scams, utility disconnection threats, and medical confusion — while seamlessly keeping primary family caregivers in the loop.

### 👥 Dual Viewport Architecture
1. **Senior Tablet & Web Portal (Eleanor View):**
   * Accessible, high-contrast, large-touch UI designed specifically for older adults.
   * Modal-free 4-stage inline workflow: **Home → Task Ingest → Inline Result → Recommended Next Action**.
   * Warm, jargon-free voice companion powered by speech recognition and natural text-to-speech.
2. **Family Caregiver Dashboard (Sarah View):**
   * Real-time safety alert feed dispatched whenever risk or document ambiguity is detected.
   * Verified utility ledger and trusted contact management.
   * Interactive caregiver controls: 1-click phone bridging, alert dismissal, and merchant whitelisting.

---

## 🧠 The SaShaktAI Brain (10-Step Pipeline)

```
             SEE / HEAR (Image Upload / Voice Query)
                        ↓
            UNDERSTAND (Semantic Intent & Domain)
                        ↓
          CONTEXTUALIZE (Eleanor's Verified Ledger)
                        ↓
           ASSESS RISK (Fraud Signals & Confidence)
                        ↓
        EXPLAIN SIMPLY (Calm, Jargon-Free Speech)
                        ↓
             RECOMMEND (High-Contrast Next Actions)
                        ↓
           TAKE ACTION (Payment Blocking / Safe Record)
                        ↓
              ┌─────────┴─────────┐
              ↓                   ↓
           RESOLVE            ESCALATE
                                  ↓
                                FAMILY (Sarah Portal)
                                  ↓
                                HUMAN (Call Eleanor)
```

---

## 🛡️ Key Features

* **📷 Real Multimodal Document & Scam Analysis:**
  Uploads or snaps paper bills, statements, and letters. Sent securely via backend proxy to **Google Gemini 2.5 Flash** for entity extraction, threat evaluation, and fraud signal detection.
* **🎙️ Voice Query Understanding & Companion AI:**
  Intelligently classifies voice queries into Medical, Utility/Billing, Scam Safety, Caregiver, or Companion domains. Grounded in Eleanor's verified account history rather than returning canned responses.
* **🔒 Zero API Key Exposure:**
  No Gemini keys, secrets, or credentials exist in the client JavaScript, DOM, or browser storage. All AI requests route through an authenticated backend proxy.
* **⚠️ Transparent Uncertainty & Safety Handling:**
  If a document is torn or incomplete (e.g. missing header or sender logo), confidence drops and SaShaktAI explicitly explains the ambiguity rather than guessing, gently asking for a clearer photo or escalating to Sarah.
* **♿ WCAG 2.1 AAA Accessibility:**
  Built-in accessibility toolbar with 3 font size levels (Normal, Large, Extra Large) and High-Contrast Mode.

---

## 🚀 Quick Start

### 1. Prerequisites
* **Node.js** (v18.0.0 or later, native HTTP module — zero `npm install` needed!)

### 2. Run the Server
```bash
# Optional: Set your Gemini API key in .env or environment
# GEMINI_API_KEY="your-gemini-api-key"

node server.js
```

### 3. Open in Browser
Visit **`http://localhost:3000`** to experience both the Senior Portal and Caregiver View side-by-side.

---

## 🧪 Verification & Automated Test Suites

SaShaktAI includes **25 automated tests across 4 comprehensive verification suites** ensuring 100% compliance with safety and architecture standards:

```bash
# Run all test suites
npm test
```

### Test Coverage Summary

| Suite | File | Tests | Coverage Focus |
| :--- | :--- | :---: | :--- |
| **Hackathon Judge Suite** | `tests/judge_evaluator.js` | **7 / 7** | Semantic understanding, dynamic response, context grounding, autonomous decisions, uncertainty explanation, caregiver escalation |
| **Phase 1 Test Suite** | `tests/phase1_test.js` | **7 / 7** | Multimodal upload, safe statement, extortion scam, pet/nature rejection, 400/413/502 handling, key exposure audit |
| **Phase 2 Test Suite** | `tests/phase2_test.js` | **6 / 6** | Caregiver escalation dispatch, uncertainty dispatch, silent logging, caregiver interactive actions, modal-free UI |
| **Voice Intelligence Suite** | `tests/voice_test.js` | **5 / 5** | Greetings, electric bill verification against ledger, scam warning, Dr. Linda Chen cardiology visit, emergency dispatch |

---

## 📂 Project Structure

```
SaShaktAI/
├── index.html              # Main Senior & Caregiver Desktop Web Dashboard
├── server.js               # Zero-dependency Node.js server with Gemini 2.5 Flash Proxy
├── package.json            # Scripts & project metadata
├── .gitignore              # Strict exclusion of .env and credentials
├── .env.example            # Environment template
├── README.md               # Documentation & architecture guide
├── assets/                 # Test sample documents & SVG illustrations
│   ├── sample_scam_notice.svg
│   ├── sample_torn_bill.svg
│   ├── sample_safe_statement.svg
│   └── sample_pet_cat.svg
├── css/
│   └── styles.css          # Responsive design, accessibility toolbar & high contrast
├── js/
│   ├── app.js              # Application controller & inline workflow engine
│   ├── ai.js               # Client AI module communicating with backend proxy
│   ├── brain.js            # 10-step central orchestration brain
│   ├── vision.js           # Document ingest & image normalization
│   ├── voice.js            # Speech recognition & synthesis
│   ├── family.js           # Caregiver portal state & action bridging
│   ├── state.js            # Senior ledger, account history & profile
│   ├── safety.js           # Confidence grading & uncertainty rules
│   └── demo.js             # Verified demo fixtures
├── docs/                   # Full design documentation & specifications
│   ├── ARCHITECTURE.md     # In-depth technical architecture
│   ├── CONSTITUTION.md     # AI safety constitution & senior principles
│   ├── DEMO.md             # Judge demonstration script
│   ├── JUDGE.md            # Hackathon evaluation criteria mapping
│   └── PRODUCT.md          # Product vision & user personas
└── tests/
    ├── judge_evaluator.js  # Judge evaluation tests
    ├── phase1_test.js      # Phase 1 verification tests
    ├── phase2_test.js      # Phase 2 verification tests
    └── voice_test.js       # Voice intelligence tests
```

---

## 📜 Safety Constitution

SaShaktAI adheres to 5 strict ethical AI principles for elder safety:
1. **Never Panic the Senior:** Always reassure and provide calm, constructive actions.
2. **Transparent Uncertainty:** If details are incomplete, explain *why* rather than guessing.
3. **Guard Eleanor's Independence:** Respect Eleanor's autonomy; escalate to family only when genuine risk or ambiguity is detected.
4. **Zero Financial Jargon:** Use warm, everyday language in all voice and text outputs.
5. **Privacy First:** Never store unencrypted images or expose AI keys to the browser.

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).
