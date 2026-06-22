import type { APIRoute } from 'astro';

export const prerender = false;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const POST: APIRoute = async ({ request, clientAddress }) => {
  try {
    const data = await request.json();
    const { name, email, message, company } = data ?? {};

    // Honeypot: bots fill the hidden "company" field. Silently accept.
    if (company) {
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }

    if (
      typeof name !== 'string' || !name.trim() ||
      typeof email !== 'string' || !EMAIL_RE.test(email) ||
      typeof message !== 'string' || message.trim().length < 5
    ) {
      return new Response(JSON.stringify({ error: 'invalid_input' }), { status: 400 });
    }

    const baseId = import.meta.env.AIRTABLE_BASE_ID;
    const tableName = import.meta.env.AIRTABLE_TABLE_NAME ?? 'Inquiries';
    const airtableKey = import.meta.env.AIRTABLE_API_KEY;
    const resendKey = import.meta.env.RESEND_API_KEY;
    const notifyTo = import.meta.env.NOTIFICATION_EMAIL;
    const notifyFrom = import.meta.env.NOTIFICATION_FROM;

    const airtablePromise = fetch(
      `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${airtableKey}`,
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
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: notifyFrom,
        to: notifyTo,
        reply_to: email,
        subject: `New inquiry from ${name}`,
        text: `From: ${name} <${email}>\n\n${message}`,
      }),
    });

    const [airtableRes, emailRes] = await Promise.allSettled([airtablePromise, emailPromise]);

    if (airtableRes.status === 'rejected' || (airtableRes.status === 'fulfilled' && !airtableRes.value.ok)) {
      console.error('Airtable write failed', airtableRes);
    }
    if (emailRes.status === 'rejected' || (emailRes.status === 'fulfilled' && !emailRes.value.ok)) {
      console.error('Resend send failed', emailRes);
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    console.error('Contact handler error', err);
    return new Response(JSON.stringify({ error: 'server_error' }), { status: 500 });
  }
};
