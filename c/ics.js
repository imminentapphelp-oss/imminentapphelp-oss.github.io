// Builds the calendar file (.ics) for a shared countdown, used by the page (index.html).
//
// The event is described by these fields (all strings):
//   t   title
//   s   start: 20261111T202000Z (timed, UTC) or 20261225 (all-day)
//   end end, same format (all-day: the day after the last day)
//   r   repeat: D, W, M, or Y plus how many, e.g. M1 = every month
function imminentCalendarFile(fields) {
  const escape = s => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Imminent//Countdowns//EN", "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH", "BEGIN:VEVENT",
    "UID:" + (self.crypto && crypto.randomUUID ? crypto.randomUUID() : String(Date.now())) + "@imminent",
    "DTSTAMP:" + stamp];
  const allDay = /^\d{8}$/.test(fields.s || "");
  if (allDay) {
    lines.push("DTSTART;VALUE=DATE:" + fields.s);
    if (/^\d{8}$/.test(fields.end || "")) lines.push("DTEND;VALUE=DATE:" + fields.end);
  } else if (/^\d{8}T\d{6}Z$/.test(fields.s || "")) {
    lines.push("DTSTART:" + fields.s);
    if (/^\d{8}T\d{6}Z$/.test(fields.end || "")) lines.push("DTEND:" + fields.end);
  } else {
    return null;
  }
  const repeat = /^([DWMY])(\d{1,3})$/.exec(fields.r || "");
  if (repeat) {
    const freq = { D: "DAILY", W: "WEEKLY", M: "MONTHLY", Y: "YEARLY" }[repeat[1]];
    lines.push("RRULE:FREQ=" + freq + ";INTERVAL=" + repeat[2]);
  }
  lines.push("SUMMARY:" + escape((fields.t || "Countdown").slice(0, 200)),
    "DESCRIPTION:" + escape("Count down to it with Imminent: https://apps.apple.com/app/id6830674834"),
    "END:VEVENT", "END:VCALENDAR");
  return lines.join("\r\n") + "\r\n";
}
