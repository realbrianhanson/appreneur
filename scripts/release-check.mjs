#!/usr/bin/env node
// Release readiness gate. Manual check only — not normal CI.
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

const failures = [];
const info = [];

const FORBIDDEN = [
  "early access",
  "prelaunch",
  "pre-launch",
  "being recorded",
  "when lessons open",
  "when the lessons open",
  "we'll email you when",
  "we will email you when",
  "lesson preview while videos are recorded",
  "5-day plan",
  "five-day plan",
  "5-day roadmap",
  "five-day roadmap",
];

const CUSTOMER_FACING_ROOTS = [
  "src/components/landing",
  "src/pages",
  "src/components/quiz",
  "supabase/functions/finalize-registration",
  "supabase/functions/send-email",
];

// Internal-only surfaces the owner and admin see, never customers.
// These are excluded from the customer-facing forbidden-phrase scan so
// internal status language (e.g. "external analytics off during
// prelaunch") on admin pages does not produce false positives. The
// real customer-facing landing/quiz/auth/dashboard/day/thank-you/VIP/
// downsell/email surfaces above are still scanned.
const INTERNAL_EXCLUDE_PREFIXES = [
  "src/pages/admin/",
  "src/pages/admin\\",
];

function walk(dir) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const s = statSync(p);
    if (s.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

for (const file of ["index.html", ...CUSTOMER_FACING_ROOTS.flatMap(walk)].filter(existsSync)) {
  if (/\.test\.[tj]sx?$/.test(file)) continue;
  if (INTERNAL_EXCLUDE_PREFIXES.some((p) => file.startsWith(p))) continue;
  const text = readFileSync(file, "utf8");
  const stripped = text
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");
  const lower = stripped.toLowerCase();
  for (const phrase of FORBIDDEN) {
    if (lower.includes(phrase)) {
      failures.push(`Forbidden phrase "${phrase}" in ${file}`);
    }
  }
}

const videosPath = "src/content/lessonVideos.ts";
if (!existsSync(videosPath)) {
  failures.push(`Missing ${videosPath} — configure 5 lesson video/resource URLs before release.`);
} else {
  const src = readFileSync(videosPath, "utf8");
  for (let day = 1; day <= 5; day++) {
    const re = new RegExp(`day\\s*:\\s*${day}[\\s\\S]{0,400}?videoUrl\\s*:\\s*['"]([^'"]*)['"]`);
    const m = src.match(re);
    if (!m || !m[1] || m[1].includes("TODO")) {
      failures.push(`Day ${day} videoUrl is not configured in ${videosPath}`);
    }
  }
  // Landing-page VSL — the owner committed to recording a 3–5 min VSL.
  const vslRe = /LANDING_VSL[\s\S]{0,600}?videoUrl\s*:\s*['"]([^'"]*)['"]/;
  const vslMatch = src.match(vslRe);
  if (!vslMatch || !vslMatch[1] || vslMatch[1].includes("TODO")) {
    failures.push(`Landing VSL videoUrl is not configured in ${videosPath}`);
  }
}

const vipDoc = "docs/VIP_OFFER_BRIEF.md";
if (!existsSync(vipDoc)) {
  failures.push(`Missing ${vipDoc}`);
} else {
  const md = readFileSync(vipDoc, "utf8");
  const rowRe = /\|\s*([^|]+?)\s*\|\s*([^|]*?)\s*\|\s*$/gm;
  let m;
  const missing = [];
  while ((m = rowRe.exec(md))) {
    const label = m[1].trim();
    const value = m[2].trim();
    if (label && label !== "Field" && !label.startsWith("-") && value === "") {
      missing.push(label);
    }
  }
  if (missing.length > 0) {
    failures.push(`VIP owner inputs missing in ${vipDoc}: ${missing.join(", ")}`);
  }
}

const REQUIRED_MARKERS = [
  ["docs/decisions/LEGAL_APPROVED.md", "legal review"],
  ["docs/decisions/EMAIL_CONFIG_APPROVED.md", "email configuration"],
  ["docs/decisions/TESTIMONIALS_APPROVED.md", "testimonial attribution & permissions"],
  ["docs/decisions/CONTENT_APPROVED.md", "VSL + 5 lessons + captions/transcripts + resources + QA"],
  ["docs/decisions/SECURITY_CONFIG_APPROVED.md", "production edge secrets incl. FUNNEL_RATE_LIMIT_SECRET (marker only, no values)"],
];
for (const [marker, label] of REQUIRED_MARKERS) {
  if (!existsSync(marker)) {
    failures.push(`Missing decision marker ${marker} — ${label} must be signed off by the owner.`);
  }
}

info.push("Release gate reports categories only. Never paste secret values into any marker or this report.");

console.log("Release readiness report\n========================\n");
for (const line of info) console.log(`i  ${line}`);
console.log("");
if (failures.length === 0) {
  console.log("Release check passed.");
  process.exit(0);
} else {
  console.log("Release check FAILED:\n");
  for (const f of failures) console.log(`  - ${f}`);
  process.exit(1);
}