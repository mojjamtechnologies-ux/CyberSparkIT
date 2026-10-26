import { waitUntil } from "@vercel/functions";

// On Vercel a function is frozen as soon as it responds, so background work (emails, webhooks)
// must be registered with waitUntil or it may never finish. Elsewhere this simply lets the promise run.
export function keepAlive(promise) {
  try {
    waitUntil(promise);
  } catch {
    /* not running on Vercel */
  }
  return promise;
}
