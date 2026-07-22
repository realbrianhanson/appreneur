/**
 * Client-side webhook URL safety check. The authoritative check runs inside
 * the fire-webhook edge function; this mirrors it so the admin UI can reject
 * unsafe destinations before saving.
 */
export function isSafeWebhookUrl(input: string): { ok: true } | { ok: false; reason: string } {
  let parsed: URL;
  try {
    parsed = new URL(input);
  } catch {
    return { ok: false, reason: "Invalid URL" };
  }
  if (parsed.protocol !== "https:") {
    return { ok: false, reason: "Webhook URL must use HTTPS" };
  }
  const host = parsed.hostname.toLowerCase();
  if (
    host === "localhost" ||
    host === "0.0.0.0" ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    host.endsWith(".localhost")
  ) {
    return { ok: false, reason: "Local/private hostnames are not allowed" };
  }
  // IPv6 literal
  if (host.startsWith("[") && host.endsWith("]")) {
    const ip = host.slice(1, -1);
    if (
      ip === "::1" ||
      ip === "::" ||
      ip.toLowerCase().startsWith("fe80") ||
      ip.toLowerCase().startsWith("fc") ||
      ip.toLowerCase().startsWith("fd")
    ) {
      return { ok: false, reason: "Loopback/private IPv6 addresses are not allowed" };
    }
  }
  // IPv4 dotted quad
  const v4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (v4) {
    const [a, b] = [parseInt(v4[1], 10), parseInt(v4[2], 10)];
    const isLoopback = a === 127 || a === 0;
    const isLinkLocal = a === 169 && b === 254;
    const isPrivate10 = a === 10;
    const isPrivate192 = a === 192 && b === 168;
    const isPrivate172 = a === 172 && b >= 16 && b <= 31;
    if (isLoopback || isLinkLocal || isPrivate10 || isPrivate192 || isPrivate172) {
      return { ok: false, reason: "Loopback/private IPv4 addresses are not allowed" };
    }
  }
  return { ok: true };
}