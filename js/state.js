/**
 * SaShaktAI State Management
 * Holds user profile, family circle, active confidence status, and history
 */

export const State = {
  profile: {
    name: 'Eleanor',
    age: 78,
    livingStatus: 'independent',
    trustedContacts: [
      {
        id: 'sarah',
        name: 'Sarah',
        relationship: 'Daughter',
        phone: '+1 (555) 234-5678',
        email: 'sarah@familycare.org',
        isPrimary: true,
        status: 'online'
      },
      {
        id: 'david',
        name: 'David',
        relationship: 'Son',
        phone: '+1 (555) 876-5432',
        email: 'david@familycare.org',
        isPrimary: false,
        status: 'online'
      },
      {
        id: 'nurse',
        name: 'Nurse Jenkins',
        relationship: 'Caregiver / Nurse',
        phone: '+1 (555) 345-6789',
        email: 'nurse.jenkins@homecare.org',
        isPrimary: false,
        status: 'available'
      }
    ],
    knownDoctors: ['Dr. Linda Chen (Cardiologist)', 'Dr. Robert Martinez (Primary Care)'],
    knownUtilities: ['Metro Electric & Gas', 'City Water Department', 'Verizon Telecom']
  },

  isLiveAI: false,
  isListening: false,
  lastSpokenText: '',
  recentActivity: []
};
