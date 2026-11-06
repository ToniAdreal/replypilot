"use strict";

/* Shared drafting UI for sidepanel.html and popup.html.
   Expects element ids: email-input, intent-select, generate-btn,
   draft-output, needs-info, sample-select, load-sample-btn. */

(function () {
  let policy = null;

  function el(id) { return document.getElementById(id); }

  async function init() {
    policy = await window.ReplyPilotPolicy.loadPolicy();

    const sampleSelect = el("sample-select");
    if (sampleSelect) {
      for (const s of window.ReplyPilotSamples.SAMPLE_EMAILS) {
        const opt = document.createElement("option");
        opt.value = s.id;
        opt.textContent = `${s.from}: ${s.subject}`;
        sampleSelect.appendChild(opt);
      }
      el("load-sample-btn").addEventListener("click", () => {
        const s = window.ReplyPilotSamples.SAMPLE_EMAILS.find((x) => x.id === sampleSelect.value);
        if (!s) return;
        el("email-input").value = s.body;
        el("intent-select").value = s.intent;
        generate();
      });
    }

    // An email staged by demo/inbox.html lands here via chrome.storage.
    try {
      if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
        const staged = await chrome.storage.local.get("replypilotPendingEmail");
        const p = staged && staged.replypilotPendingEmail;
        if (p && p.body) {
          el("email-input").value = p.body;
          if (p.intent) el("intent-select").value = p.intent;
          await chrome.storage.local.remove("replypilotPendingEmail");
          generate();
        }
      }
    } catch (e) { /* demo use outside the extension */ }

    el("generate-btn").addEventListener("click", generate);
    el("copy-btn").addEventListener("click", async () => {
      const text = el("draft-output").value;
      if (text) await navigator.clipboard.writeText(text);
      el("copy-btn").textContent = "Copied";
      setTimeout(() => (el("copy-btn").textContent = "Copy draft"), 1200);
    });
  }

  function generate() {
    const emailText = el("email-input").value.trim();
    const intent = el("intent-select").value;
    if (!emailText) {
      el("needs-info").textContent = "Paste a customer email first, or load a bundled sample.";
      return;
    }
    const result = window.ReplyPilotEngine.generateDraft({ emailText, intent, policy });
    el("draft-output").value = result.draft;
    el("needs-info").textContent = result.needsInfo.length
      ? "Before sending, a human needs to supply: " + result.needsInfo.join("; ") +
        ". ReplyPilot left placeholders instead of inventing these facts."
      : "No missing facts. Every statement in this draft comes from your policy file or the customer's email.";
  }

  document.addEventListener("DOMContentLoaded", init);
})();
