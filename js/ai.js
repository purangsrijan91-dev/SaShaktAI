/**
 * SaShaktAI AI Client Module
 * Connects securely to the SaShaktAI backend proxy.
 * ZERO API keys are handled or stored in the browser.
 */

export const AI = {
  async getStatus() {
    try {
      const res = await fetch('/api/status');
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback if running from file:// protocol
    }
    return {
      isLive: false,
      mode: 'simulated',
      providerName: 'SaShaktAI Local Simulation (Rule 10 Compliant)'
    };
  },

  async analyzeDocument(imageBase64, mimeType, textInput) {
    if (typeof window !== 'undefined' && window.location?.protocol !== 'file:') {
      try {
        const res = await fetch('/api/analyze-document', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64, mimeType, textInput })
        });

        if (res.ok) {
          return await res.json();
        } else {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Analysis request failed with status ${res.status}`);
        }
      } catch (err) {
        console.warn('[AI Client] API call failed:', err.message);
        throw err;
      }
    }

    // Direct local fallback if running directly via file:// protocol or Node.js test environment
    return this.offlineFallbackAnalysis(textInput);
  },

  async chat(message) {
    if (typeof window !== 'undefined' && window.location?.protocol !== 'file:') {
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message })
        });

        if (res.ok) {
          return await res.json();
        }
      } catch (err) {
        console.warn('[AI Client] Fetch to /api/chat failed, using local offline fallback:', err);
      }
    }

    return this.offlineFallbackChat(message);
  },

  offlineFallbackChat(message = '') {
    const lower = (message || '').toLowerCase().trim();

    if (lower.includes('doctor') || lower.includes('appointment') || lower.includes('cardiology') || lower.includes('chen')) {
      return {
        spokenSummary: 'Eleanor, your cardiology checkup with Dr. Linda Chen is confirmed for tomorrow at 10:30 AM. Senior transit pickup is scheduled for 9:45 AM.',
        domain: 'MEDICAL',
        riskLevel: 'safe',
        confidence: 0.96,
        signals: ['Verified with Dr. Linda Chen schedule at Metro Health', 'Senior Transit ride confirmed for 9:45 AM'],
        recommendedAction: 'Depart at 9:45 AM via Senior Transit. Bring your heart medication list.',
        isSimulated: true,
        source: 'SaShaktAI Local Simulation (Rule 10 Compliant)'
      };
    }

    if (lower.includes('scam') || lower.includes('gift card') || lower.includes('threat') || lower.includes('shutoff') || lower.includes('disconnect') || lower.includes('wire') || lower.includes('fraud')) {
      return {
        spokenSummary: 'Eleanor, please do not worry. Real power companies never demand gift cards or shut off power in two hours. Sarah has been notified to keep you safe.',
        domain: 'SECURITY',
        riskLevel: 'critical',
        confidence: 0.96,
        signals: ['Immediate shutoff threat signal detected', 'Extortion gift card demand pattern'],
        recommendedAction: 'Do not pay or call unverified numbers. Sarah is reviewing this with you.',
        isSimulated: true,
        source: 'SaShaktAI Local Simulation (Rule 10 Compliant)'
      };
    }

    if (lower.includes('electric') || lower.includes('bill') || lower.includes('autopay') || lower.includes('power') || lower.includes('paid') || lower.includes('utility') || lower.includes('balance') || lower.includes('due')) {
      return {
        spokenSummary: 'Eleanor, your Metro Electric bill was already paid on August 28th via automatic payment for $84.20. Your account balance is $0.00 and in good standing.',
        domain: 'FINANCE',
        riskLevel: 'safe',
        confidence: 0.98,
        signals: ['Account #440-192-881 confirmed paid in full', 'Autopay active and cleared on Aug 28'],
        recommendedAction: 'No payment is needed. Everything is up to date in your records.',
        isSimulated: true,
        source: 'SaShaktAI Local Simulation (Rule 10 Compliant)'
      };
    }

    if (lower.includes('sarah') || lower.includes('daughter') || lower.includes('call') || lower.includes('family')) {
      return {
        spokenSummary: 'Eleanor, your daughter Sarah is online and active in your safety circle. Would you like me to connect you with her now?',
        domain: 'FAMILY',
        riskLevel: 'safe',
        confidence: 0.99,
        signals: ['Caregiver Sarah Vance active and connected'],
        recommendedAction: 'Tap Call Sarah to connect immediately.',
        isSimulated: true,
        source: 'SaShaktAI Local Simulation (Rule 10 Compliant)'
      };
    }

    if (lower.includes('emergency') || lower.includes('help me') || lower.includes('fall') || lower.includes('hurt')) {
      return {
        spokenSummary: 'Eleanor, I am alerting Sarah and dispatching emergency assistance for you right now. Please sit down comfortably and remain calm.',
        domain: 'FAMILY',
        riskLevel: 'critical',
        confidence: 0.99,
        signals: ['Emergency voice trigger detected', 'Caregiver circle prioritized'],
        recommendedAction: 'Stay seated comfortably while Sarah and assistance connect.',
        isSimulated: true,
        source: 'SaShaktAI Local Simulation (Rule 10 Compliant)'
      };
    }

    if (lower.includes('hello') || lower.includes('hi') || lower.includes('good morning') || lower.includes('good afternoon') || lower.includes('how are you') || lower.includes('who are you')) {
      return {
        spokenSummary: 'Good day, Eleanor! I am SaShaktAI, your companion and safety assistant. Everything is quiet and peaceful today, and Sarah is in your safety circle. How can I help you?',
        domain: 'COMPANION',
        riskLevel: 'safe',
        confidence: 0.99,
        signals: ['Friendly companion greeting recognized'],
        recommendedAction: 'Ask about your schedule, bills, or show me any letter you received.',
        isSimulated: true,
        source: 'SaShaktAI Local Simulation (Rule 10 Compliant)'
      };
    }

    if (lower.includes('thank') || lower.includes('thanks') || lower.includes('appreciate')) {
      return {
        spokenSummary: 'You are so very welcome, Eleanor! I am always right here whenever you need me. Take care and enjoy your day.',
        domain: 'COMPANION',
        riskLevel: 'safe',
        confidence: 0.99,
        signals: ['Gratitude acknowledged'],
        recommendedAction: 'All tasks completed.',
        isSimulated: true,
        source: 'SaShaktAI Local Simulation (Rule 10 Compliant)'
      };
    }

    return {
      spokenSummary: `Eleanor, I heard you ask: "${message}". All your home accounts and schedule are safe and up to date, and Sarah is in your circle.`,
      domain: 'COMPANION',
      riskLevel: 'safe',
      confidence: 0.95,
      signals: ['Voice query parsed and grounded with safety circle'],
      recommendedAction: 'Everything is up to date in your records.',
      isSimulated: true,
      source: 'SaShaktAI Local Simulation (Rule 10 Compliant)'
    };
  },

  offlineFallbackAnalysis(textInput = '') {
    const lower = textInput.toLowerCase();
    if (lower.includes('cat') || lower.includes('pet') || lower.includes('nature') || lower.includes('irrelevant')) {
      return {
        documentType: 'Non-Document / Irrelevant Image',
        documentClassification: 'Non-Document / Irrelevant Image',
        summary: 'This image does not appear to contain a paper letter, utility bill, or financial notice.',
        simpleExplanation: 'This image does not appear to contain a paper letter, utility bill, or financial notice.',
        riskLevel: 'LOW',
        confidence: 92,
        signals: ['No financial, utility, or billing text detected in image'],
        scamSignals: ['No financial, utility, or billing text detected in image'],
        extractedEntities: [],
        recommendedActions: ['Please hold up a letter, utility bill, or written notice to analyze.'],
        recommendedAction: 'Please hold up a letter, utility bill, or written notice to analyze.',
        uncertainty: 'Non-document imagery cannot be evaluated for financial risk.',
        uncertaintyExplanation: 'Non-document imagery cannot be evaluated for financial risk.',
        isSimulated: true,
        source: 'SaShaktAI Offline Fallback (Rule 10 Compliant)'
      };
    }

    if (lower.includes('torn') || lower.includes('unclear')) {
      return {
        documentClassification: 'Incomplete / Degraded Utility Slip',
        sender: 'Unidentified Utility',
        amount: '$72.00',
        dates: ['15th'],
        phoneNumbers: [],
        urls: [],
        paymentRequests: ['Standard balance payment'],
        riskLevel: 'medium',
        confidence: 0.65,
        scamSignals: ['Document header and sender credentials are cut off or missing'],
        simpleExplanation: 'Eleanor, this looks like a bill slip, but the top portion with the company name is cut off. I want to make sure we don\'t guess.',
        uncertaintyExplanation: 'The document image is missing the official sender logo, phone number, and verified billing address.',
        recommendedAction: 'Could you hold the paper a little higher so I can see the company name at the top? Or we can check your online account with Sarah.',
        isSimulated: true,
        source: 'SaShaktAI Offline Fallback (Rule 10 Compliant)'
      };
    }

    if (lower.includes('disconnect') || lower.includes('urgent') || lower.includes('scam')) {
      return {
        documentClassification: 'Fraudulent Disconnection Notice (Extortion Scam)',
        sender: 'Fake "Metro Power & Energy"',
        amount: '$485.50',
        dates: ['Immediate (2-hour deadline)'],
        phoneNumbers: ['1-800-555-0199'],
        urls: ['http://pay-fast-energy-relief.biz'],
        paymentRequests: ['Target / Apple Gift Cards', 'MoneyGram wire transfer'],
        riskLevel: 'critical',
        confidence: 0.96,
        scamSignals: [
          'Immediate threat of power cutoff within 2 hours to create panic',
          'Demands payment via untraceable Target/Apple gift cards or MoneyGram',
          'Suspicious unverified URL (http://pay-fast-energy-relief.biz)',
          'Official utility provider (Metro Electric & Gas) does not demand gift cards or use informal phone lines'
        ],
        simpleExplanation: 'Eleanor, please take a deep breath — this paper is a fake scam notice. Real power companies never demand gift cards or shut off power in two hours.',
        uncertaintyExplanation: null,
        recommendedAction: 'Do not call 1-800-555-0199 or buy any gift cards. I am alerting your daughter Sarah right now with a copy of this notice.',
        isSimulated: true,
        source: 'SaShaktAI Offline Fallback (Rule 10 Compliant)'
      };
    }

    return {
      documentClassification: 'Official Monthly Utility Statement',
      sender: 'Metro Electric & Gas Company',
      amount: '$0.00 (Balance Paid)',
      dates: ['August 1 - August 31', 'Autopay processed on Aug 28: $84.20'],
      phoneNumbers: ['1-800-555-METRO'],
      urls: ['https://metroelectric.org'],
      paymentRequests: ['None (Autopay already cleared)'],
      riskLevel: 'safe',
      confidence: 0.98,
      scamSignals: [],
      simpleExplanation: 'Eleanor, this is your genuine monthly statement from Metro Electric. It confirms your normal bill was already paid on August 28th.',
      uncertaintyExplanation: null,
      recommendedAction: 'You don\'t need to do anything at all. You can safely file this receipt away.',
      isSimulated: true,
      source: 'SaShaktAI Offline Fallback (Rule 10 Compliant)'
    };
  }
};
