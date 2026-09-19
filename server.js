import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Safe native environment loading
try {
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile();
  }
} catch {
  // Safe to ignore if .env is missing
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const apiKey = process.env.GEMINI_API_KEY;
const isLiveAI = !!(apiKey && apiKey.trim() !== '' && apiKey !== 'your_gemini_api_key_here');
const MAX_PAYLOAD_SIZE = 10 * 1024 * 1024; // 10MB limit

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain'
};

/**
 * Validates and sanitizes the Gemini response before returning it to the client.
 * Enforces the Phase 1 schema:
 * {
 *   documentType: string,
 *   summary: string,
 *   riskLevel: "LOW | MEDIUM | HIGH | UNKNOWN",
 *   confidence: number,
 *   signals: string[],
 *   extractedEntities: string[],
 *   recommendedActions: string[],
 *   uncertainty: string
 * }
 */
export function validateGeminiResponse(raw) {
  if (!raw || typeof raw !== 'object') {
    return {
      documentType: 'Unknown Document',
      summary: 'Unable to reliably parse document contents. Verification with a trusted caregiver is recommended.',
      riskLevel: 'UNKNOWN',
      confidence: 0,
      signals: ['Unparseable document structure'],
      extractedEntities: [],
      recommendedActions: ['Ask Sarah or a trusted family member to review this document.'],
      uncertainty: 'The AI model could not extract readable text or verify document authenticity.'
    };
  }

  // 1. documentType
  const documentType = typeof raw.documentType === 'string' && raw.documentType.trim()
    ? raw.documentType.trim()
    : (typeof raw.documentClassification === 'string' && raw.documentClassification.trim()
      ? raw.documentClassification.trim()
      : 'Unidentified Document');

  // 2. summary (with Safety assertion mitigation)
  let summary = typeof raw.summary === 'string' && raw.summary.trim()
    ? raw.summary.trim()
    : (typeof raw.simpleExplanation === 'string' && raw.simpleExplanation.trim()
      ? raw.simpleExplanation.trim()
      : 'I have reviewed this document for you.');

  // Safety Principle: Soften absolute certainty claims
  summary = summary.replace(/this is definitely a scam/gi, 'This message contains several signals commonly associated with scams')
                   .replace(/it is definitely a scam/gi, 'It contains several signals commonly associated with scams')
                   .replace(/guaranteed to be fake/gi, 'appears to have strong fraud indicators');

  // 3. riskLevel: strictly "LOW" | "MEDIUM" | "HIGH" | "UNKNOWN"
  let rawRisk = String(raw.riskLevel || '').toUpperCase().trim();
  let riskLevel = 'UNKNOWN';
  if (rawRisk === 'HIGH' || rawRisk === 'CRITICAL') {
    riskLevel = 'HIGH';
  } else if (rawRisk === 'LOW' || rawRisk === 'SAFE') {
    riskLevel = 'LOW';
  } else if (rawRisk === 'MEDIUM') {
    riskLevel = 'MEDIUM';
  } else if (rawRisk === 'UNKNOWN') {
    riskLevel = 'UNKNOWN';
  }

  // 4. confidence: normalized integer 0 to 100
  let confidence = Number(raw.confidence);
  if (isNaN(confidence)) confidence = 50;
  if (confidence > 0 && confidence <= 1) {
    confidence = Math.round(confidence * 100);
  } else {
    confidence = Math.min(100, Math.max(0, Math.round(confidence)));
  }

  // Safety rule: if confidence is below 50, force riskLevel = UNKNOWN
  if (confidence < 50 && riskLevel !== 'HIGH') {
    riskLevel = 'UNKNOWN';
  }

  // 5. signals
  let signals = Array.isArray(raw.signals) ? raw.signals : (Array.isArray(raw.scamSignals) ? raw.scamSignals : []);
  signals = signals.map(s => String(s).trim()).filter(Boolean);

  // 6. extractedEntities
  let extractedEntities = [];
  if (Array.isArray(raw.extractedEntities)) {
    extractedEntities = raw.extractedEntities.map(e => {
      if (typeof e === 'object' && e !== null) {
        return `${e.type || e.name || 'entity'}: ${e.value || JSON.stringify(e)}`;
      }
      return String(e).trim();
    }).filter(Boolean);
  } else if (raw.extracted && typeof raw.extracted === 'object') {
    if (raw.extracted.sender) extractedEntities.push(`Sender: ${raw.extracted.sender}`);
    if (raw.extracted.amount) extractedEntities.push(`Amount: ${raw.extracted.amount}`);
    if (Array.isArray(raw.extracted.phoneNumbers)) raw.extracted.phoneNumbers.forEach(p => extractedEntities.push(`Phone: ${p}`));
    if (Array.isArray(raw.extracted.paymentRequests)) raw.extracted.paymentRequests.forEach(pr => extractedEntities.push(`Payment Request: ${pr}`));
  } else {
    if (raw.sender) extractedEntities.push(`Sender: ${raw.sender}`);
    if (raw.amount) extractedEntities.push(`Amount: ${raw.amount}`);
  }

  // 7. recommendedActions
  let recommendedActions = Array.isArray(raw.recommendedActions) ? raw.recommendedActions : [];
  if (recommendedActions.length === 0 && raw.recommendedAction) {
    recommendedActions = [String(raw.recommendedAction)];
  }
  if (recommendedActions.length === 0) {
    if (riskLevel === 'HIGH') {
      recommendedActions = [
        "Do not pay, click links, or call the phone number on this paper.",
        "Contact Sarah or a trusted family member to review this together."
      ];
    } else if (riskLevel === 'UNKNOWN' || riskLevel === 'MEDIUM') {
      recommendedActions = [
        "Retake photo holding the camera steady and capturing the entire paper.",
        "Verify with Sarah or your utility provider before taking action."
      ];
    } else {
      recommendedActions = [
        "Keep this receipt for your records. No action is required."
      ];
    }
  }

  // 8. uncertainty
  let uncertainty = typeof raw.uncertainty === 'string' ? raw.uncertainty.trim() : (typeof raw.uncertaintyExplanation === 'string' ? raw.uncertaintyExplanation.trim() : '');
  if (!uncertainty && (riskLevel === 'UNKNOWN' || confidence < 80)) {
    uncertainty = 'Document contains missing or unverified credentials. Human verification recommended.';
  }

  // Backward compatibility fields for legacy test harnesses
  const extractedObj = {
    sender: null,
    amount: null,
    phoneNumbers: [],
    urls: [],
    paymentRequests: []
  };

  extractedEntities.forEach(ent => {
    const lower = ent.toLowerCase();
    if (lower.startsWith('sender:') || lower.includes('sender:')) {
      extractedObj.sender = ent.split(':')[1]?.trim() || null;
    } else if (lower.startsWith('amount:') || lower.includes('amount:') || ent.includes('$')) {
      const match = ent.match(/\$[\d,]+(\.\d{2})?/);
      extractedObj.amount = match ? match[0] : (ent.split(':')[1]?.trim() || null);
    } else if (lower.startsWith('phone:') || lower.includes('phone:')) {
      extractedObj.phoneNumbers.push(ent.split(':')[1]?.trim() || ent);
    }
  });

  return {
    documentType,
    summary,
    riskLevel,
    confidence,
    signals,
    extractedEntities,
    recommendedActions,
    uncertainty,
    // Helper getters for test suites and views:
    extracted: extractedObj,
    documentClassification: documentType,
    simpleExplanation: summary,
    scamSignals: signals,
    recommendedAction: recommendedActions[0] || 'Please verify before taking action.',
    uncertaintyExplanation: uncertainty || null
  };
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  // 1. GET /api/status
  if (req.method === 'GET' && pathname === '/api/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      isLive: isLiveAI,
      mode: isLiveAI ? 'live' : 'simulated',
      providerName: isLiveAI ? 'Google Gemini 2.5 Flash' : 'SaShaktAI Local Simulation Engine (Rule 10 Compliant)'
    }));
  }

  // 2. POST /api/analyze-document
  if (req.method === 'POST' && pathname === '/api/analyze-document') {
    let body = '';
    let bodyLength = 0;
    let isTooLarge = false;

    req.on('data', chunk => {
      bodyLength += chunk.length;
      if (bodyLength > MAX_PAYLOAD_SIZE && !isTooLarge) {
        isTooLarge = true;
        res.writeHead(413, { 'Content-Type': 'application/json', 'Connection': 'close' });
        res.end(JSON.stringify({ error: 'File too large. Maximum supported image size is 10MB.' }));
        req.resume();
      }
      if (!isTooLarge) body += chunk;
    });

    req.on('end', async () => {
      if (isTooLarge) return;

      try {
        const payload = JSON.parse(body || '{}');
        const { imageBase64, mimeType = 'image/jpeg', textInput = '' } = payload;

        // Force test error if requested by test suite
        if (req.headers['x-test-error'] === 'true') {
          res.writeHead(502, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Simulated backend/API failure for reliability testing.' }));
        }

        // Validate payload contains either an image or context text
        if (!imageBase64 && !textInput) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'No image or document data provided. Please select an image to analyze.' }));
        }

        // If an image is provided, validate it is a supported image format
        if (imageBase64) {
          const isValidPrefix = /^data:image\/(jpeg|jpg|png|webp|svg\+xml|heic);base64,/i.test(imageBase64) || /^[A-Za-z0-9+/=]+$/.test(imageBase64);
          if (!isValidPrefix && !imageBase64.includes('sample_')) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Invalid image format. Please select a valid JPEG, PNG, or WebP image file.' }));
          }
        }

        // Live Gemini Multimodal call if API key is active
        if (isLiveAI && apiKey) {
          try {
            const parts = [{
              text: `
ROLE: SaShaktAI Senior Multimodal Document & Scam Analysis Engine
USER: Eleanor (Age 78, living independently)
KNOWN UTILITIES: Metro Electric & Gas (Account #440-192-881, Autopay active), City Water Dept (#8812-B), Verizon Telecom
TRUSTED CONTACT: Sarah Vance (Daughter: +1-555-234-5678)

TASK:
Examine the document image or text description with senior safety as the highest priority.

SAFETY PRINCIPLES:
1. The AI must NOT claim certainty when evidence is insufficient.
   - BAD: "This is definitely a scam."
   - GOOD: "This message contains several signals commonly associated with scams."
2. If you cannot confidently classify the image:
   - set riskLevel = "UNKNOWN"
   - explain the uncertainty in the "uncertainty" field
   - recommend verification or human assistance in "recommendedActions"
3. If the image is not a document (e.g. personal photo, pet, landscape, food), set documentType to "Non-Document Image", riskLevel to "LOW", and explain in uncertainty that no document text was detected.

STRICT JSON OUTPUT SCHEMA:
{
  "documentType": string,
  "summary": string,
  "riskLevel": "LOW" | "MEDIUM" | "HIGH" | "UNKNOWN",
  "confidence": number, // integer 0 to 100
  "signals": string[],
  "extractedEntities": string[],
  "recommendedActions": string[],
  "uncertainty": string
}
`
            }];

            if (textInput) parts.push({ text: `Additional Document Context: ${textInput}` });
            if (imageBase64) {
              const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '');
              const validMimeType = (mimeType === 'image/png' || mimeType === 'image/webp' || mimeType === 'image/heic') 
                ? mimeType 
                : 'image/jpeg';

              parts.push({
                inline_data: {
                  mime_type: validMimeType,
                  data: cleanBase64
                }
              });
            }

            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;
            const apiRes = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ role: 'user', parts }],
                generationConfig: {
                  temperature: 0.1,
                  responseMimeType: 'application/json'
                }
              })
            });

            if (apiRes.ok) {
              const data = await apiRes.json();
              const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
              if (candidateText) {
                const parsed = JSON.parse(candidateText);
                const validated = validateGeminiResponse(parsed);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({
                  ...validated,
                  isSimulated: false,
                  source: 'Google Gemini 2.5 Flash (Live Multimodal)'
                }));
              }
            } else {
              console.warn('[Server] Gemini API responded with status:', apiRes.status);
            }
          } catch (err) {
            console.warn('[Server] Gemini API call threw error:', err.message);
          }
        }

        // Offline / Simulation fallback per Rule 10
        const sim = generateSimulatedDocumentAnalysis(textInput, imageBase64);
        const validated = validateGeminiResponse(sim);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          ...validated,
          isSimulated: true,
          source: 'SaShaktAI Local Simulation Engine (Demo Mock)'
        }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON payload. Please send a valid document analysis request.' }));
      }
    });
    return;
  }

  // 3. POST /api/chat
  if (req.method === 'POST' && pathname === '/api/chat') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const { message = '' } = JSON.parse(body || '{}');
        const cleanMsg = String(message || '').trim();

        // Check if live Gemini AI is enabled and configured
        if (isLiveAI && apiKey && cleanMsg) {
          try {
            const chatPrompt = `
ROLE: SaShaktAI Senior Voice Companion & Safety Guardian
USER: Eleanor (Age 78, living independently)
PRIMARY CAREGIVER: Sarah Vance (Daughter: +1-555-234-5678, currently connected)
HEALTH: Cardiologist Dr. Linda Chen (Metro Health, tomorrow at 10:30 AM, Senior Transit pickup scheduled for 9:45 AM)
FINANCES: Metro Electric & Gas (Account #440-192-881, Autopay paid in full on Aug 28 for $84.20, balance is $0.00)

USER VOICE QUERY: "${cleanMsg}"

TASK:
Interpret the spoken question and provide a warm, reassuring, concise response for Eleanor (2-3 spoken sentences). Ground in her verified care and account ledger.

STRICT JSON OUTPUT SCHEMA:
{
  "spokenSummary": string,
  "domain": "COMPANION" | "MEDICAL" | "FINANCE" | "FAMILY" | "SECURITY",
  "riskLevel": "safe" | "medium" | "critical",
  "confidence": number, // integer 0 to 100
  "signals": string[],
  "recommendedAction": string
}
`;
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;
            const apiRes = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: chatPrompt }] }],
                generationConfig: {
                  temperature: 0.2,
                  responseMimeType: 'application/json'
                }
              })
            });

            if (apiRes.ok) {
              const data = await apiRes.json();
              const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
              if (candidateText) {
                const parsed = JSON.parse(candidateText);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({
                  spokenSummary: parsed.spokenSummary || cleanMsg,
                  domain: parsed.domain || 'COMPANION',
                  riskLevel: parsed.riskLevel || 'safe',
                  confidence: parsed.confidence || 95,
                  signals: parsed.signals || ['Gemini voice understanding verified'],
                  recommendedAction: parsed.recommendedAction || 'All safe and verified.',
                  isSimulated: false,
                  source: 'Google Gemini 2.5 Flash (Live Voice AI)'
                }));
              }
            } else {
              console.warn('[Server] Live Gemini chat API returned status:', apiRes.status);
            }
          } catch (err) {
            console.warn('[Server] Live Gemini chat call failed, falling back to local simulation:', err.message);
          }
        }

        // Offline / local simulation
        const simResponse = generateSimulatedChatResponse(cleanMsg);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          ...simResponse,
          isSimulated: true,
          source: 'SaShaktAI Local Conversational Intelligence'
        }));
      } catch {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid chat request' }));
      }
    });
    return;
  }

  // 4. Static File Server
  let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Internal Server Error');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

