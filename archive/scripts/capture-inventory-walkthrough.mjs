import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const outDir = path.join(repoRoot, "artifacts", "inventory-walkthrough");
const edgeProfileDir = path.join(outDir, "edge-profile");
const targetUrl = "http://localhost:3012/walkthrough/inventory-admin";
const cdpPort = 9334;
const viewport = { width: 1280, height: 720 };

const edgeCandidates = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
];

const steps = [
  {
    name: "01-new-product",
    duration: 4,
    subtitle: "Start on New Product. This is where a new inventory item begins.",
    action: async (client) => {
      await evalPage(client, "window.scrollTo(0, 0)");
    },
  },
  {
    name: "02-basic-info",
    duration: 5,
    subtitle: "Add the item name, choose a category, and let the SKU fill in automatically.",
    action: async (client) => {
      await setValue(client, '[name="name"]', "Moonlit Copper Pendant");
      await setValue(client, '[name="categoryId"]', "necklaces");
      await evalPage(client, "window.scrollTo(0, 0)");
    },
  },
  {
    name: "03-pricing",
    duration: 5,
    subtitle: "Enter the list price, then uncheck discretion if you want to set a haggle floor.",
    action: async (client) => {
      await setValue(client, '[name="price"]', "68.00");
      await clickIfChecked(client, '[name="haggleDiscretion"]');
      await setValue(client, '[name="hagglePrice"]', "54.00");
      await evalPage(client, "document.querySelector('[name=\"price\"]').scrollIntoView({ block: 'center' })");
    },
  },
  {
    name: "04-material-cost",
    duration: 5,
    subtitle: "Choose Lump Sum and enter what the materials cost for this item.",
    action: async (client) => {
      await clickByText(client, "button", "Lump Sum");
      await setValue(client, '[name="materialCostLump"]', "11.75");
      await evalPage(client, "document.querySelector('[name=\"materialCostLump\"]').scrollIntoView({ block: 'center' })");
    },
  },
  {
    name: "05-build-time",
    duration: 5,
    subtitle: "Add the build time. The site multiplies that by the labor rate in Settings.",
    action: async (client) => {
      await setValue(client, '[name="laborDurationAmount"]', "1.5");
      await setValue(client, '[name="laborDurationUnit"]', "hours");
      await evalPage(client, "document.querySelector('[name=\"laborDurationAmount\"]').scrollIntoView({ block: 'center' })");
    },
  },
  {
    name: "06-profit-summary",
    duration: 6,
    subtitle: "Review the pricing summary. Profit updates from list price minus materials and labor.",
    action: async (client) => {
      await evalPage(client, "[...document.querySelectorAll('h3')].find((el) => el.textContent.includes('Pricing Summary')).scrollIntoView({ block: 'center' })");
    },
  },
  {
    name: "07-create-product",
    duration: 4,
    subtitle: "When everything looks right, click Create Product to save the inventory item.",
    action: async (client) => {
      await clickByText(client, "button", "Create Product");
      await evalPage(client, "window.scrollTo(0, document.body.scrollHeight)");
    },
  },
];

class CdpClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.nextId = 1;
    this.pending = new Map();
    this.listeners = new Map();
  }

  async open() {
    this.ws = new WebSocket(this.wsUrl);
    await new Promise((resolve, reject) => {
      this.ws.addEventListener("open", resolve, { once: true });
      this.ws.addEventListener("error", reject, { once: true });
    });
    this.ws.addEventListener("message", (event) => this.handleMessage(event));
  }

  handleMessage(event) {
    const message = JSON.parse(event.data);
    if (message.id && this.pending.has(message.id)) {
      const { resolve, reject } = this.pending.get(message.id);
      this.pending.delete(message.id);
      if (message.error) reject(new Error(JSON.stringify(message.error)));
      else resolve(message.result);
      return;
    }
    const callbacks = this.listeners.get(message.method) || [];
    for (const callback of callbacks) callback(message.params);
  }

  send(method, params = {}) {
    const id = this.nextId++;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
    });
  }

  once(method) {
    return new Promise((resolve) => {
      const callback = (params) => {
        const callbacks = this.listeners.get(method) || [];
        this.listeners.set(method, callbacks.filter((item) => item !== callback));
        resolve(params);
      };
      this.listeners.set(method, [...(this.listeners.get(method) || []), callback]);
    });
  }

  close() {
    this.ws?.close();
  }
}

function findBrowser() {
  const browser = edgeCandidates.find((candidate) => existsSync(candidate));
  if (!browser) throw new Error("Could not find Edge or Chrome.");
  return browser;
}

async function waitForJson(url, timeoutMs = 15000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return await response.json();
    } catch {
      await sleep(250);
    }
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function evalPage(client, expression) {
  const result = await client.send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (result.exceptionDetails) {
    throw new Error(
      result.exceptionDetails.exception?.description ||
      result.exceptionDetails.text ||
      "Page evaluation failed"
    );
  }
  return result.result?.value;
}

