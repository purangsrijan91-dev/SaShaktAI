/**
 * Phase 1 Comprehensive Test Suite
 * Validates all 7 required Phase 1 test cases against the live SaShaktAI HTTP server:
 * 1. Normal document (safe receipt)
 * 2. Suspicious document (extortion scam notice)
 * 3. Irrelevant image (pet / non-document)
 * 4. Invalid file / malformed payload (HTTP 400 verification)
 * 5. Oversized file (>10MB payload, HTTP 413 verification)
 * 6. Backend / API failure (HTTP 502 simulation with graceful error recovery)
 * 7. Key exposure check (Zero keys in frontend source or localStorage)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BASE_URL = 'http://localhost:3000';

const REQUIRED_SCHEMA_KEYS = [
  'documentType',
  'summary',
  'riskLevel',
  'confidence',
  'signals',
  'extractedEntities',
  'recommendedActions',
  'uncertainty'
];

async function runPhase1Tests() {
  console.log('='.repeat(78));
  console.log('🚀 SASHAKTAI PHASE 1 VERIFICATION TEST SUITE');
  console.log('='.repeat(78));

  let passed = 0;
  const total = 7;

  // Test 1: Normal document (safe receipt)
  console.log('\n[1/7] Testing: Normal Document (Safe Statement)');
  try {
    const res = await fetch(`${BASE_URL}/api/analyze-document`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        textInput: 'METRO ELECTRIC & GAS COMPANY Official Monthly Statement Paid in Full Account #440-192-881 Total Due: $0.00'
      })
    });
    const data = await res.json();
    const hasKeys = REQUIRED_SCHEMA_KEYS.every(k => k in data);
    const isSafe = data.riskLevel === 'LOW' && data.confidence >= 90;
    if (res.ok && hasKeys && isSafe) {
      passed++;
      console.log(`  ✅ PASS: Risk=[${data.riskLevel}], Conf=${data.confidence}%, DocType="${data.documentType}"`);
      console.log(`     Summary: "${data.summary.slice(0, 75)}..."`);
    } else {
      console.log('  ❌ FAIL: Unexpected response', data);
    }
  } catch (err) {
    console.log('  ❌ FAIL:', err.message);
  }

  // Test 2: Suspicious document (extortion scam notice)
  console.log('\n[2/7] Testing: Suspicious Document (Extortion Scam)');
  try {
    const res = await fetch(`${BASE_URL}/api/analyze-document`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        textInput: 'FINAL DISCONNECT WARNING - METRO POWER & ENERGY Power termination within 2 HOURS overdue $485.50. Pay Target Gift Cards call 1-800-555-0199'
      })
    });
    const data = await res.json();
    const hasKeys = REQUIRED_SCHEMA_KEYS.every(k => k in data);
    const isScam = data.riskLevel === 'HIGH' && data.signals.length > 0;
    // Safety check: verify no overconfident statements like "definitely a scam"
    const isSafeLanguage = !data.summary.toLowerCase().includes('definitely a scam');
    if (res.ok && hasKeys && isScam && isSafeLanguage) {
      passed++;
      console.log(`  ✅ PASS: Risk=[${data.riskLevel}], Conf=${data.confidence}%, Signals=${data.signals.length}`);
      console.log(`     Safety check: Softened language verified ("${data.summary.slice(0, 68)}...")`);
    } else {
      console.log('  ❌ FAIL:', data);
    }
  } catch (err) {
    console.log('  ❌ FAIL:', err.message);
  }

  // Test 3: Irrelevant image (pet / non-document)
  console.log('\n[3/7] Testing: Irrelevant Image (Pet / Nature)');
  try {
    const res = await fetch(`${BASE_URL}/api/analyze-document`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        textInput: 'Photograph of personal pet cat Marmalade sitting in sunny garden. No document text.'
      })
    });
    const data = await res.json();
    const hasKeys = REQUIRED_SCHEMA_KEYS.every(k => k in data);
    const isNonDoc = data.documentType.toLowerCase().includes('non-document') && data.riskLevel === 'LOW' && data.uncertainty.length > 0;
    if (res.ok && hasKeys && isNonDoc) {
      passed++;
      console.log(`  ✅ PASS: Classification="${data.documentType}", Risk=[${data.riskLevel}]`);
      console.log(`     Uncertainty explanation: "${data.uncertainty}"`);
    } else {
      console.log('  ❌ FAIL:', data);
    }
  } catch (err) {
    console.log('  ❌ FAIL:', err.message);
  }

  // Test 4: Invalid file / malformed payload (HTTP 400)
  console.log('\n[4/7] Testing: Invalid File / Malformed Payload Handling');
  try {
    // Malformed base64 image data
    const res = await fetch(`${BASE_URL}/api/analyze-document`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBase64: 'CORRUPTED_NOT_BASE64_###$$$',
        mimeType: 'application/octet-stream'
      })
    });
    const data = await res.json();
    if (res.status === 400 && data.error) {
      passed++;
      console.log(`  ✅ PASS: Correctly rejected malformed payload with HTTP 400 Bad Request.`);
      console.log(`     Error message: "${data.error}"`);
    } else {
      console.log(`  ❌ FAIL: Expected 400, got ${res.status}`, data);
    }
  } catch (err) {
    console.log('  ❌ FAIL:', err.message);
  }

  // Test 5: Oversized file (>10MB payload, HTTP 413)
  console.log('\n[5/7] Testing: Oversized File (>10MB Payload) Handling');
  try {
    // Generate a payload exceeding 10MB (11MB string)
    const largePayload = JSON.stringify({
      imageBase64: 'data:image/jpeg;base64,' + 'A'.repeat(11 * 1024 * 1024)
    });
    const res = await fetch(`${BASE_URL}/api/analyze-document`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: largePayload
    });
    const data = await res.json();
    if (res.status === 413 && data.error && data.error.includes('10MB')) {
      passed++;
      console.log(`  ✅ PASS: Correctly rejected 11MB payload with HTTP 413 Payload Too Large.`);
      console.log(`     Error message: "${data.error}"`);
    } else {
      console.log(`  ❌ FAIL: Expected 413, got ${res.status}`, data);
    }
  } catch (err) {
    console.log('  ❌ FAIL:', err.message);
  }

  // Test 6: Backend / API failure (HTTP 502 with x-test-error)
  console.log('\n[6/7] Testing: Backend / API Failure Simulation (HTTP 502)');
  try {
    const res = await fetch(`${BASE_URL}/api/analyze-document`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-test-error': 'true'
      },
      body: JSON.stringify({ textInput: 'sample' })
    });
    const data = await res.json();
    if (res.status === 502 && data.error) {
      passed++;
      console.log(`  ✅ PASS: Server safely intercepted API failure and responded with HTTP 502.`);
      console.log(`     Error message: "${data.error}"`);
    } else {
      console.log(`  ❌ FAIL: Expected 502, got ${res.status}`, data);
    }
  } catch (err) {
    console.log('  ❌ FAIL:', err.message);
  }

  // Test 7: Client Key Exposure Audit
  console.log('\n[7/7] Testing: Security Audit (Zero API Keys or Storage in Client)');
  try {
    const baseDir = path.resolve(__dirname, '..');
    const indexHtml = fs.readFileSync(path.join(baseDir, 'index.html'), 'utf-8');
    const jsFiles = fs.readdirSync(path.join(baseDir, 'js')).filter(f => f.endsWith('.js'));
    
    let exposureDetected = false;
    const suspiciousTerms = [
      'AIzaSy', // Standard Gemini API key prefix
      'localStorage.getItem(\'sashaktai_api_key\')',
      'localStorage.setItem(\'sashaktai_api_key\'',
      'apiKey = "AIza',
      'apiKey = \'AIza'
    ];

    for (const term of suspiciousTerms) {
      if (indexHtml.includes(term)) {
        exposureDetected = true;
        console.log(`  ❌ FAIL: Suspicious token "${term}" found in index.html`);
      }
      for (const jsFile of jsFiles) {
        const content = fs.readFileSync(path.join(baseDir, 'js', jsFile), 'utf-8');
        if (content.includes(term)) {
          exposureDetected = true;
          console.log(`  ❌ FAIL: Suspicious token "${term}" found in js/${jsFile}`);
        }
      }
    }

    // Verify .env.example exists and doesn't contain a real key
    const envExamplePath = path.join(baseDir, '.env.example');
    const envExampleExists = fs.existsSync(envExamplePath);
    let envExampleSafe = false;
    if (envExampleExists) {
      const content = fs.readFileSync(envExamplePath, 'utf-8');
      envExampleSafe = content.includes('GEMINI_API_KEY=') && !content.includes('AIzaSy');
    }

    // Verify .gitignore ignores .env
    const gitignorePath = path.join(baseDir, '.gitignore');
    const gitignoreExists = fs.existsSync(gitignorePath);
    let gitignoreSafe = false;
    if (gitignoreExists) {
      const content = fs.readFileSync(gitignorePath, 'utf-8');
      gitignoreSafe = content.includes('.env');
    }

    if (!exposureDetected && envExampleSafe && gitignoreSafe) {
      passed++;
      console.log('  ✅ PASS: Client source code completely free of API keys & localStorage handling.');
      console.log('     .env.example verified safe (placeholder only).');
      console.log('     .gitignore verified (.env is strictly excluded).');
    } else {
      console.log('  ❌ FAIL: Security audit failed.', { exposureDetected, envExampleSafe, gitignoreSafe });
    }
  } catch (err) {
    console.log('  ❌ FAIL:', err.message);
  }

  console.log('\n' + '='.repeat(78));
  console.log(`🏆 PHASE 1 RESULTS: ${passed} / ${total} Tests Passed (${Math.round((passed / total) * 100)}%)`);
  console.log('='.repeat(78) + '\n');

  if (passed === total) {
    console.log('🎉 ALL PHASE 1 REQUIREMENTS FULLY SATISFIED.');
  } else {
    process.exitCode = 1;
  }
}

runPhase1Tests();
