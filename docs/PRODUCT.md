# 🛡️ SaShaktAI — Product Specification & Strategy

> *"One simple place to ask for help, understand what's happening, and take the next safe action."*

---

## 1. Executive Summary

**SaShaktAI** is an AI-powered safety and independence companion specifically engineered for elderly individuals living alone. It unifies voice understanding, multimodal visual document analysis, real-world context verification, and an automated human safety net (connecting to adult children and caregivers).

---

## 2. Target Personas

### Primary User: Eleanor (Age 78)
* **Living Situation:** Lives independently in her own home.
* **Key Challenges:** 
  * Vulnerable to high-pressure imposter scams (threatening utility cutoff notices, fake bank alerts).
  * Struggles with multi-step digital apps, small typography, and complex passwords.
  * Forgets medical preparation steps (e.g. fasting before blood draws).
  * Experiences hesitation calling family because she doesn't want to "be a burden."

### Secondary User: Sarah (Daughter & Primary Caregiver)
* **Living Situation:** Lives 30 minutes away; works full-time.
* **Key Needs:**
  * Real-time visibility when Eleanor faces genuine threats.
  * Assurance that Eleanor is not making impulsive panic payments.
  * Low friction: alerts must be actionable with a one-tap phone connection.

---

## 3. The Core Product Pipeline

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

### The 10 Pipeline Stages:
1. **SEE / HEAR:** Ingest multimodal inputs directly from the user (speech audio, document photos, camera scans, panic button).
2. **UNDERSTAND:** Parse raw sensory inputs into structured semantic intents (OCR extraction, entity recognition, speech-to-text).
3. **CONTEXTUALIZE:** Cross-reference Eleanor's live reality (verified account ledger, known doctors, transit schedules, trusted family circle).
4. **ASSESS RISK:** Score psychological pressure tactics, extortion signals, and evaluate AI confidence score and tier (`HIGH`, `MEDIUM`, `LOW`).
5. **EXPLAIN SIMPLY:** Translate findings into calm, plain language spoken aloud via warm synthesis, accompanied by transparent explanations of any uncertainty.
6. **RECOMMEND:** Provide high-contrast, accessible next steps tailored to the outcome (e.g. `[Don't click / Don't pay]`, `[Retake Clear Photo]`, `[Got it, thank you]`).
7. **TAKE ACTION:** Execute Eleanor's chosen safe action, displaying instant inline confirmation and reassurance.
8. **RESOLVE:** Autonomously verify and file safe documents and routine appointment reminders without alarming family.
9. **ESCALATE:** When risk is critical or confidence is low, trigger a synchronized high-priority event on Sarah's caregiver screen.
10. **FAMILY → HUMAN:** Bridge the communication circle (direct phone call between Sarah and Eleanor, live audio check-in, human verification).

---

## 4. Safety & Authenticity Principles

* **The Safety Rule:** SaShaktAI must never present an uncertain AI result as a confirmed fact. If confidence is $< 0.85$, it explains uncertainty and requests clarification or escalates to human assistance.
* **The AI Authenticity Rule:** Never describe simulated functionality as real AI. Simulated capabilities are transparently labeled as `[DEMO SIMULATION]`.
