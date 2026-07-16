import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const originals = new Map();
const args = process.argv.slice(2);
const disabledPaths = [
  {
    source: "src/app/api",
    destination: ".hostinger-disabled-api",
  },
  {
    source: "src/app/auth",
    destination: ".hostinger-disabled-auth",
  },
  {
    source: "src/app/courses/algo-trading/access",
    destination: ".hostinger-disabled-course-access",
  },
  {
    source: "src/app/courses/algo-trading/register",
    destination: ".hostinger-disabled-course-register",
  },
];

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

function filePath(relativePath) {
  return path.join(root, relativePath);
}

function read(relativePath) {
  const absolutePath = filePath(relativePath);
  if (!originals.has(relativePath)) {
    originals.set(relativePath, fs.readFileSync(absolutePath, "utf8"));
  }
  return fs.readFileSync(absolutePath, "utf8");
}

function write(relativePath, content) {
  fs.writeFileSync(filePath(relativePath), content);
}

function remember(relativePath) {
  read(relativePath);
}

function replace(relativePath, search, replacement) {
  const content = read(relativePath);
  if (!content.includes(search)) {
    return;
  }
  write(relativePath, content.replace(search, replacement));
}

function replaceRegex(relativePath, search, replacement) {
  const content = read(relativePath);
  write(relativePath, content.replace(search, replacement));
}

function ensureStaticParams(relativePath, importLine) {
  let content = read(relativePath);
  if (!content.includes(importLine)) {
    content = content.replace(
      'import { redirect } from "next/navigation";',
      `import { redirect } from "next/navigation";\n${importLine}`,
    );
  }
  if (!content.includes("export function generateStaticParams()")) {
    content = content.replace(
      /type PageProps = \{\r?\n  params: Promise<\{ slug: string \}>;\r?\n\};/,
      "type PageProps = {\n  params: Promise<{ slug: string }>;\n};\n\nexport function generateStaticParams() {\n  return experts.map((expert) => ({ slug: expert.slug }));\n}",
    );
  }
  write(relativePath, content);
}

function restoreFiles() {
  for (const [relativePath, content] of originals) {
    write(relativePath, content);
  }

  restoreDisabledPaths();
}

function disablePathsForStaticExport() {
  for (const { source, destination } of disabledPaths) {
    const sourcePath = filePath(source);
    const destinationPath = filePath(destination);

    if (!fs.existsSync(sourcePath)) continue;

    if (fs.existsSync(destinationPath)) {
      fs.rmSync(destinationPath, { recursive: true, force: true });
    }

    fs.renameSync(sourcePath, destinationPath);
  }
}

function restoreDisabledPaths() {
  for (const { source, destination } of disabledPaths.toReversed()) {
    const sourcePath = filePath(source);
    const destinationPath = filePath(destination);

    if (fs.existsSync(destinationPath) && !fs.existsSync(sourcePath)) {
      fs.mkdirSync(path.dirname(sourcePath), { recursive: true });
      fs.renameSync(destinationPath, sourcePath);
    }
  }
}

function writeHtaccess() {
  write(
    "out/.htaccess",
    `Options -Indexes
DirectoryIndex index.html

RewriteEngine On

RewriteRule ^experts/sumedhhkumar/?$ /experts/sumedh-kumar/ [R=301,L]
RewriteRule ^experts/sumedh/?$ /experts/sumedh-kumar/ [R=301,L]
RewriteRule ^experts/sumedhhkumar-bhalerao/?$ /experts/sumedh-kumar/ [R=301,L]
RewriteRule ^experts/sumedhkumar-bhalerao/?$ /experts/sumedh-kumar/ [R=301,L]

RewriteRule ^ai-trading-agents/agent-pulse/?$ /ai-trading-agents/astro-vyn-gold/ [R=301,L]
RewriteRule ^ai-trading-agents/pulse/?$ /ai-trading-agents/astro-vyn-gold/ [R=301,L]
RewriteRule ^ai-trading-agents/vyntegra-pulse/?$ /ai-trading-agents/astro-vyn-gold/ [R=301,L]
RewriteRule ^ai-trading-agents/vyntegra-pulse/(.*)$ /ai-trading-agents/astro-vyn-gold/$1 [R=301,L]
RewriteRule ^ai-trading-agents/([^/]+)/purchase/?$ /ai-trading-agents/$1/#purchase [R=302,L]
RewriteRule ^razorpay-test/?$ / [R=302,L]

RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.+[^/])$ /$1/ [R=301,L]

ErrorDocument 404 /404.html
`,
  );
}

