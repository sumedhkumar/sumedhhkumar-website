<#
.SYNOPSIS
Applies the current Vyntegra visual direction: satin brass metallic accents,
a continuous graphite background, and compact homepage product pathways.

.EXAMPLE
powershell -ExecutionPolicy Bypass -File scripts/apply-satin-brass-visuals.ps1 -WhatIf

.EXAMPLE
powershell -ExecutionPolicy Bypass -File scripts/apply-satin-brass-visuals.ps1
#>

[CmdletBinding(SupportsShouldProcess = $true)]
param(
  [string]$Root = "",
  [switch]$NoBackup
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($Root)) {
  $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
  $Root = (Resolve-Path (Join-Path $scriptDir "..")).Path
}

$palette = @{
  Main = "#B8914A"
  Highlight = "#E1C985"
  Deep = "#5B3D18"
  Shadow = "#7A5624"
  Text = "#D8BE78"
  Graphite = "#050506"
  Graphite2 = "#0A0B0E"
  Graphite3 = "#111319"
}

function Get-RepoPath {
  param([Parameter(Mandatory = $true)][string]$RelativePath)
  return Join-Path $Root $RelativePath
}

function Backup-File {
  param([Parameter(Mandatory = $true)][string]$Path)

  if ($NoBackup -or -not (Test-Path -LiteralPath $Path)) {
    return
  }

  $stamp = Get-Date -Format "yyyyMMdd-HHmmss"
  Copy-Item -LiteralPath $Path -Destination "$Path.bak-$stamp" -Force
}

function Write-RepoText {
  param(
    [Parameter(Mandatory = $true)][string]$RelativePath,
    [Parameter(Mandatory = $true)][string]$Content
  )

  $path = Get-RepoPath $RelativePath
  $dir = Split-Path -Parent $path

  if ($PSCmdlet.ShouldProcess($RelativePath, "write file")) {
    if (-not (Test-Path -LiteralPath $dir)) {
      New-Item -ItemType Directory -Path $dir | Out-Null
    }
    Backup-File $path
    Set-Content -LiteralPath $path -Value $Content -Encoding UTF8 -NoNewline
  }
}

function Update-RepoText {
  param(
    [Parameter(Mandatory = $true)][string]$RelativePath,
    [Parameter(Mandatory = $true)][scriptblock]$Transform
  )

  $path = Get-RepoPath $RelativePath
  if (-not (Test-Path -LiteralPath $path)) {
    throw "Missing required file: $RelativePath"
  }

  $old = Get-Content -Raw -LiteralPath $path
  $new = & $Transform $old

  if ($new -ne $old -and $PSCmdlet.ShouldProcess($RelativePath, "update file")) {
    Backup-File $path
    Set-Content -LiteralPath $path -Value $new -Encoding UTF8 -NoNewline
  }
}

function Set-CssBlock {
  param(
    [Parameter(Mandatory = $true)][string]$Css,
    [Parameter(Mandatory = $true)][string]$Selector,
    [Parameter(Mandatory = $true)][string]$Block
  )

  $pattern = "(?ms)^" + [regex]::Escape($Selector) + "\s*\{.*?^\}"
  if ([regex]::IsMatch($Css, $pattern)) {
    return [regex]::Replace($Css, $pattern, $Block, 1)
  }

  return $Css.TrimEnd() + [Environment]::NewLine + [Environment]::NewLine + $Block + [Environment]::NewLine
}

function Replace-GoldTokens {
  param([Parameter(Mandatory = $true)][string]$Text)

  $updated = $Text
  $updated = $updated -replace "#BFA46A|#C2AD76|#A88E5A|#B89A5A|#C7A56A", $palette.Main
  $updated = $updated -replace "#F1E6C3|#E8D9A8|#DCCB9A|#E7D2A5", $palette.Highlight
  $updated = $updated -replace "#6D542D|#745A30|#6E572C", $palette.Deep
  $updated = $updated -replace "#9B7650|#A77C3B", $palette.Shadow
  $updated = $updated -replace "rgba\((194,\s*173,\s*118|168,\s*142,\s*90|191,\s*164,\s*106|184,\s*154,\s*90|199,\s*165,\s*106),", "rgba(184, 145, 74,"
  return $updated
}

