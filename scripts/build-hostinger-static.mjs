import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const originals = new Map();

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

  const disabledApi = filePath(".hostinger-disabled-api");
  const apiPath = filePath("src/app/api");
  if (fs.existsSync(disabledApi) && !fs.existsSync(apiPath)) {
    fs.renameSync(disabledApi, apiPath);
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

  const apiPath = filePath("src/app/api");
  const disabledApi = filePath(".hostinger-disabled-api");
  if (fs.existsSync(apiPath)) {
    if (fs.existsSync(disabledApi)) {
      fs.rmSync(disabledApi, { recursive: true, force: true });
    }
    fs.renameSync(apiPath, disabledApi);
  }

  execFileSync("npm", ["run", "build"], { stdio: "inherit", shell: true });
  writeHtaccess();
} finally {
  restoreFiles();
}
