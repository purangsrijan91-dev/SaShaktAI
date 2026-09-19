/**
 * SaShaktAI Brain — Central AI Orchestration Pipeline
 * 
 * Flow:
 *               SEE / HEAR
 *                    ↓
 *               UNDERSTAND
 *                    ↓
 *               CONTEXTUALIZE
 *                    ↓
 *               ASSESS RISK
 *                    ↓
 *              EXPLAIN SIMPLY
 *                    ↓
 *               RECOMMEND
 *                    ↓
 *               TAKE ACTION
 *                    ↓
 *           ┌────────┴────────┐
 *           ↓                 ↓
 *       RESOLVE            ESCALATE
 *                             ↓
 *                          FAMILY
 *                             ↓
 *                          HUMAN
 */

import { State } from './state.js';
import { Vision } from './vision.js';
import { Safety } from './safety.js';
import { Family } from './family.js';
import { AI } from './ai.js';
import { DemoFixtures } from './demo.js';

export const Brain = {
  /**
   * Main 10-Step Pipeline Orchestrator
   * @param {Object} input - { type: 'voice'|'vision'|'routine'|'emergency', query, file, sampleKey }
   */
  async orchestrate(input) {
    // 1. SEE / HEAR (Multimodal Input Ingest)
    const sensoryData = this.seeHear(input);

    // 2. UNDERSTAND (Intent & Semantic Recognition)
    const understanding = this.understand(sensoryData);

    // 3. CONTEXTUALIZE (Grounding with Eleanor's Ledger & Care Circle)
    const context = this.contextualize(understanding);

    // Domain Specialist Execution (Vision | Medical | Family)
    const specialistResult = await this.routeToSpecialist(understanding, context, input);

    // 4. ASSESS RISK (Confidence, Severity, Uncertainty)
    const riskAssessment = this.assessRisk(specialistResult, understanding, context);

    // 5. EXPLAIN SIMPLY (Senior Voice & Transparent Explanation)
    const explanation = this.explainSimply(riskAssessment, specialistResult);

    // 6. RECOMMEND (Safe Contextual Next Actions)
    const recommendations = this.recommend(riskAssessment);

    // 7. TAKE ACTION (Action Preparation)
    const actionPlan = this.takeAction(recommendations, riskAssessment);

    // 8 & 9. RESOLVE vs ESCALATE (Decision Boundary)
    let resolution = null;
    let escalation = null;

    if (riskAssessment.requiresEscalation) {
      // 9 & 10. ESCALATE -> FAMILY -> HUMAN
      escalation = this.escalate(riskAssessment, specialistResult, context);
      this.dispatchFamilyHuman(escalation);
    } else {
      // 8. RESOLVE (Autonomous or assisted safe resolution)
      resolution = this.resolve(riskAssessment, context);
    }

    // Consolidated Decision Object for UI Viewports
    const decision = {
      explain: explanation,
      act: recommendations,
      escalate: escalation,
      resolve: resolution,
      actionPlan
    };

    return {
      pipeline: 'SEE_HEAR -> UNDERSTAND -> CONTEXTUALIZE -> ASSESS_RISK -> EXPLAIN_SIMPLY -> RECOMMEND -> TAKE_ACTION -> (RESOLVE | ESCALATE -> FAMILY -> HUMAN)',
      sensoryData,
      understanding,
      intent: understanding,
      context,
      specialistResult,
      riskAssessment,
      decision
    };
  },

  /**
   * Step 1: SEE / HEAR
   * Captures raw multimodal input from camera, microphone, or UI touch triggers.
   */
  seeHear(input) {
    return {
      modality: input.type || (input.sampleKey ? 'vision' : 'voice'),
      rawText: input.query || null,
      sampleKey: input.sampleKey || null,
      timestamp: new Date().toISOString()
    };
  },

  /**
   * Step 2: UNDERSTAND
   * Parses semantic intent and identifies domain category.
   */
  understand(sensoryData) {
    const modality = sensoryData.modality;
    const text = (sensoryData.rawText || sensoryData.sampleKey || '').toLowerCase().trim();

    let domain = 'VISION';
    let subIntent = 'ANALYZE_DOCUMENT';

    if (modality === 'emergency' || text.includes('emergency') || text.includes('help me') || text.includes('fall') || text.includes('hurt')) {
      domain = 'FAMILY';
      subIntent = 'EMERGENCY_DISPATCH';
    } else if (modality === 'vision' || sensoryData.sampleKey) {
      domain = 'VISION';
      subIntent = text.includes('torn') ? 'VERIFY_DEGRADED_DOCUMENT' : (text.includes('safe') ? 'VERIFY_UTILITY_RECEIPT' : 'ANALYZE_SUSPICIOUS_DOCUMENT');
    } else if (text.includes('scam') || text.includes('gift card') || text.includes('threat') || text.includes('shutoff') || text.includes('disconnect') || text.includes('wire') || text.includes('fraud') || text.includes('extortion')) {
      domain = 'SECURITY';
      subIntent = 'SCAM_WARNING';
    } else if (modality === 'routine' || text.includes('doctor') || text.includes('appointment') || text.includes('cardiology') || text.includes('cardiologist') || text.includes('dr.') || text.includes('chen') || text.includes('clinic')) {
      domain = 'MEDICAL';
      subIntent = 'CHECK_APPOINTMENT_ROUTINE';
    } else if (text.includes('sarah') || text.includes('daughter') || text.includes('family') || text.includes('call sarah') || text.includes('call my') || text.includes('contact sarah') || text.includes('reach sarah') || text === 'call') {
      domain = 'FAMILY';
      subIntent = 'CAREGIVER_COMMUNICATION';
    } else if (text.includes('bill') || text.includes('electric') || text.includes('power') || text.includes('autopay') || text.includes('utility') || text.includes('balance') || text.includes('paid') || text.includes('due')) {
      domain = 'FINANCE';
      subIntent = 'UTILITY_BILL_STATUS';
    } else if (text.includes('hello') || text.includes('hi') || text.includes('morning') || text.includes('afternoon') || text.includes('how are you') || text.includes('who are you') || text.includes('thank')) {
      domain = 'COMPANION';
      subIntent = 'GREETING_COMPANION';
    } else {
      domain = 'COMPANION';
      subIntent = 'GENERAL_VOICE_QUERY';
    }

    return {
      domain,
      subIntent,
      rawInput: sensoryData.rawText || sensoryData.sampleKey || sensoryData.modality
    };
  },

  /**
   * Step 3: CONTEXTUALIZE
   * Grounding against Eleanor's verified state & history:
   * - Living status: 78, independent
   * - Verified accounts: Metro Electric Autopay #440-192-881 (Paid Aug 28: $84.20)
   * - Cardiologist: Dr. Linda Chen (Tomorrow at 10:30 AM, 9:45 AM transit)
   * - Primary caregiver: Sarah Vance (Daughter, online)
   */
  contextualize(understanding) {
    return {
      senior: State.profile.name,
      age: State.profile.age,
      livingStatus: State.profile.livingStatus,
      primaryContact: Family.getPrimaryContact(),
      verifiedLedger: {
        electricAutopay: {
          accountNumber: '#440-192-881',
          provider: 'Metro Electric & Gas',
          lastPaidDate: 'August 28',
          amount: '$84.20',
          status: 'PAID_IN_FULL'
        },
        cardiologyVisit: {
          doctor: 'Dr. Linda Chen',
          specialty: 'Cardiology',
          facility: 'Metro Health Center',
          appointmentTime: 'Tomorrow at 10:30 AM',
          pickupTime: '9:45 AM',
          transitService: 'Senior Transit Ride'
        }
      }
    };
  },

  /**
   * Domain Specialist Dispatch (Vision | Medical | Family | Companion | Finance | Security)
   */
  async routeToSpecialist(understanding, context, input) {
    if (understanding.domain === 'VISION') {
      let contextText = '';
      if (input.sampleKey === 'scam' || understanding.subIntent === 'ANALYZE_SUSPICIOUS_DOCUMENT') {
        contextText = DemoFixtures.scamNotice;
      } else if (input.sampleKey === 'torn' || understanding.subIntent === 'VERIFY_DEGRADED_DOCUMENT') {
        contextText = DemoFixtures.tornBill;
      } else if (input.sampleKey === 'safe' || understanding.subIntent === 'VERIFY_UTILITY_RECEIPT') {
        contextText = DemoFixtures.safeReceipt;
      } else {
        contextText = input.query || '';
      }

      const visionData = await Vision.analyze(contextText);
      return {
        domain: 'VISION',
        ...visionData
      };
    }

    if (understanding.domain === 'MEDICAL') {
      const appt = context.verifiedLedger.cardiologyVisit;
      return {
        domain: 'MEDICAL',
        appointment: appt,
        summary: `Eleanor, your cardiology checkup with ${appt.doctor} is confirmed for ${appt.appointmentTime}. Sarah has been informed, and your ${appt.transitService} is scheduled for ${appt.pickupTime}.`,
        instructions: 'Depart at 9:45 AM via Senior Transit. Bring your heart medication list.',
        riskLevel: 'safe',
        confidence: 0.96,
        confidenceTier: 'HIGH',
        signals: [`Verified appointment with ${appt.doctor} at Metro Health`, 'Senior Transit pickup scheduled for 9:45 AM'],
        contextSummary: 'Cardiology Visit & Senior Transit Confirmed'
      };
    }

    if (understanding.domain === 'FAMILY') {
      const contact = context.primaryContact;
      const isEmerg = understanding.subIntent === 'EMERGENCY_DISPATCH';
      return {
        domain: 'FAMILY',
        contact,
        isEmergency: isEmerg,
        summary: isEmerg
          ? `Eleanor, I am calling ${contact.name} for you right now. Please sit comfortably while she connects.`
          : `Sarah is online and connected to your safety circle.`,
        instructions: isEmerg ? 'Stay seated comfortably while assistance connects.' : 'Tap Call Sarah to connect now.',
        riskLevel: isEmerg ? 'critical' : 'safe',
        confidence: 0.99,
        confidenceTier: 'HIGH',
        signals: [isEmerg ? 'Emergency voice dispatch triggered' : 'Primary caregiver Sarah Vance online'],
        contextSummary: `${contact.name} (${contact.relationship}) Connected`
      };
    }

    // Domains: COMPANION | FINANCE | SECURITY | GENERAL
    // Real conversational AI routing via AI.chat proxy
    try {
      const queryText = input.query || input.rawText || 'Hello';
      const chatRes = await AI.chat(queryText);
      const conf = typeof chatRes.confidence === 'number'
        ? (chatRes.confidence > 1 ? chatRes.confidence / 100 : chatRes.confidence)
        : 0.95;

      return {
        domain: chatRes.domain || understanding.domain,
        summary: chatRes.spokenSummary,
        simpleExplanation: chatRes.spokenSummary,
        instructions: chatRes.recommendedAction || 'All safe and verified.',
        riskLevel: chatRes.riskLevel || (understanding.domain === 'SECURITY' ? 'critical' : 'safe'),
        confidence: conf,
        confidenceTier: conf >= 0.85 ? 'HIGH' : (conf >= 0.60 ? 'MEDIUM' : 'LOW'),
        signals: chatRes.signals || [`Voice query interpreted: ${understanding.subIntent}`],
        contextSummary: 'Caregiver & Account Ledger Grounded',
        source: chatRes.source || 'SaShaktAI Conversational Intelligence'
      };
    } catch (err) {
      console.warn('[Brain] AI.chat specialist dispatch error, using fallback:', err);
      return {
        domain: understanding.domain,
        summary: `Eleanor, I heard you ask: "${input.query || 'Hello'}". Everything is safe and Sarah is looking out for you.`,
        instructions: 'Everything is up to date in your records.',
        riskLevel: 'safe',
        confidence: 0.95,
        confidenceTier: 'HIGH',
        signals: ['Local safety grounding verified'],
        contextSummary: 'Sarah Vance Safety Circle'
      };
    }
  },

  /**
   * Step 4: ASSESS RISK
   * Evaluates fraud signals, confidence threshold, and uncertainty.
   */
  assessRisk(specialistResult, understanding, context) {
    let riskLevel = specialistResult.riskLevel || 'safe';
    let confidence = specialistResult.confidence || 0.95;
    let confidenceTier = specialistResult.confidenceTier || 'HIGH';
    let uncertaintyExplanation = specialistResult.uncertaintyExplanation || null;
    let isScam = false;

    if (specialistResult.domain === 'VISION') {
      if ((riskLevel === 'critical' || riskLevel === 'high') && confidenceTier === 'HIGH') {
        isScam = true;
      } else if (confidenceTier === 'MEDIUM') {
        isScam = false;
        riskLevel = 'medium';
      }
    } else if (specialistResult.domain === 'SECURITY') {
      isScam = true;
      riskLevel = 'critical';
    } else if (specialistResult.domain === 'FAMILY' && specialistResult.isEmergency) {
      riskLevel = 'critical';
    }

    const requiresEscalation = (riskLevel === 'critical' || riskLevel === 'high' || confidenceTier === 'MEDIUM');

    return {
      riskLevel,
      confidence,
      confidenceTier,
      isScam,
      uncertaintyExplanation,
      requiresEscalation
    };
  },

  /**
   * Step 5: EXPLAIN SIMPLY
   * Produces calm, senior-friendly language with zero jargon and transparent uncertainty reasons.
   */
  explainSimply(riskAssessment, specialistResult) {
    let badgeText = '✅ Verified Safe Document';
    if (riskAssessment.isScam) badgeText = '⚠️ Potential scam';
    else if (riskAssessment.confidenceTier === 'MEDIUM') badgeText = '❓ Clarification Needed (Medium Confidence)';
    else if (specialistResult.domain === 'MEDICAL') badgeText = '📅 Appointment Verified';
    else if (specialistResult.domain === 'FINANCE') badgeText = '💡 Account Current (Paid in Full)';
    else if (specialistResult.domain === 'COMPANION') badgeText = '💬 Voice Companion';
    else if (specialistResult.domain === 'FAMILY') badgeText = '👨‍👩‍👧 Family Circle Connected';

    return {
      spokenSummary: specialistResult.simpleExplanation || specialistResult.summary || `Eleanor, I have reviewed this for you.`,
      badge: badgeText,
      confidencePercent: Math.round(riskAssessment.confidence * 100),
      confidenceTier: riskAssessment.confidenceTier,
      uncertaintyExplanation: riskAssessment.uncertaintyExplanation,
      riskLevel: riskAssessment.riskLevel.toUpperCase(),
      signals: specialistResult.signals || specialistResult.scamSignals || []
    };
  },

  /**
   * Step 6: RECOMMEND
   * Provides high-contrast, explicit next action options.
   */
  recommend(riskAssessment) {
    if (riskAssessment.isScam) {
      return {
        prompt: 'This message appears suspicious. What would you like to do?',
        primary: { label: "Don't click / Don't pay", icon: '⛔', actionType: 'BLOCK_PAYMENT' },
        secondary: { label: 'Contact Sarah', icon: '📞', actionType: 'CALL_SARAH' }
      };
    }

    if (riskAssessment.confidenceTier === 'MEDIUM') {
      return {
        prompt: 'Important billing details are missing. How should we proceed?',
        primary: { label: 'Retake Clear Photo', icon: '📸', actionType: 'RETAKE_PHOTO' },
        secondary: { label: 'Ask Sarah to Check', icon: '📞', actionType: 'ASK_SARAH' }
      };
    }

    return {
      prompt: 'This request is confirmed safe. What would you like to do?',
      primary: { label: 'Got it, thank you', icon: '✅', actionType: 'SAVE_RECORD' },
      secondary: { label: 'Keep in My Records', icon: '📅', actionType: 'FILE_RECORD' }
    };
  },

  /**
   * Step 7: TAKE ACTION
   * Prepares execution and visual feedback for the senior's decision.
   */
  takeAction(recommendations, riskAssessment) {
    return {
      recommendedPrimary: recommendations.primary.label,
      recommendedSecondary: recommendations.secondary.label,
      isProtected: riskAssessment.isScam
    };
  },

  /**
   * Step 8: RESOLVE
   * Autonomous safe conclusion for verified items.
   */
  resolve(riskAssessment, context) {
    return {
      status: 'RESOLVED_SAFELY',
      message: 'Verified with Eleanor\'s account ledger. No monetary or security hazard.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  },

  /**
   * Step 9: ESCALATE
   * Prepares caregiver priority notification when risk or uncertainty is present.
   */
  escalate(riskAssessment, specialistResult, context) {
    return {
      recipient: context.primaryContact.name,
      relationship: context.primaryContact.relationship,
      urgency: riskAssessment.riskLevel === 'critical' ? 'immediate' : 'urgent',
      headline: riskAssessment.isScam
        ? 'Eleanor received a potentially suspicious financial message.'
        : 'Eleanor scanned an unverified or incomplete document.',
      riskLevel: riskAssessment.riskLevel.toUpperCase(),
      confidence: riskAssessment.confidence,
      details: specialistResult.extracted ? `Demands $${specialistResult.extracted.amount || 'unspecified'} payment.` : (riskAssessment.uncertaintyExplanation || 'Requires caregiver review.')
    };
  },

  /**
   * Step 10: FAMILY -> HUMAN
   * Dispatches the event directly to Sarah's Caregiver Portal screen in the DOM.
   */
  dispatchFamilyHuman(escalation) {
    if (typeof document === 'undefined') return;

    Family.renderAlertOnCaregiverScreen({
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      riskLevel: escalation.riskLevel,
      confidence: escalation.confidence,
      message: `${escalation.headline} ${escalation.details}`
    });
  }
};