function Update-GlobalCss {
  Update-RepoText "src/app/globals.css" {
    param($css)

    $css = Replace-GoldTokens $css

    $css = $css -replace "--accent-gold:\s*#[0-9A-Fa-f]{6};", "--accent-gold: $($palette.Main);"
    $css = $css -replace "--accent-gold-light:\s*#[0-9A-Fa-f]{6};", "--accent-gold-light: $($palette.Highlight);"
    $css = $css -replace "--accent-gold-dark:\s*#[0-9A-Fa-f]{6};", "--accent-gold-dark: $($palette.Deep);"
    $css = $css -replace "--accent-copper:\s*#[0-9A-Fa-f]{6};", "--accent-copper: $($palette.Shadow);"
    $css = $css -replace "--border-gold:\s*rgba\([^)]+\);", "--border-gold: rgba(184, 145, 74, 0.42);"
    $css = $css -replace "--border-gold-strong:\s*rgba\([^)]+\);", "--border-gold-strong: rgba(184, 145, 74, 0.68);"

    $bodyBlock = @"
body {
  position: relative;
  margin: 0;
  background:
    radial-gradient(circle at 48% -8%, rgba(184, 145, 74, 0.13), transparent 34rem),
    radial-gradient(circle at 12% 32%, rgba(255, 255, 255, 0.034), transparent 25rem),
    radial-gradient(circle at 88% 58%, rgba(184, 145, 74, 0.052), transparent 34rem),
    linear-gradient(180deg, #050506 0%, #08090B 38%, #101217 70%, #050506 100%);
  background-attachment: fixed;
  color: #F7F3EA;
  font-family: var(--font-body), Arial, sans-serif;
  font-style: normal;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.68;
  writing-mode: horizontal-tb;
  text-orientation: mixed;
  overflow-x: hidden;
}
"@

    $bodyBeforeBlock = @"
body::before {
  position: fixed;
  inset: 0;
  z-index: 0;
  content: "";
  pointer-events: none;
  background:
    linear-gradient(rgba(255, 255, 255, 0.018) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.014) 1px, transparent 1px);
  background-size: 96px 96px;
  opacity: 0.18;
  transform: perspective(900px) rotateX(58deg) translateY(120px) scale(1.55);
  transform-origin: 50% 100%;
  -webkit-mask-image: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.50) 32%, transparent 88%);
  mask-image: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.50) 32%, transparent 88%);
}
"@

    $primaryButtonBlock = @"
.btn-primary {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.072), rgba(255, 255, 255, 0.014)),
    linear-gradient(135deg, rgba(184, 145, 74, 0.34), rgba(184, 145, 74, 0.10) 48%, rgba(225, 201, 133, 0.16));
  color: #F5E8C7;
  border-color: rgba(225, 201, 133, 0.62);
  box-shadow:
    0 20px 46px rgba(0, 0, 0, 0.34),
    0 12px 34px rgba(184, 145, 74, 0.13),
    inset 0 1px 0 rgba(255, 255, 255, 0.16),
    inset 0 -1px 0 rgba(57, 38, 16, 0.72);
}
"@

    $primaryButtonHoverBlock = @"
.btn-primary:hover {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.098), rgba(255, 255, 255, 0.018)),
    linear-gradient(135deg, rgba(184, 145, 74, 0.42), rgba(184, 145, 74, 0.12) 48%, rgba(225, 201, 133, 0.20));
  border-color: rgba(225, 201, 133, 0.78);
  box-shadow:
    0 24px 54px rgba(0, 0, 0, 0.38),
    0 16px 38px rgba(184, 145, 74, 0.16),
    inset 0 1px 0 rgba(255, 255, 255, 0.19),
    inset 0 -1px 0 rgba(57, 38, 16, 0.76);
  transform: translateY(-2px);
}
"@

    $announcementBlock = @"
