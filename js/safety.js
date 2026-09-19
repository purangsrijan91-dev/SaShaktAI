/**
 * SaShaktAI Safety & Decision Engine
 * Implements the Safety Principle & Confidence-Gated Decision Framework
 */

export const Safety = {
  evaluateDecision(result) {
    const confidence = typeof result.confidence === 'number' ? result.confidence : 0.5;
    const riskLevel = result.riskLevel || 'medium';
    const isCriticalRisk = riskLevel === 'high' || riskLevel === 'critical';

    let tier = 'MEDIUM';
    if (confidence >= 0.85) tier = 'HIGH';
    else if (confidence < 0.50) tier = 'LOW';

    let decisionAction = 'ASK_CLARIFICATION';

    // Safety Principle: Critical risks always escalate to human caregiver
    if (isCriticalRisk) {
      decisionAction = 'HUMAN_ESCALATION';
    } else if (tier === 'HIGH') {
      decisionAction = 'AI_ACTS';
    } else if (tier === 'MEDIUM') {
      decisionAction = 'ASK_CLARIFICATION';
    } else {
      decisionAction = 'HUMAN_ESCALATION';
    }

    return {
      confidence,
      confidenceTier: tier,
      decisionAction,
      isCriticalRisk,
      uncertaintyExplanation: result.uncertaintyExplanation || (tier !== 'HIGH' ? 'Some details are unclear in the provided document.' : null)
    };
  }
};
