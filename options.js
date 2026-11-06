"use strict";

/* Options page: edit the policy that every draft is grounded in.
   Saves to chrome.storage.local under "replypilotPolicy".
   The same shape ships as policy.json for sellers who prefer editing a file. */

(function () {
  const FIELDS = [
    ["storeName", "Store name"],
    ["supportEmail", "Support email"],
    ["supportAgentName", "Sign-off name"],
    ["businessHours", "Business hours"],
    ["shipping.processingTime", "Shipping: processing time"],
    ["shipping.domesticDelivery", "Shipping: domestic delivery"],
    ["shipping.internationalDelivery", "Shipping: international delivery"],
    ["shipping.trackingNote", "Shipping: tracking note"],
    ["returns.windowDays", "Returns: window (days)"],
    ["returns.conditions", "Returns: conditions"],
    ["returns.label", "Returns: label"],
    ["returns.addressNote", "Returns: address note"],
    ["refunds.rules", "Refunds: rules"],
    ["refunds.timeline", "Refunds: timeline"],
    ["refunds.exceptions", "Refunds: exceptions"],
    ["damagedItems.policy", "Damaged items: policy"],
    ["damagedItems.noReturnNeeded", "Damaged items: return needed?"],
    ["damagedItems.photoNote", "Damaged items: photo note"],
  ];

  function getPath(obj, path) {
    return path.split(".").reduce((o, k) => (o ? o[k] : undefined), obj);
  }
  function setPath(obj, path, value) {
    const keys = path.split(".");
    let o = obj;
    for (let i = 0; i < keys.length - 1; i++) o = o[keys[i]];
    o[keys[keys.length - 1]] = value;
  }

  let policy = null;
  const form = document.getElementById("policy-form");

  function render() {
    form.innerHTML = "";
    for (const [path, label] of FIELDS) {
      const lab = document.createElement("label");
      lab.textContent = label;
      const input = document.createElement("input");
      input.dataset.path = path;
      input.value = getPath(policy, path) ?? "";
      lab.appendChild(input);
      form.appendChild(lab);
    }
    document.getElementById("policy-json").value = JSON.stringify(policy, null, 2);
  }

  document.addEventListener("DOMContentLoaded", async () => {
    policy = await window.ReplyPilotPolicy.loadPolicy();
    render();

    document.getElementById("save-btn").addEventListener("click", async () => {
      for (const input of form.querySelectorAll("input")) {
        const path = input.dataset.path;
        let value = input.value;
        if (path === "returns.windowDays") value = Number(value);
        setPath(policy, path, value);
      }
      if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
        await chrome.storage.local.set({ replypilotPolicy: policy });
      }
      document.getElementById("policy-json").value = JSON.stringify(policy, null, 2);
      document.getElementById("status").textContent =
        "Saved. New drafts will use this policy. (Outside the extension this page cannot persist edits; edit policy.json instead.)";
    });

    document.getElementById("import-btn").addEventListener("click", () => {
      try {
        policy = JSON.parse(document.getElementById("policy-json").value);
        render();
        document.getElementById("status").textContent = "Imported into the form. Click Save policy to store it.";
      } catch (e) {
        document.getElementById("status").textContent = "That is not valid JSON: " + e.message;
      }
    });

    document.getElementById("reset-btn").addEventListener("click", async () => {
      policy = JSON.parse(JSON.stringify(window.ReplyPilotPolicy.DEFAULT_POLICY));
      if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
        await chrome.storage.local.remove("replypilotPolicy");
      }
      render();
      document.getElementById("status").textContent = "Reset to the bundled policy.json defaults.";
    });
  });
})();