export function generateSimulatedDocumentAnalysis(textInput = '', imageBase64 = '') {
  const lower = (textInput || '').toLowerCase();

  // Test Case 3: Irrelevant non-document image
  if (lower.includes('cat') || lower.includes('pet') || lower.includes('dog') || lower.includes('nature') || lower.includes('landscape') || lower.includes('irrelevant')) {
    return {
      documentType: 'Non-Document / Irrelevant Image',
      summary: 'This image does not appear to contain a paper letter, utility bill, or financial notice.',
      riskLevel: 'LOW',
      confidence: 92,
      signals: ['No financial, utility, or billing text detected in image'],
      extractedEntities: [],
      recommendedActions: ['Please hold up a letter, utility bill, or written notice to analyze.'],
      uncertainty: 'Non-document imagery cannot be evaluated for financial risk.'
    };
  }

  // Test Case 2: Suspicious / Scam Notice
  if (lower.includes('disconnect') || lower.includes('urgent') || lower.includes('scam') || lower.includes('shutoff') || lower.includes('gift card')) {
    return {
      documentType: 'Fraudulent Disconnection Notice (Extortion Scam)',
      summary: 'This message contains several signals commonly associated with scams. Real power companies never demand gift cards or shut off power in two hours.',
      riskLevel: 'HIGH',
      confidence: 94,
      signals: [
        'Immediate threat of power cutoff within 2 hours to create panic',
        'Demands payment via untraceable Target/Apple gift cards or MoneyGram',
        'Suspicious unverified URL (http://pay-fast-energy-relief.biz)',
        'Official utility provider (Metro Electric & Gas) does not demand gift cards or use informal phone lines'
      ],
      extractedEntities: [
        'Sender: Fake Metro Power & Energy',
        'Amount: $485.50',
        'Phone: 1-800-555-0199',
        'Payment: Apple / Target Gift Cards'
      ],
      recommendedActions: [
        "Do not call 1-800-555-0199 or buy any gift cards.",
        "Alert Sarah to review this document together on her caregiver portal."
      ],
      uncertainty: ''
    };
  }

  // Test Case 1b: Torn Slip (Uncertainty Handling)
  if (lower.includes('torn') || lower.includes('unclear') || lower.includes('cut off') || lower.includes('missing')) {
    return {
      documentType: 'Incomplete / Degraded Utility Slip',
      summary: 'Eleanor, this looks like a utility slip, but the top portion with the company name and account credentials is cut off. I want to make sure we do not guess.',
      riskLevel: 'UNKNOWN',
      confidence: 65,
      signals: [
        'Document header and sender credentials are cut off or missing'
      ],
      extractedEntities: [
        'Sender: Unidentified Utility',
        'Amount: $72.00',
        'Date: 15th'
      ],
      recommendedActions: [
        'Could you hold the paper a little higher so I can see the company name at the top?',
        'Or we can check your online account with Sarah.'
      ],
      uncertainty: 'The document image is missing the official sender logo, phone number, and verified billing address.'
    };
  }

  // Test Case 1a: Normal Safe Document
  return {
    documentType: 'Official Monthly Utility Statement',
    summary: 'Eleanor, this is your genuine monthly statement from Metro Electric. It confirms your normal bill was already paid on August 28th via automatic payment.',
    riskLevel: 'LOW',
    confidence: 98,
    signals: [
      'Matches verified account ledger for Metro Electric & Gas (#440-192-881)',
      'No coercive deadlines or non-standard payment demands'
    ],
    extractedEntities: [
      'Sender: Metro Electric & Gas Company',
      'Amount: $0.00 (Balance Paid)',
      'Autopay: Aug 28 ($84.20)',
      'Phone: 1-800-555-METRO'
    ],
    recommendedActions: [
      "You don't need to do anything at all.",
      "You can safely file this receipt away in your records."
    ],
    uncertainty: ''
  };
}

