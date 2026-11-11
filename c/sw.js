// Answers requests for event.ics with a calendar file built from the request's details, right in
// the browser. Safari on iPhone won't open a calendar file the page makes itself (a data: link),
// but hands one that arrives like a normal download to Calendar's Add screen. The details in the
// request never reach the website: this worker answers before anything is sent.
importScripts("ics.js");

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", event => event.waitUntil(self.clients.claim()));

self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);
  if (!url.pathname.endsWith("/c/event.ics")) return;
  const fields = Object.fromEntries(url.searchParams);
  const file = imminentCalendarFile(fields);
  if (!file) {
    event.respondWith(new Response("This calendar link is incomplete.", { status: 400 }));
    return;
  }
  event.respondWith(new Response(file, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="event.ics"',
      "Cache-Control": "no-store",
    },
  }));
});