async function setValue(client, selector, value) {
  const missingMessage = JSON.stringify(`Missing selector: ${selector}`);
  await evalPage(client, `(() => {
    const el = document.querySelector(${JSON.stringify(selector)});
    if (!el) throw new Error(${missingMessage});
    const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), "value");
    if (descriptor?.set) {
      descriptor.set.call(el, ${JSON.stringify(value)});
    } else {
      el.value = ${JSON.stringify(value)};
    }
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  })()`);
  await sleep(250);
}

async function clickIfChecked(client, selector) {
  const missingMessage = JSON.stringify(`Missing selector: ${selector}`);
  await evalPage(client, `(() => {
    const el = document.querySelector(${JSON.stringify(selector)});
    if (!el) throw new Error(${missingMessage});
    if (el.checked) el.click();
  })()`);
  await sleep(250);
}

async function clickByText(client, selector, text) {
  const missingMessage = JSON.stringify(`Missing ${selector} text: ${text}`);
  await evalPage(client, `(() => {
    const el = [...document.querySelectorAll(${JSON.stringify(selector)})]
      .find((item) => item.textContent.trim().includes(${JSON.stringify(text)}));
    if (!el) throw new Error(${missingMessage});
    el.click();
  })()`);
  await sleep(350);
}

async function waitForSelector(client, selector, timeoutMs = 10000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const exists = await evalPage(
      client,
      `Boolean(document.querySelector(${JSON.stringify(selector)}))`
    );
    if (exists) return;
    await sleep(250);
  }
  throw new Error(`Timed out waiting for selector: ${selector}`);
}

async function captureFrame(client, fileName) {
  await sleep(650);
  const { data } = await client.send("Page.captureScreenshot", {
    format: "jpeg",
    quality: 86,
    captureBeyondViewport: false,
  });
  const filePath = path.join(outDir, `${fileName}.jpg`);
  await writeFile(filePath, Buffer.from(data, "base64"));
  return { filePath, dataUrl: `data:image/jpeg;base64,${data}` };
}

function formatSrtTime(seconds) {
  const whole = Math.floor(seconds);
  const ms = Math.round((seconds - whole) * 1000);
  const h = String(Math.floor(whole / 3600)).padStart(2, "0");
  const m = String(Math.floor((whole % 3600) / 60)).padStart(2, "0");
  const s = String(whole % 60).padStart(2, "0");
  return `${h}:${m}:${s},${String(ms).padStart(3, "0")}`;
}

function formatVttTime(seconds) {
  return formatSrtTime(seconds).replace(",", ".");
}

async function writeSubtitleFiles(cues) {
  const srt = cues.map((cue, index) => [
    String(index + 1),
    `${formatSrtTime(cue.start)} --> ${formatSrtTime(cue.end)}`,
    cue.text,
    "",
  ].join("\n")).join("\n");

  const vtt = `WEBVTT\n\n${cues.map((cue) => [
    `${formatVttTime(cue.start)} --> ${formatVttTime(cue.end)}`,
    cue.text,
    "",
  ].join("\n")).join("\n")}`;

  await writeFile(path.join(outDir, "inventory-admin-walkthrough.srt"), srt, "utf8");
  await writeFile(path.join(outDir, "inventory-admin-walkthrough.vtt"), vtt, "utf8");
}

async function encodeWebm(browserPath, frames, cues) {
  const encoderPort = cdpPort + 1;
  const encoderProfileDir = path.join(outDir, "edge-encoder-profile");
  const browser = spawn(browserPath, [
    `--remote-debugging-port=${encoderPort}`,
    `--user-data-dir=${encoderProfileDir}`,
    "--remote-allow-origins=*",
    "--disable-gpu",
    "--disable-background-timer-throttling",
    "--autoplay-policy=no-user-gesture-required",
    "about:blank",
  ], { stdio: "ignore" });

  try {
    const targets = await waitForJson(`http://127.0.0.1:${encoderPort}/json/list`);
    const client = new CdpClient(targets[0].webSocketDebuggerUrl);
    await client.open();
    await client.send("Page.enable");
    await client.send("Runtime.enable");
    await client.send("Emulation.setDeviceMetricsOverride", {
      width: viewport.width,
      height: viewport.height,
      deviceScaleFactor: 1,
      mobile: false,
    });

    const framePayload = frames.map((frame, index) => ({
      src: frame.dataUrl,
      duration: steps[index].duration,
      subtitle: steps[index].subtitle,
    }));
    const videoBase64 = await withTimeout(
      evalPage(client, `(${recordCanvasVideo.toString()})(${JSON.stringify({
        width: viewport.width,
        height: viewport.height,
        frames: framePayload,
      })})`),
      45000,
      "Timed out waiting for Edge MediaRecorder to encode the walkthrough."
    );
    console.log(`Encoder returned ${videoBase64 ? videoBase64.length : 0} base64 chars.`);
    client.close();
    const outPath = path.join(outDir, "inventory-admin-walkthrough-captioned.webm");
    await writeFile(outPath, Buffer.from(videoBase64, "base64"));
    console.log(`Wrote ${outPath}.`);
    return outPath;
  } finally {
    browser.kill();
  }
}

