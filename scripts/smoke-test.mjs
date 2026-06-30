import { execFile, spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import net from "node:net";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const pages = [
  "/",
  "/demos/movie-lp/",
  "/demos/portfolio/",
  "/demos/travel/",
  "/demos/horizontal-story/"
];

function getFreePort() {
  return new Promise((resolvePort, reject) => {
    const server = net.createServer();
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      server.close(() => resolvePort(address.port));
    });
    server.on("error", reject);
  });
}

async function waitForServer(url) {
  const started = Date.now();
  while (Date.now() - started < 8000) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {
      await new Promise((resolveWait) => setTimeout(resolveWait, 180));
    }
  }

  throw new Error(`Server did not respond: ${url}`);
}

async function verifyHttp(baseUrl) {
  for (const path of pages) {
    const response = await fetch(`${baseUrl}${path}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${path}`);
    }

    const html = await response.text();
    if (!html.includes("scenescroll.js") || !html.includes("scenescroll.css")) {
      throw new Error(`Missing SceneScroll assets in ${path}`);
    }
  }
}

async function verifyWithChrome(baseUrl) {
  const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  const profile = await mkdtemp(resolve(tmpdir(), "scenescroll-chrome-"));
  const screenshots = await mkdtemp(resolve(tmpdir(), "scenescroll-shots-"));

  try {
    for (const path of pages) {
      const url = `${baseUrl}${path}`;
      const slug = path === "/" ? "home" : path.replace(/\W+/g, "-").replace(/^-|-$/g, "");
      const args = [
        "--headless=new",
        "--disable-gpu",
        "--disable-background-networking",
        "--disable-component-update",
        "--disable-default-apps",
        "--disable-extensions",
        "--disable-sync",
        "--no-first-run",
        "--no-default-browser-check",
        `--user-data-dir=${profile}`,
        "--window-size=1280,900",
        "--virtual-time-budget=2500",
        `--screenshot=${resolve(screenshots, `${slug}.png`)}`,
        "--dump-dom",
        url
      ];

      let stdout = "";
      let stderr = "";
      try {
        const result = await execFileAsync(chrome, args, {
          maxBuffer: 12 * 1024 * 1024,
          timeout: 12000,
          killSignal: "SIGKILL"
        });
        stdout = result.stdout;
        stderr = result.stderr;
      } catch (error) {
        stdout = error.stdout || "";
        stderr = error.stderr || "";
        if (!error.killed || !stdout.includes("ss-wrapper")) {
          throw error;
        }
      }

      if (!stdout.includes("ss-wrapper") || !stdout.includes("ss-scene")) {
        throw new Error(`SceneScroll DOM was not generated for ${path}`);
      }

      if (/(Uncaught|ReferenceError|TypeError|SyntaxError)/.test(stderr)) {
        throw new Error(`Browser error while loading ${path}:\n${stderr}`);
      }
    }
  } finally {
    await rm(profile, { recursive: true, force: true });
    await rm(screenshots, { recursive: true, force: true });
  }
}

const port = await getFreePort();
const baseUrl = `http://127.0.0.1:${port}`;
const server = spawn("python3", ["-m", "http.server", String(port), "--bind", "127.0.0.1"], {
  cwd: root,
  stdio: ["ignore", "pipe", "pipe"]
});

try {
  await waitForServer(baseUrl);
  await verifyHttp(baseUrl);
  await verifyWithChrome(baseUrl);
  console.log("Smoke test passed.");
} finally {
  server.kill("SIGTERM");
}