export function generateSimulatedChatResponse(message = '') {
  const lower = (message || '').toLowerCase().trim();

  if (lower.includes('doctor') || lower.includes('appointment') || lower.includes('cardiology') || lower.includes('chen')) {
    return {
      spokenSummary: 'Eleanor, your cardiology checkup with Dr. Linda Chen is confirmed for tomorrow at 10:30 AM. Senior transit pickup is scheduled for 9:45 AM.',
      domain: 'MEDICAL',
      riskLevel: 'safe',
      confidence: 96,
      signals: ['Verified with Dr. Linda Chen schedule at Metro Health', 'Senior Transit ride confirmed for 9:45 AM'],
      recommendedAction: 'Depart at 9:45 AM via Senior Transit. Bring your heart medication list.'
    };
  }

  if (lower.includes('scam') || lower.includes('gift card') || lower.includes('threat') || lower.includes('shutoff') || lower.includes('disconnect') || lower.includes('wire') || lower.includes('fraud')) {
    return {
      spokenSummary: 'Eleanor, please do not worry. Real power companies never demand gift cards or shut off power in two hours. Sarah has been notified to keep you safe.',
      domain: 'SECURITY',
      riskLevel: 'critical',
      confidence: 96,
      signals: ['Immediate shutoff threat signal detected', 'Extortion gift card demand pattern'],
      recommendedAction: 'Do not pay or call unverified numbers. Sarah is reviewing this with you.'
    };
  }

  if (lower.includes('electric') || lower.includes('bill') || lower.includes('autopay') || lower.includes('power') || lower.includes('paid') || lower.includes('utility') || lower.includes('balance') || lower.includes('due')) {
    return {
      spokenSummary: 'Eleanor, your Metro Electric bill was already paid on August 28th via automatic payment for $84.20. Your account balance is $0.00 and in good standing.',
      domain: 'FINANCE',
      riskLevel: 'safe',
      confidence: 98,
      signals: ['Account #440-192-881 confirmed paid in full', 'Autopay active and cleared on Aug 28'],
      recommendedAction: 'No payment is needed. Everything is up to date in your records.'
    };
  }

  if (lower.includes('sarah') || lower.includes('daughter') || lower.includes('call') || lower.includes('family')) {
    return {
      spokenSummary: 'Eleanor, your daughter Sarah is online and active in your safety circle. Would you like me to connect you with her now?',
      domain: 'FAMILY',
      riskLevel: 'safe',
      confidence: 99,
      signals: ['Caregiver Sarah Vance active and connected'],
      recommendedAction: 'Tap Call Sarah to connect immediately.'
    };
  }

  if (lower.includes('emergency') || lower.includes('help me') || lower.includes('fall') || lower.includes('hurt')) {
    return {
      spokenSummary: 'Eleanor, I am alerting Sarah and dispatching emergency assistance for you right now. Please sit down comfortably and remain calm.',
      domain: 'FAMILY',
      riskLevel: 'critical',
      confidence: 99,
      signals: ['Emergency voice trigger detected', 'Caregiver circle prioritized'],
      recommendedAction: 'Stay seated comfortably while Sarah and assistance connect.'
    };
  }

  if (lower.includes('hello') || lower.includes('hi') || lower.includes('good morning') || lower.includes('good afternoon') || lower.includes('how are you') || lower.includes('who are you')) {
    return {
      spokenSummary: 'Good day, Eleanor! I am SaShaktAI, your companion and safety assistant. Everything is quiet and peaceful today, and Sarah is in your safety circle. How can I help you?',
      domain: 'COMPANION',
      riskLevel: 'safe',
      confidence: 99,
      signals: ['Friendly companion greeting recognized'],
      recommendedAction: 'Ask about your schedule, bills, or show me any letter you received.'
    };
  }

  if (lower.includes('thank') || lower.includes('thanks') || lower.includes('appreciate')) {
    return {
      spokenSummary: 'You are so very welcome, Eleanor! I am always right here whenever you need me. Take care and enjoy your day.',
      domain: 'COMPANION',
      riskLevel: 'safe',
      confidence: 99,
      signals: ['Gratitude acknowledged'],
      recommendedAction: 'All tasks completed.'
    };
  }

  // General conversational query fallback
  return {
    spokenSummary: `Eleanor, I heard you ask about "${message}". All your home accounts and schedule are safe and up to date, and Sarah is connected in your circle.`,
    domain: 'COMPANION',
    riskLevel: 'safe',
    confidence: 95,
    signals: ['Voice query parsed and grounded with safety circle'],
    recommendedAction: 'Let me know if you would like me to check an appointment or letter.'
  };
}

server.listen(PORT, () => {
  console.log(`\n=============================================================`);
  console.log(`🛡️  SaShaktAI Zero-Dependency Server running at http://localhost:${PORT}`);
  console.log(`   - Senior Tablet & Caregiver View: http://localhost:${PORT}`);
  console.log(`   - Mode: ${isLiveAI ? '🟢 Live Gemini 2.5 Flash API' : '⚠️ Rule 10 Demo Simulation Mode'}`);
  console.log(`=============================================================\n`);
});
