const SERVER_URL = "http://localhost:3654/api/video";

// SVG icon: a monitor with a play triangle (represents "send to screen")
const ICON_SVG = `
<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h7v2H8v2h8v-2h-2v-2h7c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z"/>
  <path d="M10 8.5v7l5.5-3.5z"/>
</svg>`;

function getVideoId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("v");
}

function getVideoTitle() {
  const el =
    document.querySelector("h1.ytd-watch-metadata yt-formatted-string") ||
    document.querySelector("h1.ytd-video-primary-info-renderer") ||
    document.querySelector("#title h1");
  return el ? el.textContent.trim() : null;
}

function getCurrentTime() {
  const video = document.querySelector("video");
  return video ? Math.floor(video.currentTime) : 0;
}

function pauseVideo() {
  const video = document.querySelector("video");
  if (video) video.pause();
}

function getPlaylistItems() {
  const renderers = document.querySelectorAll(
    "ytd-playlist-panel-video-renderer"
  );
  const items = [];
  const seenIds = new Set();
  renderers.forEach((renderer) => {
    try {
      const a =
        renderer.querySelector("a#wc-endpoint") ||
        renderer.querySelector('a[href*="watch"]');
      if (!a || !a.href) return;
      const url = new URL(a.href, location.origin);
      const v = url.searchParams.get("v");
      if (!v || seenIds.has(v)) return;
      seenIds.add(v);
      const titleEl =
        renderer.querySelector("#video-title") ||
        renderer.querySelector("span.style-scope.ytd-playlist-panel-video-renderer") ||
        renderer.querySelector("[title]");
      const title = titleEl
        ? (titleEl.textContent || titleEl.getAttribute("title") || "").trim()
        : "";
      items.push({ id: v, title });
    } catch {
      // ignore
    }
  });
  return items;
}

async function sendToXeneon() {
  const id = getVideoId();
  if (!id) return;

  const time = getCurrentTime();
  const title = getVideoTitle();
  const playlistItems = getPlaylistItems();
  const playlistIds = playlistItems.map((i) => i.id);

  let playlistIndex = 0;
  if (playlistIds.length > 1) {
    const idx = playlistIds.indexOf(id);
    if (idx !== -1) playlistIndex = idx;
  }

  pauseVideo();

  try {
    await fetch(SERVER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        title,
        time,
        playlistIds: playlistIds.length > 1 ? playlistIds : null,
        playlistItems: playlistItems.length > 1 ? playlistItems : null,
        playlistIndex,
      }),
    });
  } catch {
    // Server not running
  }
}

function injectButton() {
  if (document.querySelector(".yticue-btn")) return;

  const controls = document.querySelector(".ytp-right-controls");
  if (!controls) return;

  const btn = document.createElement("button");
  btn.className = "ytp-button yticue-btn";
  btn.title = "Send to Xeneon Edge";
  btn.innerHTML = ICON_SVG;

  btn.addEventListener("click", async (e) => {
    e.stopPropagation();
    await sendToXeneon();
    btn.classList.add("yticue-sent");
    setTimeout(() => btn.classList.remove("yticue-sent"), 600);
  });

  controls.insertBefore(btn, controls.firstChild);
}

// YouTube is a SPA: re-inject button on navigation
let lastUrl = location.href;
const observer = new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    setTimeout(injectButton, 1500);
  }
  if (
    !document.querySelector(".yticue-btn") &&
    document.querySelector(".ytp-right-controls")
  ) {
    injectButton();
  }
});
observer.observe(document.body, { childList: true, subtree: true });

setTimeout(injectButton, 2000);