.announcement-banner {
  min-height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 32px;
  background:
    radial-gradient(circle at 50% 0%, rgba(184, 145, 74, 0.18), transparent 34rem),
    linear-gradient(180deg, rgba(255, 255, 255, 0.035), rgba(255, 255, 255, 0.006)),
    #0A0B0D;
  color: #D8BE78;
  border-bottom: 1px solid rgba(184, 145, 74, 0.22);
  font-size: 12px;
  font-weight: 800;
  line-height: 1.30;
  letter-spacing: 0.08em;
  text-align: center;
}
"@

    $heroSearchBlock = @"
.hero-search-button {
  width: 56px;
  height: 56px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  justify-self: end;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.13), rgba(255, 255, 255, 0.012)),
    linear-gradient(180deg, #E1C985 0%, #B8914A 54%, #5B3D18 100%);
  color: #090A0C;
  box-shadow:
    0 18px 40px rgba(0, 0, 0, 0.36),
    0 0 30px rgba(184, 145, 74, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.22),
    inset 0 -1px 0 rgba(52, 34, 14, 0.70);
}
"@

    $css = Set-CssBlock $css "body" $bodyBlock
    $css = Set-CssBlock $css "body::before" $bodyBeforeBlock
    $css = Set-CssBlock $css ".btn-primary" $primaryButtonBlock
    $css = Set-CssBlock $css ".btn-primary:hover" $primaryButtonHoverBlock
    $css = Set-CssBlock $css ".announcement-banner" $announcementBlock
    $css = Set-CssBlock $css ".hero-search-button" $heroSearchBlock
    $css = Set-CssBlock $css ".section-bg-primary" ".section-bg-primary {`n  background: transparent;`n}"
    $css = Set-CssBlock $css ".section-bg-secondary" ".section-bg-secondary {`n  background: transparent;`n}"
    $css = Set-CssBlock $css ".trust-strip" ".trust-strip {`n  min-height: 78px;`n  background: transparent;`n  border-top: 1px solid rgba(255, 255, 255, 0.055);`n  border-bottom: 1px solid rgba(255, 255, 255, 0.055);`n}"

    if ($css -notmatch "\.product-pathways-section") {
      $css = $css.TrimEnd() + @"

.product-pathways-section {
  position: relative;
  z-index: 2;
  margin-top: -1px;
  padding: 32px 0 8px;
}

.product-pathways {
  padding: 10px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.product-pathway {
  min-height: 132px;
  padding: 18px;
  border: 1px solid rgba(255, 255, 255, 0.075);
  border-radius: 8px;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  grid-template-areas:
    "icon copy"
    "cta cta";
  gap: 14px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.052), rgba(255, 255, 255, 0.014)),
    rgba(8, 9, 11, 0.34);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.052);
  transition: border-color 180ms ease, background-color 180ms ease, box-shadow 180ms ease, transform 180ms ease;
}

.product-pathway:hover {
  border-color: rgba(184, 145, 74, 0.46);
  box-shadow: 0 24px 58px rgba(0, 0, 0, 0.32), 0 14px 36px rgba(184, 145, 74, 0.08);
  transform: translateY(-4px);
}

.product-pathway-icon {
  grid-area: icon;
  width: 42px;
  height: 42px;
  border: 1px solid rgba(184, 145, 74, 0.36);
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #D8BE78;
  background: rgba(184, 145, 74, 0.08);
}

.product-pathway-copy {
  grid-area: copy;
  min-width: 0;
}

.product-pathway-copy strong {
  display: block;
  color: #F7F3EA;
  font-size: 16px;
  font-weight: 800;
  line-height: 1.25;
}

