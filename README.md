# YoutubeToXeneon

Send a YouTube video from your browser to the Corsair Xeneon Edge screen via iCUE, with a single click.

A button is added to the YouTube player controls. When clicked, it captures the current video and timecode, pauses playback in the browser, and sends it to your Xeneon Edge where it resumes at the exact same position. Playlists and YouTube Mixes are also supported.

## Features

- One-click send from YouTube to Xeneon Edge
- Resumes playback at the exact timecode
- Playlist and Mix support with auto-advancement
- Touch-friendly custom controls (play/pause, seek, skip, volume)
- Playlist panel with thumbnails and track selection
- Gesture controls (swipe, long press + drag)
- Controls auto-hide after a few seconds

## How it works

```
Chrome (YouTube)  --->  Local server (localhost:3654)  <---  iCUE widget (Xeneon Edge)
     [click]              [receives & serves]                  [polls & displays]
```

- **Chrome extension** — Injects a button into the YouTube player. On click, it sends the video ID, title, timecode and playlist data to a local server.
- **Local server** — A lightweight Node.js server (zero dependencies) that receives video data from the extension and serves a widget page to iCUE.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- Google Chrome (or Chromium-based browser)
- Corsair iCUE with a Xeneon Edge

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/Ripolin99/YoutubeToXeneon.git
cd YoutubeToXeneon
```

### 2. Start the server

```bash
node server/server.js
```

The server starts on port `3654` by default. To use a different port:

```bash
node server/server.js --port 4000
```

> If you change the port, you also need to update `SERVER_URL` in `extension/content.js` and the `host_permissions` in `extension/manifest.json`.

### 3. Install the Chrome extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in the top right)
3. Click **Load unpacked**
4. Select the `extension/` folder from this repository

### 4. Configure the iCUE widget

In Corsair iCUE, add an **iFrame** widget to your Xeneon Edge screen and paste the following HTML in the widget's code field:

```html
<iframe src="http://localhost:3654" width="100%" height="100%" frameborder="0" allow="autoplay; encrypted-media"></iframe>
```

> **Note:** The URL Web widget will not work here as it requires HTTPS (`ERR_SSL_PROTOCOL_ERROR`). You must use the **iFrame** widget and paste the HTML code above.

## Usage

1. Make sure the server is running
2. Browse YouTube normally
3. When you want to send a video to the Xeneon Edge, click the screen icon in the player controls (next to the fullscreen button)
4. The video pauses in your browser and starts playing on the Xeneon Edge at the same timecode

You can click the button again at any time to resend at a different position.

### Touch controls on the Xeneon Edge

**Buttons**

- **Tap** anywhere to show/hide controls
- **Play/Pause** — center button
- **Rewind/Forward 10s** — left/right buttons
- **Previous/Next** — visible when a playlist is active
- **Progress bar** — drag to seek
- **Volume** — tap the speaker icon to reveal the slider
- **Playlist** — tap the playlist icon to open the track list

**Gestures**

- **Swipe left** — next video (playlist only)
- **Swipe right** — previous video (playlist only)
- **Long press + drag horizontally** — seek forward/backward (visual feedback shows the offset)
- **Long press + drag vertically** — adjust volume (visual feedback shows the percentage)

## Project structure

```
YoutubeToXeneon/
├── server/
│   ├── server.js          # Local server (Node.js, zero dependencies)
│   └── public/
│       └── index.html     # Widget page served to iCUE
├── extension/
│   ├── manifest.json      # Chrome extension manifest (v3)
│   ├── content.js         # Injected into YouTube pages
│   ├── content.css        # Button styling
│   ├── icon48.png
│   └── icon128.png
├── .gitignore
├── LICENSE
└── README.md
```

## License

MIT
