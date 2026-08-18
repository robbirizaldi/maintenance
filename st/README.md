# NET/METER

A browser-based internet speed test designed as a **technical instrument**, not a generic SaaS dashboard.

![NET/METER](https://dummyimage.com/1200x630/080a0d/39d7ff&text=NET%2FMETER)

## What it does

- Download throughput measurement
- Upload throughput measurement
- Latency probe
- Connection information when supported by the browser
- Local test history via `localStorage`
- Responsive mobile/desktop layout
- No framework, build step, database, or login
- Ready for GitHub Pages

## Run locally

Open `index.html` in a browser, or serve the folder with any static HTTP server.

## Deploy to GitHub Pages

1. Create a GitHub repository.
2. Upload `index.html`, `styles.css`, and `app.js`.
3. Go to **Settings → Pages**.
4. Select **Deploy from a branch**.
5. Select the branch containing these files and `/root`.
6. Open the generated GitHub Pages URL.

## Measurement note

The test uses public Cloudflare speed-test endpoints from the browser. Results are affected by Wi-Fi quality, device load, browser limitations, ISP routing, VPNs, and the selected test edge. It should be treated as a practical browser measurement, not laboratory-grade network certification.

Cloudflare documents its public internet speed testing service here:
https://developers.cloudflare.com/fundamentals/performance/test-speed/

## File structure

```text
netmeter-speedtest/
├── index.html
├── styles.css
├── app.js
└── README.md
```

## License

MIT — feel free to modify and publish it.
