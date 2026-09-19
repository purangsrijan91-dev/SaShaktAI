# ⚖️ Hackathon Judge Framework & Evaluation Guide

## Purpose

This file defines the evaluation framework that must be used when reviewing
this project during development.

The goal is to build a solution that performs strongly across:
- Problem solving
- Innovation
- AI implementation
- Functionality
- UX
- Technical quality
- Demonstrability

---

# 1. Problem Understanding

Evaluate:
- Is the problem clearly defined?
- Who exactly experiences the problem?
- How significant is the problem?
- What is the current alternative?
- Does our solution address the actual problem rather than a secondary issue?

Ask:
> If the AI component were removed, would we still be solving the core problem?

---

# 2. User Value

Evaluate:
- Who is the primary user? (Eleanor, age 78, living independently)
- What specific outcome does the user receive?
- Does the solution save time, money, effort or improve decisions?
- Is the value immediately understandable?

---

# 3. Innovation

Evaluate:
- Is the solution meaningfully different from existing alternatives?
- Is there a memorable "wow" factor? (Multimodal protection with automated family escalation)
- Is the innovation functional rather than cosmetic?
- Does AI enable something that would otherwise be difficult?

---

# 4. AI Necessity

Prefer:
```text
User context → AI reasoning → tools/data → validation → decision → action
```
over:
```text
User → chatbot → generic LLM response
```

---

# 5. AI Architecture

Evaluate:
- Prompt quality
- Context management (Eleanor, Sarah, David, Nurse Jenkins)
- Structured outputs (sender, amount, dates, phone, URLs, paymentRequests)
- Validation & hallucination handling
- Confidence-gated decision framework

---

# 6. Functionality

The core workflow must:
- Work reliably
- Handle valid, invalid, and degraded inputs
- The golden demo paths must always work!

---

# 7. UX

Evaluate:
- Purpose immediately obvious
- Primary action obvious (Large "Talk to SaShaktAI" hero button)
- Low cognitive load for seniors
- Visually coherent, high-contrast, responsive

---

# 8. Technical Quality

Evaluate:
- Clean modular JavaScript architecture (`state.js`, `voice.js`, `vision.js`, `safety.js`, `family.js`, `ai.js`)
- Zero secrets committed to the repository
- Zero client-side API key handling (backend proxy architecture via `server.js`)

---

# 9. Security

Check:
- Input sanitization & MIME type verification
- Privacy-first senior data handling
- Environment-isolated secrets management (API keys never stored in browser `localStorage` or transmitted to client)

---

# 10. AI Authenticity Rule

Never describe simulated functionality as real AI functionality.
If a capability is mocked for demonstration purposes, clearly identify it as a demo simulation.
Prioritize genuine AI interaction where technically feasible.

The judge should specifically test:
- Does the system actually understand user input?
- Does the AI response change based on the input?
- Does the system use context?
- Does the AI make a meaningful decision?
- Can the AI explain uncertainty?
- Does the AI trigger a useful action?
