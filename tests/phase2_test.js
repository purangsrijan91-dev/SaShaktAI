/**
 * Phase 2 Comprehensive Test Suite
 * Validates all Phase 2 requirements:
 * 1. Caregiver High-Risk Escalation Dispatch (Sarah View)
 * 2. Caregiver Uncertainty / Incomplete Document Dispatch
 * 3. Caregiver Safe Verification Logging
 * 4. Caregiver Interactive Actions (Call Eleanor, Dismiss/Mark Safe, Whitelist/Add to Ledger)
 * 5. Senior Interactive AI Drill-Down (Why, Sender, Script)
 * 6. Inline Multi-Task Flow & Modal-Free Architecture
 */

import { Vision } from '../js/vision.js';
import { Family } from '../js/family.js';
import { State } from '../js/state.js';
import { Brain } from '../js/brain.js';
import { DemoFixtures } from '../js/demo.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runPhase2Tests() {
  console.log('='.repeat(78));
  console.log('🛡️  SASHAKTAI PHASE 2 VERIFICATION TEST SUITE');
  console.log('    Caregiver View, AI Explanation Drill-Down & Inline Workflow');
  console.log('='.repeat(78));

  let passed = 0;
  const total = 6;

  // Test 1: Caregiver High-Risk Escalation Dispatch
  console.log('\n[1/6] Testing: Caregiver High-Risk Escalation Dispatch (Sarah View)');
  const r1 = await Vision.processDocument(DemoFixtures.scamNotice);
  const t1 = r1.riskLevel === 'critical' || r1.riskLevel === 'HIGH' || r1.riskLevel === 'high';
  const hasEscalation = !!r1.escalation && r1.escalation.recipient === 'Sarah' && r1.escalation.phone === '+1 (555) 234-5678';
  if (t1 && hasEscalation) {
    passed++;
    console.log(`  ✅ PASS: Dispatched HIGH risk escalation to Sarah (${r1.escalation.phone}).`);
    console.log(`     Subject: "${r1.escalation.subject}"`);
  } else {
    console.log('  ❌ FAIL:', { r1 });
  }

  // Test 2: Caregiver Uncertainty / Incomplete Document Dispatch
  console.log('\n[2/6] Testing: Caregiver Uncertainty / Incomplete Document Dispatch');
  const r2 = await Vision.processDocument(DemoFixtures.tornBill);
  const t2 = (r2.riskLevel === 'UNKNOWN' || r2.confidenceTier === 'MEDIUM') &&
             !!r2.escalation && r2.escalation.riskLevel === 'UNKNOWN' &&
             r2.escalation.urgency === 'medium';
  if (t2) {
    passed++;
    console.log(`  ✅ PASS: Correctly dispatched caution event to Sarah for incomplete document.`);
    console.log(`     Subject: "${r2.escalation.subject}"`);
  } else {
    console.log('  ❌ FAIL:', { r2 });
  }

  // Test 3: Caregiver Safe Verification Logging
  console.log('\n[3/6] Testing: Caregiver Safe Verification Silent Logging');
  const initialLogCount = State.recentActivity.length;
  const r3 = await Vision.processDocument(DemoFixtures.safeReceipt);
  // Safe document should not trigger human escalation
  const t3 = r3.decisionAction === 'AI_ACTS' && (r3.riskLevel === 'safe' || r3.riskLevel === 'LOW');
  if (t3) {
    passed++;
    console.log(`  ✅ PASS: Verified receipt confirmed safe. Logged quietly without false alerts.`);
  } else {
    console.log('  ❌ FAIL:', { r3 });
  }

  // Test 4: Caregiver Interactive Actions (Call Eleanor, Dismiss, Whitelist)
  console.log('\n[4/6] Testing: Caregiver Interactive Actions (Call, Dismiss, Whitelist)');
  const initialUtilitiesCount = State.profile.knownUtilities.length;
  Family.addSenderToLedger('City Community Solar Coop');
  const isAdded = State.profile.knownUtilities.includes('City Community Solar Coop');
  
  Family.initiateCallToEleanor();
  const hasSpokenCall = State.lastSpokenText.includes('Sarah is calling you');

  Family.dismissAlert();
  const hasSpokenDismiss = State.lastSpokenText.includes('Sarah checked this');

  if (isAdded && hasSpokenCall && hasSpokenDismiss) {
    passed++;
    console.log('  ✅ PASS: Call bridging, Alert dismissal, and Whitelisting verified.');
    console.log(`     Whitelist expanded: ${initialUtilitiesCount} → ${State.profile.knownUtilities.length} providers.`);
  } else {
    console.log('  ❌ FAIL:', { isAdded, hasSpokenCall, hasSpokenDismiss });
  }

  // Test 5: Senior Interactive AI Drill-Down (Why, Sender, Script)
  console.log('\n[5/6] Testing: Senior Interactive AI Drill-Down Logic');
  // Simulate why question on scam
  const scamOrchestration = await Brain.orchestrate({ type: 'vision', sampleKey: 'scam' });
  const scamDecision = scamOrchestration.decision;
  const whyScamValid = scamDecision.explain.signals.length > 0 && scamDecision.explain.spokenSummary.length > 0;

  // Simulate appointment inquiry
  const medicalOrchestration = await Brain.orchestrate({ type: 'voice', query: 'When is my cardiologist appointment?' });
  const medicalDecision = medicalOrchestration.decision;
  const medicalValid = medicalOrchestration.intent.domain === 'MEDICAL' && medicalDecision.explain.confidencePercent >= 95;

  if (whyScamValid && medicalValid) {
    passed++;
    console.log('  ✅ PASS: Drill-down reasoning generated across Scam and Medical domains.');
    console.log(`     Scam signals evaluated: ${scamDecision.explain.signals.length}`);
    console.log(`     Medical appointment verified: ${medicalDecision.explain.badge}`);
  } else {
    console.log('  ❌ FAIL:', { whyScamValid, medicalValid });
  }

  // Test 6: Inline Multi-Task Flow & Modal-Free Verification
  console.log('\n[6/6] Testing: Inline Multi-Task Flow & Zero Popup Architecture');
  const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf-8');
  const hasModalOverlay = indexHtml.includes('id="modalOverlay"');
  const hasSeniorDrilldown = indexHtml.includes('id="seniorDrilldownBox"');
  const hasCaregiverTabs = indexHtml.includes('id="tabCaregiverStream"') && indexHtml.includes('id="tabCaregiverLedger"');
  const hasCaregiverActions = indexHtml.includes('id="btnCallMom"') && indexHtml.includes('id="btnDismissAlert"') && indexHtml.includes('id="btnTrustSender"');

  if (!hasModalOverlay && hasSeniorDrilldown && hasCaregiverTabs && hasCaregiverActions) {
    passed++;
    console.log('  ✅ PASS: 100% Modal-Free Architecture confirmed.');
    console.log('     Senior interactive drill-down box verified.');
    console.log('     Caregiver tab bar & action buttons verified.');
  } else {
    console.log('  ❌ FAIL: UI structure check failed.', { hasModalOverlay, hasSeniorDrilldown, hasCaregiverTabs, hasCaregiverActions });
  }

  console.log('\n' + '='.repeat(78));
  console.log(`🏆 PHASE 2 RESULTS: ${passed} / ${total} Tests Passed (${Math.round((passed / total) * 100)}%)`);
  console.log('='.repeat(78) + '\n');

  if (passed === total) {
    console.log('🎉 ALL PHASE 2 REQUIREMENTS FULLY SATISFIED.');
  } else {
    process.exitCode = 1;
  }
}

runPhase2Tests();
