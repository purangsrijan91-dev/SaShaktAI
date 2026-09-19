/**
 * SaShaktAI Demo Fixtures & Test Scenarios
 * For rapid hackathon demonstration of both Golden Paths.
 */

export const DemoFixtures = {
  scamNotice: `
*** FINAL DISCONNECT WARNING - METRO POWER & ENERGY ***
Date: Immediate Action Required
Account: 9021-UNKNOWN-X
Notice: Power termination scheduled within 2 HOURS due to overdue balance of $485.50.
To stop immediate shutoff, call 1-800-555-0199 immediately.
Payment MUST be made using Target / Apple Gift Cards or MoneyGram wire transfer.
Do not contact local branch offices. Web portal: http://pay-fast-energy-relief.biz
  `.trim(),

  tornBill: `
[Image Note: Camera captured a torn slip of paper with top edge missing]
"... balance of $72.00 due on the 15th ... thank you for your continued patronage ..."
[Company logo and official address are cut off]
  `.trim(),

  safeReceipt: `
METRO ELECTRIC & GAS COMPANY
Official Monthly Statement - Paid in Full
Account: Eleanor Vance #440-192-881
Billing Period: August 1 - August 31
Total Due: $0.00 (Autopay processed on Aug 28: $84.20)
Customer Service: 1-800-555-METRO | https://metroelectric.org
  `.trim(),

  medicalQuery: `
"SaShaktAI, my cardiologist Dr. Linda Chen's office called about my heart checkup
tomorrow morning at 10:30. What do I need to take with me, and how should I get there?"
  `.trim(),

  irrelevantPhoto: `
[Image Note: Photograph of family pet cat sitting in sunlit garden]
"Eleanor's pet cat Marmalade. No printed text, letters, or utility bill notices detected."
  `.trim()
};
