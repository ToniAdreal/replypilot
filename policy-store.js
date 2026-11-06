"use strict";

/**
 * Loads the store policy for the extension pages.
 * Priority: 1) seller edits saved by the options page (chrome.storage),
 *           2) the bundled policy.json file,
 *           3) the DEFAULT_POLICY snapshot below (same content as
 *              policy.json, used when the page is opened outside the
 *              extension, e.g. the demo inbox over file://).
 */

const DEFAULT_POLICY = {
  storeName: "Willow & Wick Home Goods",
  supportEmail: "support@willowandwick.example",
  supportAgentName: "The Willow & Wick support team",
  businessHours: "Monday to Friday, 9am to 5pm US Eastern Time",
  shipping: {
    processingTime: "orders are packed and handed to the carrier within 2 business days of purchase",
    domesticDelivery: "3 to 5 business days within the United States",
    internationalDelivery: "7 to 14 business days outside the United States",
    trackingNote: "a tracking link is emailed as soon as the carrier scans the parcel",
  },
  returns: {
    windowDays: 30,
    conditions: "items must be unused, in their original packaging, and returned within the window above",
    label: "we email a prepaid return label for orders shipped within the United States",
    addressNote: "do not send returns to the address on the original shipping box; use the label we email you",
  },
  refunds: {
    rules: "refunds go back to the original payment method only",
    timeline: "approved refunds are issued within 5 business days of us receiving the returned item, or within 5 business days of an approved cancellation",
    exceptions: "personalised and final-sale items cannot be refunded unless they arrive damaged",
  },
  damagedItems: {
    policy: "for items that arrive damaged, you can choose a free replacement or a full refund",
    noReturnNeeded: "you do not need to post a damaged item back to us unless we specifically ask",
    photoNote: "a photo of the damage helps us pack better next time, but a photo is not required to approve your claim",
  },
};

async function loadPolicy() {
  try {
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      const stored = await chrome.storage.local.get("replypilotPolicy");
      if (stored && stored.replypilotPolicy) return stored.replypilotPolicy;
    }
  } catch (e) { /* fall through */ }
  try {
    const url =
      typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.getURL
        ? chrome.runtime.getURL("policy.json")
        : "policy.json";
    const res = await fetch(url);
    if (res.ok) return await res.json();
  } catch (e) { /* fall through to snapshot */ }
  return JSON.parse(JSON.stringify(DEFAULT_POLICY));
}

const policyApi = { DEFAULT_POLICY, loadPolicy };
if (typeof module !== "undefined" && module.exports) module.exports = policyApi;
if (typeof window !== "undefined") window.ReplyPilotPolicy = policyApi;
