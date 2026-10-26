# Automation and AI integrations (optional)

Everything here is off until you configure it. The website works fully without it. Credentials live in Render environment variables or in n8n, never in frontend code.

## Built in (needs only SMTP)
New-enquiry email to the team, acknowledgement email to the customer, booking confirmation, training registration confirmation, quotation email. The dashboard lists follow-ups that are due or overdue.

## Outbound events to n8n
Set `N8N_WEBHOOK_URL` (https only in production) and optionally `N8N_WEBHOOK_SECRET`. The API then POSTs JSON for: `enquiry.created`, `booking.created`, `registration.created`, `quotation.sent`:
```json
{ "event": "enquiry.created", "at": "2026-10-26T10:00:00.000Z", "data": { "id": "…", "full_name": "…", "email": "…", "message": "…" } }
```
If a secret is set, each request carries `x-cyberspark-signature: sha256=<hex HMAC of the raw body>`. Verify it in n8n before acting (Node example: `crypto.createHmac('sha256', secret).update(rawBody).digest('hex')`, compare with `timingSafeEqual`). Failures are logged and never break the website.

These events contain customer personal data. Send them only to an automation platform you control and are comfortable with, and mention it in your privacy policy.

## Inbound: AI suggestions as internal notes
Set `AUTOMATION_API_KEY` (32+ random characters). n8n can then call:
```
POST https://<api>/api/automation/enquiries/<enquiry-id>/note
x-automation-key: <your key>
{ "label": "ai-category" | "ai-draft" | "note", "body": "…" }
```
The text is saved as an **internal note** prefixed `[Automation: …]`. It is never sent to a customer. A team member reads it in the enquiry page and decides what to send.

## Suggested workflows (build these in n8n)
1. **AI categorisation:** trigger on `enquiry.created` → ask an AI model to pick the closest service from the list → post the result as an `ai-category` note.
2. **Draft a reply for approval:** same trigger → AI drafts a reply → post as an `ai-draft` note → a person edits and sends it. Do not auto-send AI text to customers.
3. **CRM sync:** trigger on `enquiry.created` → create a contact in your approved CRM.
4. **WhatsApp / SMS follow-ups:** only with customer consent and an approved provider (for example WhatsApp Business through its official API). Respect opt-outs.
5. **Reminders:** trigger on `booking.created` → schedule a reminder before the slot.

Not included: n8n itself, an AI provider account, a CRM, or WhatsApp Business approval. Each needs your own account and credentials.
