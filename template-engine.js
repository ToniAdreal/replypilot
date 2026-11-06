"use strict";

/**
 * ReplyPilot template engine (offline, no API key, no network).
 *
 * Grounding rule, enforced here and nowhere else:
 *   A draft may only state facts that come from
 *     (a) the store policy object, or
 *     (b) the customer's own email (order number, tracking number, name).
 *   Any fact that is needed but present in neither source is emitted as a
 *   [NEEDS INFO: ...] placeholder and listed in result.needsInfo.
 *   The engine never invents tracking numbers, dates, prices or policies.
 *
 * This file is environment-agnostic: it runs in the extension pages and in
 * plain Node for the verification script in test/verify.js.
 */

const INTENTS = ["shipping", "return", "refund", "damaged", "general"];

function needsInfo(label) {
  return `[NEEDS INFO: ${label}]`;
}

function extractFacts(emailText) {
  const text = String(emailText || "");
  const facts = { customerName: null, orderNumber: null, trackingNumber: null };

  const orderMatch =
    text.match(/order\s*(?:#|no\.?|number)?\s*[:#]?\s*(\d{3,})/i) ||
    text.match(/#\s*(\d{3,})/);
  if (orderMatch) facts.orderNumber = orderMatch[1];

  // A tracking number is only recognised when the email labels it as one,
  // or when it matches a well-known carrier format (UPS 1Z...).
  const labelled = text.match(
    /tracking(?:\s*(?:number|no\.?|#))?\s*(?:is|:)?\s*([A-Z0-9][A-Z0-9-]{7,})/i
  );
  const ups = text.match(/\b1Z[0-9A-Z]{16}\b/i);
  if (labelled) facts.trackingNumber = labelled[1];
  else if (ups) facts.trackingNumber = ups[0];

  const nameMatch =
    text.match(/(?:thanks|thank you|best|regards|cheers|sincerely)[,]?\s*\n\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i) ||
    text.match(/(?:my name is|i am|i'm)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
  if (nameMatch) facts.customerName = nameMatch[1].trim();

  return facts;
}

function generateDraft({ emailText, intent, policy }) {
  if (!INTENTS.includes(intent)) throw new Error(`Unknown intent: ${intent}`);
  if (!policy) throw new Error("A policy object is required");

  const facts = extractFacts(emailText);
  const missing = [];
  const flag = (label) => {
    if (!missing.includes(label)) missing.push(label);
    return needsInfo(label);
  };

  const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
  const greeting = facts.customerName ? `Hi ${facts.customerName.split(" ")[0]},` : "Hi there,";
  const orderRef = facts.orderNumber
    ? `order #${facts.orderNumber}`
    : flag("order number");
  const signOff = `\n\nBest regards,\n${policy.supportAgentName}\n${policy.storeName}`;

  let body = "";
  if (intent === "shipping") {
    const trackingLine = facts.trackingNumber
      ? `The tracking number you shared with us is ${facts.trackingNumber}. If the carrier page has not updated yet, please allow a little time after the first carrier scan for movement to appear.`
      : `I do not want to guess at your tracking details, so I have left this open for our team to fill in before sending: ${flag("tracking number and current carrier status")}.`;
    body =
      `${greeting}\n\nThanks for getting in touch, and I am sorry for the wait on ${orderRef}.\n\n` +
      `${trackingLine}\n\n` +
      `For reference: ${cap(policy.shipping.processingTime)}. Delivery is ${policy.shipping.domesticDelivery}, and ${policy.shipping.internationalDelivery}. ${cap(policy.shipping.trackingNote)}.\n\n` +
      `If anything above does not match what you are seeing, reply to this email and we will check again.` +
      signOff;
  } else if (intent === "return") {
    body =
      `${greeting}\n\nOf course, we can help with a return for ${orderRef}.\n\n` +
      `Our return window is ${policy.returns.windowDays} days, and ${policy.returns.conditions}. ${policy.returns.label}. ${policy.returns.addressNote}.\n\n` +
      `Once the return reaches us, ${policy.refunds.timeline}.\n\n` +
      `Reply to this email to confirm you would like to go ahead, and we will email your return label.` +
      signOff;
  } else if (intent === "refund") {
    body =
      `${greeting}\n\nThanks for contacting us about a refund for ${orderRef}.\n\n` +
      `Here is exactly what our policy says: ${policy.refunds.rules}. ${policy.refunds.timeline}. Please note: ${policy.refunds.exceptions}.\n\n` +
      `If your request falls outside anything described above, tell us in your reply and a person will review it rather than us guessing: ${facts.orderNumber ? "we have your order number on file from your email" : flag("order number")}.` +
      signOff;
  } else if (intent === "damaged") {
    body =
      `${greeting}\n\nI am really sorry that ${orderRef} arrived damaged. That is on us.\n\n` +
      `Here is what our damaged items policy promises: ${policy.damagedItems.policy}. Also, ${policy.damagedItems.noReturnNeeded}.\n\n` +
      `One note from our policy: ${policy.damagedItems.photoNote}.\n\n` +
      `Reply and tell us whether you would prefer the replacement or the refund, and we will set it up straight away.` +
      signOff;
  } else {
    body =
      `${greeting}\n\nThanks for getting in touch about ${orderRef}.\n\n` +
      `Our support hours are ${policy.businessHours}, and you can always reach us at ${policy.supportEmail}. A member of the team reads every message personally, and the person replying will only quote the policies we have on file rather than guess.\n\n` +
      `Tell us a little more about what you need help with, and we will take it from there.` +
      signOff;
  }

  return { draft: body, factsUsed: facts, needsInfo: missing };
}

const api = { INTENTS, extractFacts, generateDraft, needsInfo };
if (typeof module !== "undefined" && module.exports) module.exports = api;
if (typeof window !== "undefined") window.ReplyPilotEngine = api;