async function recordCanvasVideo({ width, height, frames }) {
  document.body.style.margin = "0";
  document.body.style.background = "#111";
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  const images = await Promise.all(frames.map((frame) => new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = frame.src;
  })));
  const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
    ? "video/webm;codecs=vp9"
    : "video/webm";
  const recorder = new MediaRecorder(canvas.captureStream(30), { mimeType });
  const chunks = [];
  recorder.ondataavailable = (event) => {
    if (event.data.size) chunks.push(event.data);
  };
  const done = new Promise((resolve) => {
    recorder.onstop = async () => {
      const blob = new Blob(chunks, { type: mimeType });
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.readAsDataURL(blob);
    };
  });

  function drawCaption(text) {
    const boxHeight = 96;
    ctx.fillStyle = "rgba(12, 10, 9, 0.82)";
    ctx.fillRect(0, height - boxHeight, width, boxHeight);
    ctx.fillStyle = "#fff7ed";
    ctx.font = "28px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const words = text.split(" ");
    const lines = [];
    let line = "";
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > width - 160 && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    const startY = height - boxHeight / 2 - (lines.length - 1) * 18;
    lines.forEach((captionLine, index) => ctx.fillText(captionLine, width / 2, startY + index * 36));
  }

  const timeline = [];
  let cursor = 0;
  for (let i = 0; i < frames.length; i += 1) {
    timeline.push({ index: i, start: cursor, end: cursor + frames[i].duration });
    cursor += frames[i].duration;
  }

  recorder.start();
  const start = performance.now();
  await new Promise((resolve) => {
    const render = () => {
      const seconds = (performance.now() - start) / 1000;
      const segment = timeline.find((item) => seconds >= item.start && seconds < item.end) || timeline.at(-1);
      const image = images[segment.index];
      ctx.drawImage(image, 0, 0, width, height);
      drawCaption(frames[segment.index].subtitle);
      if (seconds < cursor) {
        requestAnimationFrame(render);
      } else {
        resolve();
      }
    };
    render();
  });
  recorder.stop();
  return await done;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function withTimeout(promise, ms, message) {
  return Promise.race([
    promise,
    sleep(ms).then(() => {
      throw new Error(message);
    }),
  ]);
}

async function main() {
  await mkdir(outDir, { recursive: true });
  await mkdir(edgeProfileDir, { recursive: true });

  const browserPath = findBrowser();
  console.log("Launching browser for capture...");
  const browser = spawn(browserPath, [
    "--headless=new",
    `--remote-debugging-port=${cdpPort}`,
    `--user-data-dir=${edgeProfileDir}`,
    "--remote-allow-origins=*",
    "--disable-gpu",
    "--disable-background-timer-throttling",
    "--no-first-run",
    "--no-default-browser-check",
    "about:blank",
  ], { stdio: "ignore" });

  const capturedFrames = [];
  try {
    console.log("Waiting for capture CDP target...");
    const targets = await waitForJson(`http://127.0.0.1:${cdpPort}/json/list`);
    console.log("Opening capture CDP socket...");
    const client = new CdpClient(targets[0].webSocketDebuggerUrl);
    await client.open();
    console.log("Configuring capture page...");
    await client.send("Page.enable");
    await client.send("Runtime.enable");
    await client.send("Emulation.setDeviceMetricsOverride", {
      width: viewport.width,
      height: viewport.height,
      deviceScaleFactor: 1,
      mobile: false,
    });

    const loaded = client.once("Page.loadEventFired");
    console.log(`Navigating to ${targetUrl}...`);
    await client.send("Page.navigate", { url: targetUrl });
    await loaded;
    await waitForSelector(client, '[name="name"]');
    await sleep(750);

    for (const step of steps) {
      console.log(`Capturing ${step.name}...`);
      await step.action(client);
      capturedFrames.push(await captureFrame(client, step.name));
    }

    client.close();
  } finally {
    browser.kill();
  }

  const cues = [];
  let time = 0;
  for (const step of steps) {
    cues.push({ start: time, end: time + step.duration, text: step.subtitle });
    time += step.duration;
  }
  await writeSubtitleFiles(cues);
  await writeFile(
    path.join(outDir, "inventory-admin-walkthrough-script.txt"),
    steps.map((step, index) => `${index + 1}. ${step.subtitle}`).join("\n"),
    "utf8",
  );

  let videoPath = null;
  try {
    console.log("Encoding captioned webm...");
    videoPath = await encodeWebm(browserPath, capturedFrames, cues);
  } catch (error) {
    await writeFile(path.join(outDir, "video-encode-error.txt"), String(error?.stack || error), "utf8");
  }

  console.log(JSON.stringify({
    outDir,
    frames: capturedFrames.map((frame) => frame.filePath),
    subtitles: [
      path.join(outDir, "inventory-admin-walkthrough.srt"),
      path.join(outDir, "inventory-admin-walkthrough.vtt"),
    ],
    script: path.join(outDir, "inventory-admin-walkthrough-script.txt"),
    video: videoPath,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