try {
  const envFile = readArg("--env-file");
  if (envFile) {
    Object.assign(
      process.env,
      parseEnv(fs.readFileSync(path.resolve(envFile), "utf8")),
    );
    process.env.APP_BASE_URL = "https://vyntegra.in";
    process.env.NODE_ENV = "production";
  }

  remember("next.config.ts");
  write(
    "next.config.ts",
    `import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
};

export default nextConfig;
`,
  );

  ensureStaticParams(
    "src/app/experts/[slug]/booking/page.tsx",
    'import { experts } from "@/data/experts";',
  );
  ensureStaticParams(
    "src/app/experts/[slug]/checkout/page.tsx",
    'import { experts } from "@/data/experts";',
  );
  ensureStaticParams(
    "src/app/experts/[slug]/crypto-payment/page.tsx",
    'import { experts } from "@/data/experts";',
  );

  replaceRegex(
    "src/app/experts/[slug]/confirmation/page.tsx",
    /  searchParams: Promise<\{ \[key: string\]: string \| string\[\] \| undefined \}>;\r?\n/,
    "",
  );
  replaceRegex(
    "src/app/experts/[slug]/confirmation/page.tsx",
    /  searchParams,\r?\n/,
    "",
  );
  replaceRegex(
    "src/app/experts/[slug]/confirmation/page.tsx",
    /  const query = await searchParams;\r?\n/,
    "",
  );
  replace(
    "src/app/experts/[slug]/confirmation/page.tsx",
    '  const token = typeof query.token === "string" ? query.token : "";',
    '  const token = "";',
  );

  replaceRegex(
    "src/app/ai-trading-agents/[slug]/crypto-payment/page.tsx",
    /  searchParams: Promise<\{ \[key: string\]: string \| string\[\] \| undefined \}>;\r?\n/,
    "",
  );
  replaceRegex(
    "src/app/ai-trading-agents/[slug]/crypto-payment/page.tsx",
    /  searchParams,\r?\n/,
    "",
  );
  replaceRegex(
    "src/app/ai-trading-agents/[slug]/crypto-payment/page.tsx",
    /  const query = await searchParams;\r?\n/,
    "",
  );
  replaceRegex(
    "src/app/ai-trading-agents/[slug]/crypto-payment/page.tsx",
    /  const couponCode =\r?\n    typeof query\.coupon === "string" \? query\.coupon\.trim\(\) : "";\r?\n  const selectedPlanId =\r?\n    typeof query\.plan === "string" \? query\.plan\.trim\(\) : "";/,
    `  const couponCode = "";
  const selectedPlanId = "";`,
  );

  // Patch landing page: remove server-side auth check that uses cookies()
  remember("src/app/lp/trading-automation-masterclass/page.tsx");
  write(
    "src/app/lp/trading-automation-masterclass/page.tsx",
    `import type { Metadata } from "next";
import AlgoTradingCourseCampaignLanding from "@/components/course/AlgoTradingCourseCampaignLanding";

export const metadata: Metadata = {
  title: "2 Free Trading Automation Lectures | Vyntegra Masterclass",
  description:
    "Get free access to Lecture 1 and Lecture 2 of Vyntegra's Trading Automation Masterclass. Learn AI-assisted workflows for MT5 and TradingView. No payment required.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "2 Free Trading Automation Lectures | Vyntegra Masterclass",
    description:
      "Get free access to Lecture 1 and Lecture 2 of Vyntegra's Trading Automation Masterclass. Learn AI-assisted workflows for MT5 and TradingView. No payment required.",
    siteName: "Vyntegra",
    type: "website",
  },
};

export default function TradingAutomationMasterclassLandingPage() {
  return <AlgoTradingCourseCampaignLanding />;
}
`,
  );

  disablePathsForStaticExport();

  execFileSync("npm", ["run", "build"], { stdio: "inherit", shell: true });
  writeHtaccess();
} finally {
  restoreFiles();
}
