const linksEl = document.getElementById("links");
const statClicks = document.getElementById("stat-clicks");
const badge = document.getElementById("api-badge");
const form = document.getElementById("link-form");
const input = document.getElementById("link-input");
const msg = document.getElementById("form-msg");

function setBadge(up) {
  badge.className = "badge " + (up ? "up" : "down");
  badge.innerHTML = '<span class="dot"></span> ' + (up ? "api online" : "api offline");
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function renderLinks(links) {
  if (!links.length) {
    linksEl.innerHTML = '<p class="muted">No links yet — shorten one above.</p>';
    return;
  }
  linksEl.innerHTML = links
    .map((l) =>
      '<div class="link"><a href="/r/' + l.code + '" target="_blank">/r/' + l.code + "</a>" +
      '<div class="target">' + escapeHtml(l.url) + "</div></div>")
    .join("");
}

async function loadLinks() {
  try {
    const res = await fetch("/api/links");
    if (!res.ok) throw new Error("HTTP " + res.status);
    renderLinks(await res.json());
    setBadge(true);
  } catch (err) {
    linksEl.innerHTML = '<p class="error">Could not load links (' + err.message + ").</p>";
    setBadge(false);
  }
}

async function loadStats() {
  try {
    const res = await fetch("/api/stats");
    const s = await res.json();
    statClicks.textContent = s.totalClicks;
    setBadge(true);
  } catch {
    setBadge(false);
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const url = input.value.trim();
  if (!url) return;
  const res = await fetch("/api/links", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url })
  });
  if (res.ok) {
    const data = await res.json();
    msg.textContent = "Created /r/" + data.code;
    input.value = "";
    loadLinks();
  } else {
    msg.textContent = "Error creating link";
  }
});

loadLinks();
loadStats();
setInterval(loadStats, 5000);
