import { describe, it, expect } from "vitest";
import { isSafeWebhookUrl } from "@/lib/webhook-url";

describe("isSafeWebhookUrl SSRF guard", () => {
  it("requires https", () => {
    expect(isSafeWebhookUrl("http://example.com/hook").ok).toBe(false);
  });
  it("rejects localhost hostnames", () => {
    expect(isSafeWebhookUrl("https://localhost/hook").ok).toBe(false);
    expect(isSafeWebhookUrl("https://foo.local/hook").ok).toBe(false);
    expect(isSafeWebhookUrl("https://foo.internal/hook").ok).toBe(false);
  });
  it("rejects loopback and private IPv4", () => {
    expect(isSafeWebhookUrl("https://127.0.0.1/hook").ok).toBe(false);
    expect(isSafeWebhookUrl("https://10.0.0.1/hook").ok).toBe(false);
    expect(isSafeWebhookUrl("https://192.168.1.1/hook").ok).toBe(false);
    expect(isSafeWebhookUrl("https://172.16.5.5/hook").ok).toBe(false);
    expect(isSafeWebhookUrl("https://169.254.169.254/latest").ok).toBe(false);
  });
  it("rejects loopback and private IPv6", () => {
    expect(isSafeWebhookUrl("https://[::1]/hook").ok).toBe(false);
    expect(isSafeWebhookUrl("https://[fe80::1]/hook").ok).toBe(false);
    expect(isSafeWebhookUrl("https://[fd00::1]/hook").ok).toBe(false);
  });
  it("accepts a normal public https URL", () => {
    expect(isSafeWebhookUrl("https://hooks.example.com/x").ok).toBe(true);
  });
  it("rejects malformed URLs", () => {
    expect(isSafeWebhookUrl("not a url").ok).toBe(false);
  });
});