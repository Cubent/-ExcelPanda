import { auth, currentUser } from '@clerk/nextjs/server';
import { getResendClient } from '@repo/email';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Where support requests land. Override with SUPPORT_TO_EMAIL if it changes.
const SUPPORT_INBOX = process.env.SUPPORT_TO_EMAIL || 'anwarlaxiro@gmail.com';
const TOPICS = ['Bug', 'Billing', 'Question', 'Idea', 'Other'] as const;

// 3 messages per hour per user (per server instance), enough to stop someone spamming the inbox.
const hits = new Map<string, number[]>();
const WINDOW = 3_600_000;
const MAX = 3;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const clean = (v: unknown, max: number) => (typeof v === 'string' ? v.replace(/\r/g, '').trim().slice(0, max) : '');


const esc = (v: string) => v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const TOPIC_COLOR: Record<string, string> = { Bug: '#E76F51', Billing: '#F4B63F', Question: '#2A9D8F', Idea: '#7C5CBF', Other: '#1F4D3A' };

function renderEmail(d: { topic: string; name: string; email: string; message: string; page: string; userId: string }) {
  const color = TOPIC_COLOR[d.topic] ?? '#1F4D3A';
  const row = (k: string, v: string) =>
    `<tr><td style="padding:6px 0;color:#7a8f84;font-size:12px;text-transform:uppercase;letter-spacing:.08em;width:90px;vertical-align:top">${k}</td><td style="padding:6px 0;color:#1F4D3A;font-size:14px;font-weight:600;word-break:break-all">${v}</td></tr>`;
  return `<!doctype html><html><body style="margin:0;padding:24px 12px;background:#F7F8F4;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center">
<table role="presentation" width="560" cellspacing="0" cellpadding="0" style="max-width:560px;width:100%">
<tr><td style="background:#1F4D3A;border-radius:20px 20px 0 0;padding:22px 28px">
  <span style="color:#C7F000;font-size:12px;font-weight:800;letter-spacing:.14em;text-transform:uppercase">ExcelPanda Support</span>
  <div style="color:#ffffff;font-size:22px;font-weight:800;margin-top:6px">New message from ${esc(d.name)}</div>
</td></tr>
<tr><td style="background:#ffffff;padding:26px 28px;border:2px solid #e3e9e2;border-top:0">
  <span style="display:inline-block;background:${color};color:#fff;border-radius:999px;padding:4px 12px;font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase">${esc(d.topic)}</span>
  <div style="margin-top:18px;padding:18px 20px;background:#F7F8F4;border-left:4px solid #C7F000;border-radius:12px;color:#1F4D3A;font-size:15px;line-height:1.65;white-space:pre-wrap">${esc(d.message)}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:22px;border-top:1px solid #e3e9e2;padding-top:10px">
    ${row('From', esc(d.name))}${row('Email', `<a href="mailto:${esc(d.email)}" style="color:#14594F">${esc(d.email)}</a>`)}${row('Page', esc(d.page || 'unknown'))}${row('User ID', esc(d.userId))}
  </table>
  <div style="margin-top:22px;text-align:center"><a href="mailto:${esc(d.email)}?subject=${encodeURIComponent('Re: your ExcelPanda support request')}" style="display:inline-block;background:#1F4D3A;color:#ffffff;text-decoration:none;font-weight:800;font-size:13px;letter-spacing:.06em;text-transform:uppercase;padding:13px 26px;border-radius:14px;border-bottom:4px solid #0F2A1F">Reply to ${esc(d.name.split(' ')[0])}</a></div>
</td></tr>
<tr><td style="padding:14px;text-align:center;color:#9aaa9f;font-size:12px">Sent from the ExcelPanda support page</td></tr>
</table></td></tr></table></body></html>`;
}

export async function POST(req: Request) {
  // Signed-in learners and visitors can both write in. Visitors are limited by IP address.
  const { userId } = await auth();
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
  const who = userId ?? `ip:${ip}`;

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return json({ error: 'Bad request.' }, 400);
  // Hidden field that real people never fill in: bots do. Pretend it worked.
  if (clean(body.website, 100)) return json({ ok: true });

  const topic = TOPICS.find((t) => t === body.topic) ?? 'Other';
  const message = clean(body.message, 4000);
  const email = clean(body.email, 200);
  const page = clean(body.page, 300);
  if (message.length < 10) return json({ error: 'Please tell us a bit more (at least 10 characters).' }, 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: 'Please enter a valid email so we can reply.' }, 400);

  const now = Date.now();
  const recent = (hits.get(who) ?? []).filter((t) => now - t < WINDOW);
  if (recent.length >= MAX) return json({ error: 'You have sent a few messages already. We will get back to you soon!' }, 429);

  const from = process.env.RESEND_FROM;
  if (!process.env.RESEND_TOKEN || !from) {
    return json({ error: 'Support is not set up yet. Please try again later.' }, 503);
  }

  const user = userId ? await currentUser() : null;
  const name = user?.fullName ?? user?.firstName ?? (clean(body.name, 80) || 'ExcelPanda visitor');
  const idLabel = userId ?? 'Not signed in';

  try {
    const { error } = await getResendClient().emails.send({
      from,
      to: SUPPORT_INBOX,
      replyTo: email,
      subject: `[${topic}] Support request from ${name}`,
      html: renderEmail({ topic, name, email, message, page, userId: idLabel }),
      text: `${message}

---
From: ${name} <${email}>
Topic: ${topic}
User ID: ${idLabel}
Page: ${page || 'unknown'}`,
    });
    if (error) throw new Error(error.message);
  } catch {
    return json({ error: 'We could not send your message. Please try again later.' }, 502);
  }

  recent.push(now);
  hits.set(who, recent);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((t) => now - t < WINDOW)) hits.delete(k);
  return json({ ok: true });
}
