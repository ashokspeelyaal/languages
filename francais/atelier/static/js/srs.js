/* Leitner-style spaced repetition.
 * 5 boxes with widening intervals; failing an item drops it to box 1.
 * Engine is language-agnostic — ported verbatim from Studeerkamer. */
(function () {
  const INTERVAL_DAYS = [0, 1, 2, 4, 9, 19]; // index = box number

  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  function addDays(iso, days) {
    const d = iso ? new Date(iso) : new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  }

  function nextDueFor(box) {
    const days = INTERVAL_DAYS[Math.max(1, Math.min(5, box))] || 1;
    return addDays(new Date().toISOString(), days);
  }

  function isDue(item) {
    const p = window.Store.getItem(item.id);
    if (!p.lastSeen) return true; // never seen → due
    if (!p.due) return true;
    return p.due <= today();
  }

  function pickDue(items, max) {
    const due = items.filter(isDue);
    shuffle(due);
    // Prioritise lower-box items (struggling ones), then unseen
    due.sort((a, b) => {
      const pa = window.Store.getItem(a.id);
      const pb = window.Store.getItem(b.id);
      if (pa.box !== pb.box) return pa.box - pb.box;
      if (!pa.lastSeen && pb.lastSeen) return -1;
      if (pa.lastSeen && !pb.lastSeen) return 1;
      return 0;
    });
    return due.slice(0, max);
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function boxCounts(items) {
    const c = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, dueToday: 0, unseen: 0 };
    items.forEach((it) => {
      const p = window.Store.state.items[it.id];
      if (!p) {
        c[1] += 1;
        c.unseen += 1;
        c.dueToday += 1;
        return;
      }
      c[p.box] += 1;
      if (isDue(it)) c.dueToday += 1;
    });
    return c;
  }

  window.SRS = { INTERVAL_DAYS, nextDueFor, isDue, pickDue, boxCounts, shuffle, today };
})();
