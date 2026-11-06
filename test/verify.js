"use strict";

/**
 * ReplyPilot manual verification, run with: node test/verify.js
 *
 * Checks:
 *  1. manifest.json parses as JSON and declares Manifest V3.
 *  2. policy.json parses and matches the DEFAULT_POLICY snapshot shape.
 *  3. Showcase draft: sample 1 (shipping, no tracking number anywhere)
 *     must contain a [NEEDS INFO: ...] placeholder, must list it in
 *     needsInfo, and must NOT contain any plausible tracking number.
 *  4. Contrast draft: sample 5 (customer shared a tracking number) must
 *     quote that exact number back and need no tracking placeholder.
 */

const fs = require("fs");
const path = require("path");
const engine = require("../template-engine.js");
const { SAMPLE_EMAILS } = require("../samples.js");

const root = path.join(__dirname, "..");
let failures = 0;
function check(label, ok) {
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}`);
  if (!ok) failures++;
}

// 1. Manifest
const manifest = JSON.parse(fs.readFileSync(path.join(root, "manifest.json"), "utf8"));
check("manifest.json parses as JSON", typeof manifest === "object" && manifest !== null);
check("manifest_version is 3", manifest.manifest_version === 3);
check("side_panel declared", Boolean(manifest.side_panel && manifest.side_panel.default_path));
check("options_page declared", manifest.options_page === "options.html");

// 2. Policy
const policy = JSON.parse(fs.readFileSync(path.join(root, "policy.json"), "utf8"));
check("policy.json parses as JSON", typeof policy === "object" && policy !== null);
check("policy has a 30 day return window", policy.returns.windowDays === 30);
check("policy has shipping times", /business days/.test(policy.shipping.domesticDelivery));

// 3. Showcase: missing tracking number must become a placeholder
const sample1 = SAMPLE_EMAILS.find((s) => s.id === "sample-1");
const r1 = engine.generateDraft({ emailText: sample1.body, intent: "shipping", policy });
console.log("\n----- SHOWCASE DRAFT (sample-1, shipping, no tracking number provided) -----");
console.log(r1.draft);
console.log("----- END DRAFT -----\n");
check("showcase draft contains a [NEEDS INFO: ...] placeholder", /\[NEEDS INFO: [^\]]+\]/.test(r1.draft));
check(
  "showcase placeholder is about the tracking number",
  /\[NEEDS INFO: tracking number/.test(r1.draft)
);
check("needsInfo array lists the tracking gap", r1.needsInfo.some((x) => /tracking/.test(x)));
check(
  "showcase draft contains no invented tracking-style number",
  !/1Z[0-9A-Z]{16}/.test(r1.draft) && !/tracking number (?:is|:)\s*[A-Z0-9]{8,}/i.test(r1.draft)
);
check("showcase draft quotes the order number from the email", r1.draft.includes("order #1042"));
check(
  "showcase draft states policy shipping times verbatim",
  r1.draft.includes(policy.shipping.domesticDelivery)
);

// 4. Contrast: provided tracking number may be quoted back
const sample5 = SAMPLE_EMAILS.find((s) => s.id === "sample-5");
const r5 = engine.generateDraft({ emailText: sample5.body, intent: "shipping", policy });
check(
  "contrast draft quotes the customer-provided tracking number exactly",
  r5.draft.includes("1Z999AA10123456784")
);
check("contrast draft needs no tracking placeholder", !/NEEDS INFO: tracking/.test(r5.draft));

// 5. One draft per intent generates without placeholders for order numbers
for (const s of SAMPLE_EMAILS) {
  const r = engine.generateDraft({ emailText: s.body, intent: s.intent, policy });
  check(`draft generates for ${s.id} (intent: ${s.intent})`, typeof r.draft === "string" && r.draft.length > 80);
}

console.log(failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
