import type { APIRoute } from 'astro';

export const prerender = false;

// Input caps kept generous but non-abusive. `MIN_MESSAGE_LEN` is the same as the
// old handler; the maximums are new — the old handler had no upper bounds.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_BODY_BYTES = 32 * 1024;
const MAX_NAME_LEN = 200;
const MAX_EMAIL_LEN = 320;
const MAX_MESSAGE_LEN = 5000;
const MIN_MESSAGE_LEN = 5;
// Below this many ms since page-load, treat the submission as a bot. Real users
// take longer than this to focus, type, and click even on the fastest devices.
const MIN_FILL_MS = 1500;

interface Config {
  airtableBaseId: string;
  airtableTableName: string;
  airtableKey: string;
  resendKey: string;
  notifyTo: string;
  notifyFrom: string;
}

type ConfigResult =
  | { ok: true; config: Config }
  | { ok: false; missing: string[] };

function readConfig(): ConfigResult {
  const env = import.meta.env;
  const required = {
    AIRTABLE_BASE_ID: env.AIRTABLE_BASE_ID,
    AIRTABLE_API_KEY: env.AIRTABLE_API_KEY,
    RESEND_API_KEY: env.RESEND_API_KEY,
    NOTIFICATION_EMAIL: env.NOTIFICATION_EMAIL,
    NOTIFICATION_FROM: env.NOTIFICATION_FROM,
  };
  const missing = Object.entries(required)
    .filter(([, v]) => !v)
    .map(([k]) => k);
  if (missing.length) return { ok: false, missing };
  return {
    ok: true,
    config: {
      airtableBaseId: required.AIRTABLE_BASE_ID as string,
      airtableTableName: env.AIRTABLE_TABLE_NAME ?? 'Inquiries',
      airtableKey: required.AIRTABLE_API_KEY as string,
      resendKey: required.RESEND_API_KEY as string,
      notifyTo: required.NOTIFICATION_EMAIL as string,
      notifyFrom: required.NOTIFICATION_FROM as string,
    },
  };
}

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function reqId(): string {
  return Math.random().toString(36).slice(2, 10);
}

// Rate-limiting note: intentionally omitted. Serverless per-invocation memory can't
// hold state across requests, so an in-memory counter would be worse than useless
// (misleading). When real abuse appears, plug in Vercel KV or Upstash here — check
// `${rid}` on ip → count in a 1-hour rolling window, 429 above threshold.

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const rid = reqId();

  const cfg = readConfig();
  if (!cfg.ok) {
    console.error(`[contact:${rid}] misconfigured — missing env vars: ${cfg.missing.join(', ')}`);
    return json({ error: 'server_misconfigured' }, 500);
  }

  const clen = Number(request.headers.get('content-length') ?? '0');
  if (clen > MAX_BODY_BYTES) {
    console.warn(`[contact:${rid}] payload too large: ${clen} bytes`);
    return json({ error: 'payload_too_large' }, 413);
  }

  let data: Record<string, unknown>;
  try {
    data = await request.json();
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }

  const name = typeof data.name === 'string' ? data.name : '';
  const email = typeof data.email === 'string' ? data.email : '';
  const message = typeof data.message === 'string' ? data.message : '';
  const company = typeof data.company === 'string' ? data.company : '';
  const elapsedRaw = typeof data._elapsed === 'number' ? data._elapsed : Number(data._elapsed);

  // Honeypot: bots fill the hidden "company" field. Silent 200 so they don't learn.
  if (company) {
    console.warn(`[contact:${rid}] honeypot tripped from ${clientAddress ?? 'unknown'}`);
    return json({ ok: true }, 200);
  }

  // Time-to-fill: submissions faster than a human can plausibly complete are bots.
  // Silent 200 for the same reason as the honeypot.
  if (Number.isFinite(elapsedRaw) && elapsedRaw < MIN_FILL_MS) {
    console.warn(`[contact:${rid}] too-fast submit: ${elapsedRaw}ms`);
    return json({ ok: true }, 200);
  }

  if (!name.trim() || name.length > MAX_NAME_LEN) {
    return json({ error: 'invalid_input', field: 'name' }, 400);
  }
  if (!EMAIL_RE.test(email) || email.length > MAX_EMAIL_LEN) {
    return json({ error: 'invalid_input', field: 'email' }, 400);
  }
  if (message.trim().length < MIN_MESSAGE_LEN || message.length > MAX_MESSAGE_LEN) {
    return json({ error: 'invalid_input', field: 'message' }, 400);
  }

  const airtablePromise = fetch(
    `https://api.airtable.com/v0/${cfg.config.airtableBaseId}/${encodeURIComponent(cfg.config.airtableTableName)}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cfg.config.airtableKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          Name: name,
          Email: email,
          Message: message,
          ReceivedAt: new Date().toISOString(),
          IP: clientAddress ?? '',
        },
      }),
    }
  );

  const emailPromise = fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${cfg.config.resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: cfg.config.notifyFrom,
      to: cfg.config.notifyTo,
      reply_to: email,
      subject: `New inquiry from ${name}`,
      text: `From: ${name} <${email}>\n\n${message}`,
    }),
  });

  const [airtableRes, emailRes] = await Promise.allSettled([airtablePromise, emailPromise]);

  const airtableOk = airtableRes.status === 'fulfilled' && airtableRes.value.ok;
  const emailOk = emailRes.status === 'fulfilled' && emailRes.value.ok;

  if (!airtableOk) {
    const detail = airtableRes.status === 'rejected'
      ? String(airtableRes.reason)
      : `HTTP ${airtableRes.value.status}`;
    console.error(`[contact:${rid}] airtable failed: ${detail}`);
  }
  if (!emailOk) {
    const detail = emailRes.status === 'rejected'
      ? String(emailRes.reason)
      : `HTTP ${emailRes.value.status}`;
    console.error(`[contact:${rid}] resend failed: ${detail}`);
  }

  // If BOTH channels failed the submission is genuinely lost — surface 502 so the
  // client can prompt the user to retry. If either succeeded, we have the message
  // stored or delivered somewhere, so 200 is the honest response.
  if (!airtableOk && !emailOk) {
    return json({ error: 'delivery_failed' }, 502);
  }

  return json({ ok: true }, 200);
};
