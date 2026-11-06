# ReplyPilot

Customer-service reply drafts for small Shopify and Etsy sellers that never invent facts.

## Pitch

Small store owners lose hours every week to the same shipping, returns and refund emails. Generic AI writers are fast but dangerous for this job: they happily invent a tracking number, a delivery date or a return policy the store never offered, and the seller is the one who has to live with that promise.

ReplyPilot drafts the reply from one source of truth only: the store's own policy file, plus the facts in the customer's email itself. Shipping times, the return window and refund rules are quoted from the policy the seller controls. If a draft needs a fact that exists in neither place, for example a tracking number nobody provided, ReplyPilot writes `[NEEDS INFO: tracking number and current carrier status]` into the draft and tells the seller exactly what to fill in before sending. The seller always reviews and sends. ReplyPilot only drafts.

## Target customer

Solo owners and very small teams (roughly 1 to 5 people) running a Shopify or Etsy store, handling support email themselves, with steady repeat questions about shipping, returns, refunds and damaged items, and no support staff to absorb mistakes.

## Pricing

USD 19 per month per store. One plan: unlimited drafts, one policy file per store, all five intents.

## How it works

1. The seller keeps a small policy file: shipping times, return window, refund rules, damaged item policy, support hours. It ships as `policy.json` and can be edited in the extension's options page.
2. A customer email comes in. The seller pastes it into ReplyPilot (or picks it from the bundled demo inbox) and selects the intent: shipping status, return, refund, damaged item, or general.
3. The offline template engine extracts the facts the customer actually stated (order number, tracking number, name) and assembles a draft using only those facts and the policy file.
4. Missing facts show up as `[NEEDS INFO: ...]` placeholders with a summary line under the draft. The seller fills them, copies the draft into their mail tool, and sends it themselves.

There is no API key and no network call in this build. `llm-adapter.js` is a clearly separated stub where an optional LLM rewrite pass can be plugged in later, under the same grounding rule.

## Load the extension unpacked

1. Open `chrome://extensions` in Chrome.
2. Turn on Developer mode (top right).
3. Click "Load unpacked" and select this `replypilot` folder.
4. Click the ReplyPilot toolbar icon to open the drafting popup. The same drafting surface is also declared as a side panel (`sidepanel.html`).
5. Right-click the extension and open Options to edit the store policy, or edit `policy.json` in this folder and reload the extension.

## Run the demo page (no Gmail needed)

Open `demo/inbox.html` in a browser (double-click the file, or serve the folder with any static file server). You get a mock inbox for a fictional store, Willow & Wick Home Goods, with 5 sample customer emails:

1. Shipping question with no tracking number anywhere. This is the showcase case: the draft flags `[NEEDS INFO: tracking number and current carrier status]` instead of inventing a number.
2. A return request answered with the policy's 30 day window and label rules.
3. A refund request answered with the policy's refund rules and timeline.
4. A damaged item answered with the replacement-or-refund choice the policy actually offers.
5. A shipping question where the customer did share a tracking number, so the draft quotes that exact number back.

Pick a message, click "Draft a reply with ReplyPilot", and read the draft and its missing-facts summary under it.

## Verify the build

```bash
node test/verify.js
```

This parses the manifest and policy as JSON, generates the showcase draft in Node, and asserts the placeholder behaviour and the contrast case. Full output and notes are in `BUILD_NOTES.md`.

## Files

| File | Purpose |
| --- | --- |
| `manifest.json` | Manifest V3 declaration: popup, side panel, options page |
| `template-engine.js` | Offline drafting engine; enforces the grounding rule |
| `policy.json` | The store policy every draft is grounded in |
| `policy-store.js` | Policy loading: saved edits, then policy.json, then snapshot |
| `options.html`, `options.js` | Options page for editing the policy |
| `sidepanel.html`, `popup.html`, `draft-app.js` | Drafting UI |
| `llm-adapter.js` | Stub for a future optional LLM pass |
| `samples.js` | 5 bundled sample customer emails |
| `demo/inbox.html` | Mock inbox demo page |
| `test/verify.js` | Node verification script |
