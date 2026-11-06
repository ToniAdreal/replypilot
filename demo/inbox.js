"use strict";

/* Mock inbox demo. No Gmail access needed.
   Clicking a message shows it; "Draft a reply with ReplyPilot" loads the
   selected email into the drafting flow on this page, and, when this page
   is opened inside the extension, also stages the email in
   chrome.storage so the side panel picks it up automatically. */

(function () {
  let selected = window.ReplyPilotSamples.SAMPLE_EMAILS[0];
  let policy = null;

  function renderList() {
    const list = document.getElementById("inbox-list");
    list.innerHTML = "";
    for (const s of window.ReplyPilotSamples.SAMPLE_EMAILS) {
      const item = document.createElement("button");
      item.type = "button";
      item.className = "mail" + (s.id === selected.id ? " active" : "");
      item.innerHTML = "";
      const subj = document.createElement("strong");
      subj.textContent = s.subject;
      const from = document.createElement("span");
      from.textContent = ` from ${s.from} · intent: ${s.intent}`;
      item.appendChild(subj);
      item.appendChild(from);
      item.addEventListener("click", () => { selected = s; renderList(); renderMessage(); });
      list.appendChild(item);
    }
  }

  function renderMessage() {
    document.getElementById("mail-subject").textContent = selected.subject;
    document.getElementById("mail-body").textContent = selected.body;
    document.getElementById("mail-note").textContent = selected.showcase;
  }

  async function draft() {
    policy = policy || (await window.ReplyPilotPolicy.loadPolicy());
    // Stage for the extension side panel when storage is available.
    try {
      if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
        await chrome.storage.local.set({
          replypilotPendingEmail: { body: selected.body, intent: selected.intent },
        });
      }
    } catch (e) { /* plain browser demo: inline flow below still works */ }

    const result = window.ReplyPilotEngine.generateDraft({
      emailText: selected.body,
      intent: selected.intent,
      policy,
    });
    document.getElementById("draft-output").value = result.draft;
    document.getElementById("needs-info").textContent = result.needsInfo.length
      ? "Human must supply before sending: " + result.needsInfo.join("; ") +
        ". Note the placeholder in the draft where the tracking number would normally go."
      : "No missing facts for this email. The draft only repeats facts from the policy file or the customer's own email (try sample 5, where the customer shared a tracking number and the draft quotes it back).";
    document.getElementById("draft-panel").scrollIntoView({ behavior: "smooth" });
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderList();
    renderMessage();
    document.getElementById("draft-btn").addEventListener("click", draft);
  });
})();
