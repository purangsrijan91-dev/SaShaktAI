/**
 * SaShaktAI Family Safety Circle & Live Caregiver Portal
 * Provides visible, real-time alert dispatch to Sarah (Daughter).
 */

import { State } from './state.js';
import { Voice } from './voice.js';

export const Family = {
  activeAlertSender: null,

  getPrimaryContact() {
    return State.profile.trustedContacts.find(c => c.isPrimary) || State.profile.trustedContacts[0];
  },

  /**
   * Dispatches a visible escalation event to Sarah's Caregiver Portal in the DOM
   */
  dispatchEscalation(alertPayload) {
    const primary = this.getPrimaryContact();
    const isCritical = alertPayload.riskLevel === 'HIGH' || alertPayload.riskLevel === 'critical';
    const isUncertain = alertPayload.riskLevel === 'UNKNOWN' || alertPayload.riskLevel === 'medium';

    const event = {
      id: 'alert-' + Date.now(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      recipient: primary.name,
      relationship: primary.relationship,
      phone: primary.phone,
      urgency: alertPayload.urgency || (isCritical ? 'urgent' : 'medium'),
      subject: alertPayload.subject || (isCritical ? 'Security Alert' : 'Verification Request'),
      documentClassification: alertPayload.documentClassification || 'Unverified Document',
      amount: alertPayload.amount || 'N/A',
      sender: alertPayload.sender || 'Unknown Organization',
      riskLevel: alertPayload.riskLevel || (isCritical ? 'HIGH' : (isUncertain ? 'UNKNOWN' : 'LOW')),
      confidence: typeof alertPayload.confidence === 'number' ? alertPayload.confidence : 0.94,
      message: alertPayload.message,
      thumbnail: alertPayload.thumbnail || null
    };

    this.activeAlertSender = event.sender;
    State.recentActivity.unshift(event);

    // Render visible event on Sarah's screen
    this.renderAlertOnCaregiverScreen(event);

    return event;
  },

  renderAlertOnCaregiverScreen(event) {
    if (typeof document === 'undefined') return;

    const alertBox = document.getElementById('caregiverAlertBox');
    const logStream = document.getElementById('logStream');
    const isHighRisk = (event.riskLevel || '').toUpperCase() === 'HIGH' || (event.riskLevel || '').toUpperCase() === 'CRITICAL';
    const isUncertain = (event.riskLevel || '').toUpperCase() === 'UNKNOWN' || (event.riskLevel || '').toUpperCase() === 'MEDIUM';

    const confVal = typeof event.confidence === 'number'
      ? (event.confidence <= 1 ? Math.round(event.confidence * 100) : Math.round(event.confidence))
      : 94;

    if (alertBox) {
      if (isHighRisk) {
        alertBox.className = 'caregiver-alert-box threat';
        alertBox.innerHTML = `
          <span class="threat-tag" id="sarahThreatTag">🔔 New alert</span>
          <div class="threat-headline" id="sarahThreatHeadline">Eleanor received a potentially suspicious financial message.</div>
          <div class="threat-stats">
            <div class="stat-badge risk">Risk: <strong id="sarahRiskVal">HIGH</strong></div>
            <div class="stat-badge conf">Confidence: <strong id="sarahConfVal">${confVal}%</strong></div>
          </div>
          <p class="threat-desc" id="sarahDescVal">
            ${event.message || `Document flagged as HIGH RISK (${event.documentClassification}). SaShaktAI advised Eleanor not to pay.`}
          </p>
          <div class="caregiver-actions-bar" id="caregiverActionsBar">
            <button class="btn-caregiver-action view" id="btnViewMessage">
              <span>📄</span>
              <span>View message</span>
            </button>
            <button class="btn-caregiver-action call" id="btnCallMom">
              <span>📞</span>
              <span>Call Eleanor</span>
            </button>
            <button class="btn-caregiver-action dismiss" id="btnDismissAlert">
              <span>✅</span>
              <span>Mark Safe</span>
            </button>
            <button class="btn-caregiver-action trust" id="btnTrustSender">
              <span>🛡️</span>
              <span>Add to Ledger</span>
            </button>
          </div>
        `;
      } else if (isUncertain) {
        alertBox.className = 'caregiver-alert-box threat';
        alertBox.style.borderColor = '#f59e0b';
        alertBox.style.background = '#fffbeb';
        alertBox.innerHTML = `
          <span class="threat-tag" style="background:#f59e0b;">❓ Verification Needed</span>
          <div class="threat-headline" style="color:#b45309;">Eleanor scanned an unverified or incomplete document.</div>
          <div class="threat-stats">
            <div class="stat-badge risk" style="border-color:#fde68a;">Risk: <strong style="color:#d97706;">UNKNOWN</strong></div>
            <div class="stat-badge conf">Confidence: <strong style="color:#d97706;">${confVal}%</strong></div>
          </div>
          <p class="threat-desc" style="color:#78350f;">
            ${event.message || 'Key billing credentials cut off. Eleanor was asked to hold paper steady.'}
          </p>
          <div class="caregiver-actions-bar" id="caregiverActionsBar">
            <button class="btn-caregiver-action view" id="btnViewMessage"><span>📄</span><span>View message</span></button>
            <button class="btn-caregiver-action call" id="btnCallMom"><span>📞</span><span>Call Eleanor</span></button>
            <button class="btn-caregiver-action dismiss" id="btnDismissAlert"><span>✅</span><span>Dismiss</span></button>
          </div>
        `;
      }

      this.bindCaregiverActionButtons();
    }

    if (logStream) {
      const item = document.createElement('div');
      item.className = 'log-item';
      const color = isHighRisk ? '#dc2626' : (isUncertain ? '#d97706' : '#166534');
      const tag = isHighRisk ? '[ESCALATION]' : (isUncertain ? '[CAUTION]' : '[VERIFIED]');
      item.innerHTML = `
        <span class="log-time">${event.timestamp}</span>
        <span class="log-text" style="color:${color}; font-weight:700;">
          ${tag} ${event.documentClassification} processed. Sarah notified.
        </span>
      `;
      logStream.prepend(item);
    }
  },

  logSafeVerification(docPayload) {
    if (typeof document === 'undefined') return;

    const logStream = document.getElementById('logStream');
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (logStream) {
      const item = document.createElement('div');
      item.className = 'log-item';
      item.innerHTML = `
        <span class="log-time">${now}</span>
        <span class="log-text" style="color:#166534; font-weight:700;">
          [VERIFIED SAFE] Eleanor reviewed ${docPayload.documentClassification || 'utility statement'}. Account confirmed current.
        </span>
      `;
      logStream.prepend(item);
    }

    // Keep Sarah's screen in safe tranquil state
    this.clearAlertOnCaregiverScreen(false);
  },

  clearAlertOnCaregiverScreen(addLog = true) {
    if (typeof document === 'undefined') return;

    const alertBox = document.getElementById('caregiverAlertBox');
    const actionsBar = document.getElementById('caregiverActionsBar');
    const logStream = document.getElementById('logStream');

    if (alertBox) {
      alertBox.className = 'caregiver-alert-box empty';
      alertBox.removeAttribute('style');
      alertBox.innerHTML = `
        <div class="alert-icon">🛡️</div>
        <div class="alert-title">No Active Threats Detected</div>
        <p class="alert-subtitle">Eleanor's environment is safe. You will be alerted here immediately if suspicious documents or panic signals appear.</p>
      `;
    }

    if (actionsBar) {
      actionsBar.style.display = 'none';
    }

    if (addLog && logStream) {
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const item = document.createElement('div');
      item.className = 'log-item';
      item.innerHTML = `
        <span class="log-time">${now}</span>
        <span class="log-text" style="color:#166534; font-weight:600;">
          [RESOLVED] Incident marked as verified / dismissed by Sarah.
        </span>
      `;
      logStream.prepend(item);
    }
  },

  initiateCallToEleanor() {
    Voice.speak('Eleanor, Sarah is calling you on your phone right now.');

    if (typeof document !== 'undefined') {
      const callBanner = document.getElementById('callActiveBanner');
      if (callBanner) callBanner.style.display = 'flex';

      const logStream = document.getElementById('logStream');
      if (logStream) {
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const item = document.createElement('div');
        item.className = 'log-item';
        item.innerHTML = `
          <span class="log-time">${now}</span>
          <span class="log-text" style="color:#2563eb; font-weight:700;">
            [VOICE CALL] Connecting bridge from Sarah to Eleanor (+1-555-234-5678)...
          </span>
        `;
        logStream.prepend(item);
      }
    }
  },

  endCall() {
    if (typeof document !== 'undefined') {
      const callBanner = document.getElementById('callActiveBanner');
      if (callBanner) callBanner.style.display = 'none';

      const logStream = document.getElementById('logStream');
      if (logStream) {
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const item = document.createElement('div');
        item.className = 'log-item';
        item.innerHTML = `
          <span class="log-time">${now}</span>
          <span class="log-text" style="color:#475569; font-weight:600;">
            [CALL ENDED] Voice call between Sarah and Eleanor completed.
          </span>
        `;
        logStream.prepend(item);
      }
      Voice.speak('Call finished. Sarah confirmed everything is taken care of.');
    }
  },

  dismissAlert() {
    this.clearAlertOnCaregiverScreen(true);
    Voice.speak('Eleanor, Sarah checked this on her screen and confirmed you can disregard it.');
  },

  addSenderToLedger(senderName) {
    const sender = senderName || this.activeAlertSender || 'Metro Verified Utility';
    if (!State.profile.knownUtilities.includes(sender)) {
      State.profile.knownUtilities.push(sender);
    }

    if (typeof document !== 'undefined') {
      const list = document.getElementById('verifiedLedgerList');
      if (list) {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${sender}:</strong> <span>Added &amp; verified by Sarah Vance (Daughter)</span>`;
        list.appendChild(li);
      }

      const logStream = document.getElementById('logStream');
      if (logStream) {
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const item = document.createElement('div');
        item.className = 'log-item';
        item.innerHTML = `
          <span class="log-time">${now}</span>
          <span class="log-text" style="color:#10b981; font-weight:700;">
            [LEDGER UPDATED] Sarah added "${sender}" to Eleanor's verified list.
          </span>
        `;
        logStream.prepend(item);
      }

      Voice.speak(`Sarah added ${sender} to your verified safety circle.`);
      this.clearAlertOnCaregiverScreen(false);
    }
  },

  bindCaregiverActionButtons() {
    if (typeof document === 'undefined') return;

    document.getElementById('btnCallMom')?.addEventListener('click', () => this.initiateCallToEleanor());
    document.getElementById('btnEndCall')?.addEventListener('click', () => this.endCall());
    document.getElementById('btnDismissAlert')?.addEventListener('click', () => this.dismissAlert());
    document.getElementById('btnTrustSender')?.addEventListener('click', () => this.addSenderToLedger());

    document.getElementById('btnViewMessage')?.addEventListener('click', () => {
      const stage = document.getElementById('previewStage');
      if (stage) {
        stage.style.boxShadow = '0 0 0 4px #2563eb';
        stage.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => { stage.style.boxShadow = ''; }, 2000);
      }
    });
  },

  switchTab(tabName) {
    if (typeof document === 'undefined') return;

    const btnStream = document.getElementById('tabCaregiverStream');
    const btnLedger = document.getElementById('tabCaregiverLedger');
    const secStream = document.getElementById('caregiverStreamSection');
    const secLedger = document.getElementById('caregiverLedgerSection');

    if (tabName === 'stream') {
      btnStream?.classList.add('active');
      btnLedger?.classList.remove('active');
      if (secStream) secStream.style.display = 'block';
      if (secLedger) secLedger.style.display = 'none';
    } else {
      btnLedger?.classList.add('active');
      btnStream?.classList.remove('active');
      if (secStream) secStream.style.display = 'none';
      if (secLedger) secLedger.style.display = 'block';
    }
  }
};