.product-pathway-copy span {
  display: block;
  margin-top: 7px;
  color: #AEB0B4;
  font-size: 13px;
  line-height: 1.55;
}

.product-pathway-cta {
  grid-area: cta;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: #D8BE78;
  font-size: 12px;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
"@
    }

    return $css
  }
}

function Update-GoldTokensEverywhere {
  $files = Get-ChildItem -Path (Get-RepoPath "src") -Recurse -File |
    Where-Object { $_.Extension -in ".ts", ".tsx", ".css", ".svg" }

  foreach ($file in $files) {
    $relative = Resolve-Path -LiteralPath $file.FullName -Relative
    Update-RepoText $relative {
      param($text)
      return Replace-GoldTokens $text
    }
  }
}

function Write-ProductPathways {
  $content = @'
import { ArrowRight, Bot, UserRoundCheck, Workflow } from "lucide-react";

const pathways = [
  {
    title: "AI Trading Agents",
    copy: "Ready-to-use software agents for structured trading workflows.",
    href: "/ai-trading-agents",
    cta: "View agents",
    icon: Bot,
  },
  {
    title: "Talk to Experts",
    copy: "Book focused consultation with experienced professionals.",
    href: "/experts",
    cta: "Explore experts",
    icon: UserRoundCheck,
  },
  {
    title: "Custom Solutions",
    copy: "Request websites, automations, AI systems, or tailored software.",
    href: "/custom-solutions",
    cta: "Request a quote",
    icon: Workflow,
  },
];

export default function ProductPathways() {
  return (
    <section className="product-pathways-section" aria-label="Vyntegra main products">
      <div className="container">
        <div className="product-pathways depth-panel">
          {pathways.map((pathway) => (
            <a key={pathway.title} href={pathway.href} className="product-pathway">
              <span className="product-pathway-icon">
                <pathway.icon size={20} strokeWidth={1.75} />
              </span>
              <span className="product-pathway-copy">
                <strong>{pathway.title}</strong>
                <span>{pathway.copy}</span>
              </span>
              <span className="product-pathway-cta">
                {pathway.cta}
                <ArrowRight size={15} strokeWidth={1.85} />
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
'@

  Write-RepoText "src/components/home/ProductPathways.tsx" $content
}

function Update-HomePage {
  Update-RepoText "src/app/page.tsx" {
    param($text)

    if ($text -notmatch 'ProductPathways') {
      $text = $text -replace 'import Hero from "@/components/home/Hero";', 'import Hero from "@/components/home/Hero";' + [Environment]::NewLine + 'import ProductPathways from "@/components/home/ProductPathways";'
      $text = $text -replace '(<TrustStrip />)', '$1' + [Environment]::NewLine + '      <ProductPathways />'
    }

    return $text
  }
}

function Update-HeroCtas {
  Update-RepoText "src/components/home/Hero.tsx" {
    param($text)

    $pattern = '(?s)<div className="hero-actions">.*?</div>'
    $replacement = @'
<div className="hero-actions">
            <Button href="/ai-trading-agents" variant="primary">
              AI Trading Agents <ArrowRight size={16} strokeWidth={1.75} />
            </Button>
            <Button href="/experts" variant="secondary">
              Talk to Experts <ArrowRight size={16} strokeWidth={1.75} />
            </Button>
            <Button href="/custom-solutions" variant="secondary">
              Request Quote <ArrowRight size={16} strokeWidth={1.75} />
            </Button>
          </div>
'@

    return [regex]::Replace($text, $pattern, $replacement, 1)
  }
}

Update-GoldTokensEverywhere
Update-GlobalCss
Write-ProductPathways
Update-HomePage
Update-HeroCtas

Write-Host "Satin brass visual script completed."
Write-Host "Palette: main $($palette.Main), highlight $($palette.Highlight), deep $($palette.Deep), text $($palette.Text)."
Write-Host "Run npm run lint and npm run build after applying."
