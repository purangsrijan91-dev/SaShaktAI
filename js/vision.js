/**
 * SaShaktAI Vision Module
 * Real Image/Camera Capture -> Base64 Encoding -> Multimodal AI Pipeline
 */

import { AI } from './ai.js';
import { Safety } from './safety.js';
import { Family } from './family.js';

export const Vision = {
  currentImageData: null,
  currentMimeType: 'image/jpeg',

  /**
   * Reads a real user-uploaded File or Camera capture
   * Automatically normalizes and compresses via Canvas for high performance
   */
  async readImageFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (typeof document === 'undefined' || typeof Image === 'undefined') {
          this.currentImageData = reader.result;
          this.currentMimeType = file.type || 'image/jpeg';
          return resolve(this.currentImageData);
        }

        const img = new Image();
        img.onload = () => {
          const maxDim = 1600;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.85);
          this.currentImageData = compressed;
          this.currentMimeType = 'image/jpeg';
          resolve(compressed);
        };
        img.onerror = () => {
          this.currentImageData = reader.result;
          this.currentMimeType = file.type || 'image/jpeg';
          resolve(this.currentImageData);
        };
        img.src = e.target.result;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  },

  /**
   * Fetches an asset sample and converts it to base64 for processing
   */
  async loadSampleAsset(assetPath, mimeType = 'image/svg+xml') {
    try {
      const res = await fetch(assetPath);
      const text = await res.text();
      const base64 = 'data:' + mimeType + ';base64,' + btoa(unescape(encodeURIComponent(text)));
      this.currentImageData = base64;
      this.currentMimeType = mimeType;
      return { base64, textContent: text };
    } catch (err) {
      console.warn('Could not fetch sample asset:', err);
      return null;
    }
  },

  /**
   * Executes the full Multimodal AI analysis on current active image
   */
  /**
   * Alias for automated test suites
   */
  async processDocument(textInput = '') {
    return this.analyze(textInput);
  },

  async analyze(optionalContextText = '') {
    const rawResult = await AI.analyzeDocument(
      this.currentImageData,
      this.currentMimeType,
      optionalContextText
    );

    const safetyEvaluation = Safety.evaluateDecision(rawResult);

    const result = {
      // Phase 1 Exact Schema Fields
      documentType: rawResult.documentType || rawResult.documentClassification || 'Unclassified Document',
      summary: rawResult.summary || rawResult.simpleExplanation || 'Document analyzed.',
      riskLevel: rawResult.riskLevel || 'UNKNOWN',
      confidence: typeof rawResult.confidence === 'number' ? rawResult.confidence : 50,
      signals: rawResult.signals || rawResult.scamSignals || [],
      extractedEntities: rawResult.extractedEntities || [],
      recommendedActions: rawResult.recommendedActions || (rawResult.recommendedAction ? [rawResult.recommendedAction] : []),
      uncertainty: rawResult.uncertainty || rawResult.uncertaintyExplanation || '',

      // Legacy Helper Aliases for Test Compatibility
      classification: rawResult.documentType || rawResult.documentClassification || 'Unclassified Document',
      extracted: rawResult.extracted || {
        sender: rawResult.sender || null,
        amount: rawResult.amount || null,
        dates: rawResult.dates || [],
        phoneNumbers: rawResult.phoneNumbers || [],
        urls: rawResult.urls || [],
        paymentRequests: rawResult.paymentRequests || []
      },
      confidenceTier: safetyEvaluation.confidenceTier,
      scamSignals: rawResult.signals || rawResult.scamSignals || [],
      simpleExplanation: rawResult.summary || rawResult.simpleExplanation || 'Document analyzed.',
      uncertaintyExplanation: rawResult.uncertainty || safetyEvaluation.uncertaintyExplanation,
      recommendedAction: (rawResult.recommendedActions && rawResult.recommendedActions[0]) || rawResult.recommendedAction || 'Please verify.',
      decisionAction: safetyEvaluation.decisionAction,
      isSimulated: rawResult.isSimulated,
      source: rawResult.source
    };

    // Visible Caregiver Escalation & Logging (Phase 2)
    if (result.decisionAction === 'HUMAN_ESCALATION' || result.riskLevel === 'HIGH' || result.riskLevel === 'critical') {
      result.escalation = Family.dispatchEscalation({
        urgency: safetyEvaluation.isCriticalRisk ? 'immediate' : 'urgent',
        subject: `⚠️ Document Risk Alert for Eleanor`,
        documentClassification: result.classification,
        amount: result.extracted?.amount,
        sender: result.extracted?.sender,
        riskLevel: 'HIGH',
        confidence: result.confidence,
        message: `Hi Sarah, Eleanor scanned a document flagged as HIGH RISK (${result.classification}). Amount requested: ${result.extracted?.amount || 'N/A'}. SaShaktAI advised Eleanor not to pay. Please review the live preview below or call Eleanor.`,
        thumbnail: this.currentImageData
      });
    } else if (result.decisionAction === 'ASK_CLARIFICATION' || result.riskLevel === 'UNKNOWN') {
      result.escalation = Family.dispatchEscalation({
        urgency: 'medium',
        subject: `❓ Incomplete Document Scanned by Eleanor`,
        documentClassification: result.classification,
        amount: result.extracted?.amount,
        sender: result.extracted?.sender,
        riskLevel: 'UNKNOWN',
        confidence: result.confidence,
        message: `Eleanor scanned an incomplete document (${result.classification}). Key credentials or sender logo were cut off. SaShaktAI requested Eleanor hold the document steady.`,
        thumbnail: this.currentImageData
      });
    } else {
      Family.logSafeVerification({
        documentClassification: result.classification,
        amount: result.extracted?.amount,
        sender: result.extracted?.sender
      });
    }

    return result;
  }
};
