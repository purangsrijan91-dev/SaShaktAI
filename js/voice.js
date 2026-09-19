/**
 * SaShaktAI Voice Module
 * Provides speech-to-text (STT) and text-to-speech (TTS) in calm, warm senior-friendly tones.
 */

import { State } from './state.js';

export const Voice = {
  recognition: null,

  init() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';
    }
  },

  speak(text) {
    State.lastSpokenText = text;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.log(`[Voice TTS Fallback]: ${text}`);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.88; // Slower, clear pace for seniors
    utterance.pitch = 1.0;

    // Pick gentle natural voice if available
    const voices = window.speechSynthesis.getVoices();
    const friendlyVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Samantha') || v.name.includes('Natural') || v.name.includes('Google')));
    if (friendlyVoice) {
      utterance.voice = friendlyVoice;
    }

    window.speechSynthesis.speak(utterance);
  },

  startListening(onResult, onError) {
    if (!this.recognition) {
      this.init();
    }
    if (!this.recognition) {
      if (onError) onError('not-supported');
      return;
    }

    State.isListening = true;
    this.recognition.onresult = (event) => {
      State.isListening = false;
      const transcript = event.results?.[0]?.[0]?.transcript;
      if (onResult && transcript) {
        onResult(transcript);
      } else if (onError) {
        onError('no-speech');
      }
    };

    this.recognition.onerror = (err) => {
      State.isListening = false;
      if (onError) onError(err.error || 'recognition-error');
    };

    this.recognition.onend = () => {
      State.isListening = false;
    };

    try {
      this.recognition.start();
    } catch (err) {
      State.isListening = false;
      if (onError) onError(err.message || 'start-failed');
    }
  },

  stopListening() {
    if (this.recognition) {
      this.recognition.stop();
      State.isListening = false;
    }
  }
};
