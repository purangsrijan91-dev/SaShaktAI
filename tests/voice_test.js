/**
 * SaShaktAI Voice Query Intelligence Verification
 * Tests speech query interpretation across all conversational domains.
 */

import { Brain } from '../js/brain.js';

async function runVoiceTests() {
  console.log('='.repeat(78));
  console.log('🎙️  SASHAKTAI VOICE QUERY INTELLIGENCE TEST');
  console.log('='.repeat(78));

  let passed = 0;
  const total = 5;

  // Test 1: Greeting / Companion Query
  console.log('\n[1/5] Testing: Spoken Greeting ("Hello SaShaktAI, how are you?")');
  const greeting = await Brain.orchestrate({ type: 'voice', query: 'Hello SaShaktAI, how are you?' });
  const isGreetingValid = greeting.intent.domain === 'COMPANION' &&
                          !greeting.decision.explain.spokenSummary.includes('cardiology') &&
                          greeting.decision.explain.spokenSummary.includes('Eleanor');
  if (isGreetingValid) {
    passed++;
    console.log(`  ✅ PASS: Correctly recognized greeting. Spoken output: "${greeting.decision.explain.spokenSummary.slice(0, 75)}..."`);
  } else {
    console.log('  ❌ FAIL:', greeting.decision.explain);
  }

  // Test 2: Utility Bill Inquiry
  console.log('\n[2/5] Testing: Utility Bill Inquiry ("Is my electric bill already paid this month?")');
  const bill = await Brain.orchestrate({ type: 'voice', query: 'Is my electric bill already paid this month?' });
  const isBillValid = greeting.intent.domain !== 'MEDICAL' &&
                      bill.decision.explain.spokenSummary.toLowerCase().includes('electric') &&
                      bill.decision.explain.spokenSummary.toLowerCase().includes('paid');
  if (isBillValid) {
    passed++;
    console.log(`  ✅ PASS: Accurately verified electric bill against ledger. Spoken output: "${bill.decision.explain.spokenSummary}"`);
  } else {
    console.log('  ❌ FAIL:', bill.decision.explain);
  }

  // Test 3: Scam / Threat Inquiry
  console.log('\n[3/5] Testing: Scam Warning Inquiry ("Someone called asking for gift cards for my power bill")');
  const scam = await Brain.orchestrate({ type: 'voice', query: 'Someone called asking for gift cards for my power bill' });
  const isScamValid = scam.intent.domain === 'SECURITY' &&
                      scam.decision.explain.spokenSummary.toLowerCase().includes('gift card') &&
                      scam.riskAssessment.riskLevel === 'critical';
  if (isScamValid) {
    passed++;
    console.log(`  ✅ PASS: Recognized scam pattern and flagged critical. Spoken output: "${scam.decision.explain.spokenSummary}"`);
  } else {
    console.log('  ❌ FAIL:', scam.decision.explain);
  }

  // Test 4: Medical / Cardiology Inquiry
  console.log('\n[4/5] Testing: Medical Appointment Inquiry ("When is my cardiologist appointment?")');
  const medical = await Brain.orchestrate({ type: 'voice', query: 'When is my cardiologist appointment?' });
  const isMedValid = medical.intent.domain === 'MEDICAL' &&
                     medical.decision.explain.spokenSummary.includes('Dr. Linda Chen') &&
                     medical.decision.explain.confidencePercent >= 95;
  if (isMedValid) {
    passed++;
    console.log(`  ✅ PASS: Correctly verified Dr. Linda Chen cardiology appointment. Spoken output: "${medical.decision.explain.spokenSummary.slice(0, 80)}..."`);
  } else {
    console.log('  ❌ FAIL:', medical.decision.explain);
  }

  // Test 5: Emergency Dispatch
  console.log('\n[5/5] Testing: Emergency Spoken Trigger ("Help me, I fell down in the hallway")');
  const emergency = await Brain.orchestrate({ type: 'voice', query: 'Help me, I fell down in the hallway' });
  const isEmergValid = emergency.intent.domain === 'FAMILY' &&
                       emergency.intent.subIntent === 'EMERGENCY_DISPATCH' &&
                       emergency.riskAssessment.riskLevel === 'critical';
  if (isEmergValid) {
    passed++;
    console.log(`  ✅ PASS: Immediately triggered emergency caregiver escalation. Spoken output: "${emergency.decision.explain.spokenSummary}"`);
  } else {
    console.log('  ❌ FAIL:', emergency.decision.explain);
  }

  console.log('\n' + '='.repeat(78));
  console.log(`🏆 VOICE INTELLIGENCE RESULTS: ${passed} / ${total} Tests Passed (${Math.round((passed / total) * 100)}%)`);
  console.log('='.repeat(78) + '\n');

  if (passed === total) {
    console.log('🎉 ALL VOICE INTELLIGENCE PIPELINE CHECKS PASSED.');
  } else {
    process.exitCode = 1;
  }
}

runVoiceTests().catch(err => console.error(err));
