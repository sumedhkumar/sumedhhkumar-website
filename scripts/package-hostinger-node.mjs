import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outputDir = path.join(root, "hostinger-node");
const args = process.argv.slice(2);

function readArg(name) {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : "";
}

function parseEnv(contents) {
  const values = {};

  for (const rawLine of contents.replace(/^\uFEFF/, "").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const separator = line.indexOf("=");
    if (separator < 1) continue;

    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if (
      value.length >= 2 &&
      ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'")))
    ) {
      value = value.slice(1, -1);
    }
    values[key] = value;
  }

  return values;
}

function serializeEnv(values) {
  return `${Object.entries(values)
    .map(([key, value]) => `${key}=${String(value).replace(/\r?\n/g, "\\n")}`)
    .join("\n")}\n`;
}

function copyDirectory(source, destination) {
  if (fs.existsSync(source)) {
    fs.cpSync(source, destination, { recursive: true, force: true });
  }
}

function findStandaloneRoot(directory) {
  const directServer = path.join(directory, "server.js");
  if (fs.existsSync(directServer)) return directory;

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const nested = findStandaloneRoot(path.join(directory, entry.name));
    if (nested) return nested;
  }

  return null;
}

const envFile = readArg("--env-file");
const embedEnv = args.includes("--embed-env");
const buildEnv = { ...process.env, NEXT_TELEMETRY_DISABLED: "1" };
let deploymentEnv = {};

if (envFile) {
  deploymentEnv = parseEnv(fs.readFileSync(path.resolve(envFile), "utf8"));
  deploymentEnv.APP_BASE_URL = "https://vyntegra.in";
  deploymentEnv.NODE_ENV = "production";
  deploymentEnv.HOSTNAME = "0.0.0.0";
  deploymentEnv.PORT ||= "3000";
  deploymentEnv.RAZORPAY_KEY_ID ||=
    deploymentEnv.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
  Object.assign(buildEnv, deploymentEnv);
}

fs.rmSync(outputDir, { recursive: true, force: true });
execFileSync("npm", ["run", "build"], {
  cwd: root,
  env: buildEnv,
  shell: process.platform === "win32",
  stdio: "inherit",
});

const standaloneDir = path.join(root, ".next", "standalone");
const standaloneRoot = findStandaloneRoot(standaloneDir);
if (!standaloneRoot) {
  throw new Error("Next.js standalone server.js was not generated.");
}

copyDirectory(standaloneRoot, outputDir);
copyDirectory(path.join(root, ".next", "static"), path.join(outputDir, ".next", "static"));
copyDirectory(path.join(root, "public"), path.join(outputDir, "public"));

if (embedEnv && Object.keys(deploymentEnv).length > 0) {
  fs.writeFileSync(
    path.join(outputDir, ".env.production"),
    serializeEnv(deploymentEnv),
    { mode: 0o600 },
  );
}

fs.writeFileSync(
  path.join(outputDir, "HOSTINGER-START.txt"),
  [
    "Application type: Node.js",
    "Node.js version: 22",
    "Entry point: server.js",
    "Start command: node server.js",
    "Application URL: https://vyntegra.in",
    "",
    "Configure runtime environment variables in hPanel before starting the app.",
  ].join("\n"),
);

console.log(`Hostinger Node bundle created at ${outputDir}`);
console.log(`Runtime environment embedded: ${embedEnv ? "yes" : "no"}`);
