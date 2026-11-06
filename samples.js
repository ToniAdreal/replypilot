"use strict";

/**
 * Sample customer emails bundled with ReplyPilot.
 * Used by demo/inbox.html and by test/verify.js.
 *
 * Sample 1 is the grounding showcase: the customer asks about shipping but
 * never provides a tracking number, and the store policy has no tracking
 * number either. The engine must therefore emit a
 * [NEEDS INFO: tracking number and current carrier status] placeholder
 * instead of inventing a number.
 * Sample 5 is the contrast case: the customer DID share a tracking number,
 * so the draft is allowed to quote it back.
 */

const SAMPLE_EMAILS = [
  {
    id: "sample-1",
    intent: "shipping",
    subject: "Where is my order #1042?",
    from: "Maya Chen",
    body:
      "Hi,\n\nI placed order #1042 six days ago and I have not seen any update since the confirmation email. Could you tell me where it is?\n\nThanks,\nMaya Chen",
    showcase:
      "No tracking number appears in this email or in the policy file, so the draft must flag [NEEDS INFO] instead of inventing one.",
  },
  {
    id: "sample-2",
    intent: "return",
    subject: "Return for order #1037",
    from: "Jordan Lee",
    body:
      "Hello,\n\nI would like to return the ceramic mug set from order #1037. It is unused and still in the box, it just does not fit my shelf. How do I send it back?\n\nBest,\nJordan Lee",
    showcase: "Return window, label and conditions all come from the policy file.",
  },
  {
    id: "sample-3",
    intent: "refund",
    subject: "Refund request, order #1029",
    from: "Priya Nair",
    body:
      "Hi,\n\nI cancelled order #1029 last week before it shipped. Can I get a refund, and how long will it take to show up?\n\nRegards,\nPriya Nair",
    showcase: "Refund rules and the 5 business day timeline are quoted from policy, nothing added.",
  },
  {
    id: "sample-4",
    intent: "damaged",
    subject: "Candle jar arrived cracked, order #1051",
    from: "Sam Ortiz",
    body:
      "Hi,\n\nMy candle jar from order #1051 arrived with a crack down the side. The box looked fine, the jar inside is cracked. What can we do?\n\nThanks,\nSam Ortiz",
    showcase: "Damaged items policy offers the choice the policy file actually promises: replacement or refund.",
  },
  {
    id: "sample-5",
    intent: "shipping",
    subject: "Tracking not updating, order #1055",
    from: "Alex Kim",
    body:
      "Hello,\n\nThe tracking for my order #1055 has not moved in three days. My tracking number is 1Z999AA10123456784. Is the parcel lost?\n\nThanks,\nAlex Kim",
    showcase:
      "Contrast case: this customer DID provide a tracking number, so the draft may quote that exact number back.",
  },
];

const samplesApi = { SAMPLE_EMAILS };
if (typeof module !== "undefined" && module.exports) module.exports = samplesApi;
if (typeof window !== "undefined") window.ReplyPilotSamples = samplesApi;
