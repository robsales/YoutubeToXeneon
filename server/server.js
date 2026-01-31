const http = require("http");
const fs = require("fs");
const path = require("path");

const DEFAULT_PORT = 3654;
const PORT = (() => {
  const idx = process.argv.indexOf("--port");
  if (idx !== -1 && process.argv[idx + 1]) {
    const p = parseInt(process.argv[idx + 1], 10);
    if (p > 0 && p < 65536) return p;
  }
  return DEFAULT_PORT;
})();

let currentVideo = {
  id: null,
  title: null,
  time: 0,
  playlistIds: null,
  playlistItems: null,
  playlistIndex: 0,
  sentAt: null,
};

function sendJSON(res, status, data) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(JSON.stringify(data));
}

function serveStatic(res, filePath, contentType) {
  const fullPath = path.join(__dirname, "public", filePath);
  fs.readFile(fullPath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  });
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

const server = http.createServer((req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    res.end();
    return;
  }

  if (req.method === "GET" && req.url === "/api/video") {
    sendJSON(res, 200, currentVideo);
    return;
  }

  if (req.method === "POST" && req.url === "/api/video") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const data = JSON.parse(body);
        if (data.id) {
          currentVideo = {
            id: data.id,
            title: data.title || null,
            time: data.time || 0,
            playlistIds: data.playlistIds || null,
            playlistItems: data.playlistItems || null,
            playlistIndex: data.playlistIndex || 0,
            sentAt: Date.now(),
          };
          const count = currentVideo.playlistIds
            ? ` [playlist: ${currentVideo.playlistIds.length} videos]`
            : "";
          console.log(
            `Video: ${currentVideo.title || "Untitled"} (${currentVideo.id}) at ${formatTime(currentVideo.time)}${count}`
          );
        }
        sendJSON(res, 200, { ok: true });
      } catch {
        sendJSON(res, 400, { error: "Invalid JSON" });
      }
    });
    return;
  }

  if (req.method === "GET" && (req.url === "/" || req.url === "/index.html")) {
    serveStatic(res, "index.html", "text/html; charset=utf-8");
    return;
  }

  res.writeHead(404);
  res.end("Not found");
});

server.listen(PORT, () => {
  console.log(`YoutubeToXeneon server running on http://localhost:${PORT}`);
  console.log("Waiting for video from the Chrome extension...");
});
