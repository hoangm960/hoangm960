import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import {
    personalInfo,
    projects,
    skillCategories,
} from "../../portfolio/src/lib/data";

const ROOT = resolve(import.meta.dir, "..");
const ASSETS_DIR = join(ROOT, "assets");
const ICON_CACHE_PATH = join(import.meta.dir, "icons-cache.json");

// Clean up any legacy project and dispatch assets
rmSync(join(ASSETS_DIR, "projects"), { recursive: true, force: true });
rmSync(join(ASSETS_DIR, "dispatch"), { recursive: true, force: true });
rmSync(join(ASSETS_DIR, "section-projects.svg"), { force: true });
mkdirSync(ASSETS_DIR, { recursive: true });

const PORTFOLIO_URL = "https://hoangm960.github.io/";
const CURRENT_YEAR = new Date().getFullYear();

type CuratedSkill = {
    name: string;
    icon: string;
    color?: string;
};

type CuratedLayer = {
    name: string;
    skills: CuratedSkill[];
};

const CURATED_STACK: CuratedLayer[] = [
    {
        name: "Languages",
        skills: [
            { name: "Python", icon: "logos:python" },
            { name: "TypeScript", icon: "logos:typescript-icon" },
            { name: "JavaScript", icon: "logos:javascript" },
            { name: "C++", icon: "logos:c-plusplus" },
            { name: "C", icon: "logos:c" },
            { name: "SQL", icon: "vscode-icons:file-type-sql" },
        ],
    },
    {
        name: "Frontend",
        skills: [
            { name: "React", icon: "logos:react" },
            { name: "Next.js", icon: "simple-icons:nextdotjs", color: "#ffffff" },
            { name: "Tailwind CSS", icon: "logos:tailwindcss-icon" },
            { name: "Zustand", icon: "devicon:zustand" },
            { name: "Three.js", icon: "simple-icons:threedotjs", color: "#ffffff" },
        ],
    },
    {
        name: "Backend & AI",
        skills: [
            { name: "Node.js", icon: "logos:nodejs-icon" },
            { name: "Express.js", icon: "simple-icons:express", color: "#ffffff" },
            { name: "FastAPI", icon: "logos:fastapi-icon" },
            { name: "Flask", icon: "simple-icons:flask", color: "#ffffff" },
            { name: "LangGraph", icon: "simple-icons:langchain", color: "#5eead4" },
            { name: "Socket.io", icon: "simple-icons:socketdotio", color: "#ffffff" },
        ],
    },
    {
        name: "Database",
        skills: [
            { name: "MySQL", icon: "devicon:mysql" },
            { name: "MongoDB", icon: "logos:mongodb-icon" },
            { name: "SQLite", icon: "devicon:sqlite" },
            { name: "Firebase", icon: "logos:firebase-icon" },
            { name: "FAISS", icon: "simple-icons:meta", color: "#60a5fa" },
        ],
    },
    {
        name: "System & Embedded",
        skills: [
            { name: "Linux", icon: "logos:linux-tux" },
            { name: "FreeRTOS", icon: "lucide:cpu", color: "#4ade80" },
            { name: "ESP32", icon: "simple-icons:espressif", color: "#f87171" },
            { name: "Raspberry Pi", icon: "logos:raspberry-pi" },
            { name: "OpenCV", icon: "logos:opencv" },
            { name: "TensorFlow", icon: "logos:tensorflow" },
        ],
    },
    {
        name: "Tools & Testing",
        skills: [
            { name: "Git", icon: "logos:git-icon" },
            { name: "GitHub Actions", icon: "logos:github-actions" },
            { name: "Vite", icon: "logos:vitejs" },
            { name: "Playwright", icon: "logos:playwright" },
            { name: "Jest", icon: "logos:jest" },
            { name: "Pytest", icon: "devicon:pytest" },
        ],
    },
];

async function loadIconMap(): Promise<Record<string, string>> {
    const cache: Record<string, string> = existsSync(ICON_CACHE_PATH)
        ? JSON.parse(readFileSync(ICON_CACHE_PATH, "utf-8"))
        : {};

    let updated = false;
    for (const layer of CURATED_STACK) {
        for (const skill of layer.skills) {
            const key = skill.color ? `${skill.icon}?color=${skill.color}` : skill.icon;
            if (!cache[key]) {
                const [prefix, name] = skill.icon.split(":");
                const url = skill.color
                    ? `https://api.iconify.design/${prefix}/${name}.svg?color=${encodeURIComponent(skill.color)}`
                    : `https://api.iconify.design/${prefix}/${name}.svg`;
                const res = await fetch(url);
                if (!res.ok) {
                    throw new Error(`Failed to fetch icon ${skill.icon}: ${res.status}`);
                }
                cache[key] = await res.text();
                updated = true;
            }
        }
    }

    if (updated) {
        writeFileSync(ICON_CACHE_PATH, JSON.stringify(cache, null, 2));
    }
    return cache;
}

function inlineSvgIcon(rawSvg: string, x: number, y: number, size: number, uid: string): string {
    const viewBoxMatch = rawSvg.match(/viewBox="([^"]+)"/);
    const viewBox = viewBoxMatch ? viewBoxMatch[1] : "0 0 24 24";

    let inner = rawSvg
        .replace(/^[\s\S]*?<svg[^>]*>/i, "")
        .replace(/<\/svg>\s*$/i, "")
        .trim();

    // Namespace all internal IDs to prevent collisions across icons in the same SVG document
    inner = inner
        .replace(/\bid="([^"]+)"/g, `id="${uid}-$1"`)
        .replace(/url\(#([^)]+)\)/g, `url(#${uid}-$1)`)
        .replace(/\bhref="#([^"]+)"/g, `href="#${uid}-$1"`)
        .replace(/\bxlink:href="#([^"]+)"/g, `xlink:href="#${uid}-$1"`);

    return `<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="${viewBox}">${inner}</svg>`;
}

function esc(str: string): string {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

function wrapText(text: string, maxCharsPerLine: number, maxLines?: number): string[] {
    const words = text.trim().split(/\s+/);
    const lines: string[] = [];
    let current = "";

    for (const word of words) {
        const candidate = current ? `${current} ${word}` : word;
        if (candidate.length <= maxCharsPerLine) {
            current = candidate;
        } else {
            if (current) lines.push(current);
            current = word;
        }
    }
    if (current) lines.push(current);

    if (maxLines && lines.length > maxLines) {
        const truncated = lines.slice(0, maxLines);
        let last = truncated[maxLines - 1];
        if (lines.length > maxLines && last.length > maxCharsPerLine - 4) {
            last = last.replace(/\s+\S*$/, "");
        }
        last = last.replace(/[.,;:\s]+$/, "");
        truncated[maxLines - 1] = `${last}…`;
        return truncated;
    }

    return lines;
}

function estimateTextWidth(text: string, fontSize: number, isMono = false): number {
    if (isMono) {
        return Math.ceil(text.length * fontSize * 0.6);
    }
    let width = 0;
    for (const ch of text) {
        if ("ilI1|.,:;'!/ ".includes(ch)) width += fontSize * 0.28;
        else if ("fjt()[]-".includes(ch)) width += fontSize * 0.36;
        else if ("mwMW@#%&QGO0+".includes(ch)) width += fontSize * 0.74;
        else if (ch === ch.toUpperCase() && ch !== ch.toLowerCase()) width += fontSize * 0.63;
        else width += fontSize * 0.53;
    }
    return Math.ceil(width);
}

// Compute portfolio stats exactly like SidebarPane.tsx
const earliestYear = projects.reduce((minYear, p) => {
    const year = parseInt(p.startDate.split("-")[0], 10);
    return Number.isNaN(year) ? minYear : Math.min(minYear, year);
}, CURRENT_YEAR);
const yearsCoding = Math.max(1, CURRENT_YEAR - earliestYear);
const totalProjects = projects.length;
const totalTechnologies = skillCategories.reduce(
    (sum, category) => sum + category.skills.length,
    0,
);

const FONT_SANS = `'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`;
const FONT_MONO = `'Geist Mono', 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`;

function generateHeroSvg(): string {
    const bioLines = wrapText(personalInfo.bio, 138, 3);
    const bioBarHeight = bioLines.length * 19 + 4;

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 360" width="100%" role="img" aria-label="${esc(personalInfo.name)} — ${esc(personalInfo.role)}">
  <defs>
    <style>
      .sans { font-family: ${FONT_SANS}; }
      .mono { font-family: ${FONT_MONO}; }
    </style>

    <radialGradient id="bg-glow-left" cx="15%" cy="15%" r="60%">
      <stop offset="0%" stop-color="#6366f1" stop-opacity="0.14" />
      <stop offset="100%" stop-color="#090814" stop-opacity="0" />
    </radialGradient>

    <radialGradient id="bg-glow-right" cx="85%" cy="85%" r="60%">
      <stop offset="0%" stop-color="#818cf8" stop-opacity="0.10" />
      <stop offset="100%" stop-color="#090814" stop-opacity="0" />
    </radialGradient>

    <linearGradient id="hero-border" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#818cf8" stop-opacity="0.55">
        <animate attributeName="stop-color" values="#818cf8;#312e81;#c7d2fe;#818cf8" dur="12s" repeatCount="indefinite" />
      </stop>
      <stop offset="50%" stop-color="#1e1b4b" stop-opacity="0.9" />
      <stop offset="100%" stop-color="#6366f1" stop-opacity="0.55">
        <animate attributeName="stop-color" values="#6366f1;#c7d2fe;#1e1b4b;#6366f1" dur="12s" repeatCount="indefinite" />
      </stop>
    </linearGradient>

    <linearGradient id="monogram-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1b1936" />
      <stop offset="100%" stop-color="#121126" />
    </linearGradient>

    <pattern id="dot-grid" width="24" height="24" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="0.85" fill="#818cf8" fill-opacity="0.08" />
    </pattern>
  </defs>

  <!-- Base Canvas Plate -->
  <rect x="1" y="1" width="1078" height="358" rx="24" fill="#090814" stroke="url(#hero-border)" stroke-width="1.8" />
  <rect x="1" y="1" width="1078" height="358" rx="24" fill="url(#bg-glow-left)" />
  <rect x="1" y="1" width="1078" height="358" rx="24" fill="url(#bg-glow-right)" />
  <rect x="1" y="1" width="1078" height="358" rx="24" fill="url(#dot-grid)" />

  <!-- Top 1px Specular Highlight -->
  <line x1="40" y1="2" x2="1040" y2="2" stroke="#818cf8" stroke-opacity="0.25" stroke-width="1" />

  <!-- ================================================================= -->
  <!-- ROW 1: IDENTITY + LIVE STATUS BADGES                              -->
  <!-- ================================================================= -->

  <!-- 64x64 Rounded-2xl Vector Monogram Badge -->
  <g transform="translate(36, 30)">
    <rect x="0" y="0" width="64" height="64" rx="16" fill="url(#monogram-bg)" stroke="#818cf8" stroke-opacity="0.45" stroke-width="2" />
    <rect x="5" y="5" width="54" height="54" rx="12" fill="none" stroke="#1e1b4b" stroke-width="1" />
    <text x="32" y="36" text-anchor="middle" class="sans" font-size="21" font-weight="800" fill="#ffffff" letter-spacing="-0.5">HM</text>
    <text x="32" y="51" text-anchor="middle" class="mono" font-size="9.5" font-weight="600" fill="#818cf8">&lt;/&gt;</text>
  </g>

  <!-- Name & Role -->
  <text x="116" y="58" class="sans" font-size="28" font-weight="700" fill="#ffffff" letter-spacing="-0.6">${esc(personalInfo.name)}</text>
  <text x="116" y="82" class="sans" font-size="14.5" font-weight="600" fill="#818cf8">${esc(personalInfo.role)}</text>

  <!-- Right Status & Handle Pills -->
  <g transform="translate(728, 36)">
    <rect x="0" y="0" width="194" height="28" rx="9" fill="#121126" stroke="#1e1b4b" stroke-width="1.2" />
    <circle cx="16" cy="14" r="3.5" fill="#818cf8">
      <animate attributeName="r" values="3.5;5;3.5" dur="2s" repeatCount="indefinite" />
    </circle>
    <circle cx="16" cy="14" r="7" fill="none" stroke="#818cf8" stroke-width="1">
      <animate attributeName="r" values="4;10;4" dur="2s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.7;0;0.7" dur="2s" repeatCount="indefinite" />
    </circle>
    <text x="29" y="18" class="mono" font-size="10.5" font-weight="600" fill="#818cf8">ONLINE · HCMC UTC+7</text>
  </g>

  <g transform="translate(932, 36)">
    <rect x="0" y="0" width="112" height="28" rx="9" fill="#121126" stroke="#1e1b4b" stroke-width="1.2" />
    <text x="56" y="18" text-anchor="middle" class="mono" font-size="11" fill="#a1a1aa">@hoangm960</text>
  </g>

  <!-- ================================================================= -->
  <!-- ROW 2: TAGLINE & FULL-WIDTH BIO                                   -->
  <!-- ================================================================= -->
  <text x="36" y="122" class="sans" font-size="14" font-weight="500" fill="#e4e4e7">${esc(personalInfo.tagline)}</text>

  <rect x="36" y="138" width="2.5" height="${bioBarHeight}" rx="1.25" fill="#1e1b4b" />
  <rect x="36" y="138" width="2.5" height="26" rx="1.25" fill="#818cf8" />
  ${bioLines
      .map(
          (line, idx) =>
              `<text x="52" y="${152 + idx * 19}" class="sans" font-size="12.5" fill="#a1a1aa">${esc(line)}</text>`,
      )
      .join("\n  ")}

  <!-- ================================================================= -->
  <!-- ROW 3: 3-COLUMN AUTO-COMPUTED STAT STRIP                          -->
  <!-- ================================================================= -->
  <g transform="translate(36, 214)">
    <!-- Card 1: Years Coding -->
    <g transform="translate(0, 0)">
      <rect x="0" y="0" width="324" height="68" rx="14" fill="#121126" fill-opacity="0.85" stroke="#1e1b4b" stroke-width="1.2" />
      <text x="20" y="31" class="mono" font-size="22" font-weight="700" fill="#ffffff">${yearsCoding}+</text>
      <text x="20" y="51" class="sans" font-size="12" fill="#a1a1aa">Years Coding</text>
      <text x="304" y="40" text-anchor="end" class="mono" font-size="10.5" fill="#71717a">${earliestYear} — PRESENT</text>
    </g>

    <!-- Card 2: Key Projects -->
    <g transform="translate(342, 0)">
      <rect x="0" y="0" width="324" height="68" rx="14" fill="#121126" fill-opacity="0.85" stroke="#1e1b4b" stroke-width="1.2" />
      <text x="20" y="31" class="mono" font-size="22" font-weight="700" fill="#818cf8">${totalProjects}</text>
      <text x="20" y="51" class="sans" font-size="12" fill="#a1a1aa">Key Projects</text>
      <text x="304" y="40" text-anchor="end" class="mono" font-size="10.5" fill="#818cf8">WEB · AI · EMBEDDED</text>
    </g>

    <!-- Card 3: Technologies -->
    <g transform="translate(684, 0)">
      <rect x="0" y="0" width="324" height="68" rx="14" fill="#121126" fill-opacity="0.85" stroke="#1e1b4b" stroke-width="1.2" />
      <text x="20" y="31" class="mono" font-size="22" font-weight="700" fill="#ffffff">${totalTechnologies}</text>
      <text x="20" y="51" class="sans" font-size="12" fill="#a1a1aa">Technologies</text>
      <text x="304" y="40" text-anchor="end" class="mono" font-size="10.5" fill="#71717a">${skillCategories.length} STACK LAYERS</text>
    </g>
  </g>

  <!-- ================================================================= -->
  <!-- ROW 4: BOTTOM LOCATION, CONTACT & PORTFOLIO BAR                   -->
  <!-- ================================================================= -->
  <line x1="36" y1="298" x2="1044" y2="298" stroke="#1e1b4b" stroke-width="1" />

  <g transform="translate(36, 310)">
    <!-- Location Pill -->
    <rect x="0" y="0" width="144" height="30" rx="8" fill="#121126" stroke="#1e1b4b" stroke-width="1" />
    <path d="M16 9.5c-2.2 0-4 1.8-4 4 0 3 4 7 4 7s4-4 4-7c0-2.2-1.8-4-4-4zm0 5.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" fill="#818cf8" />
    <text x="28" y="19" class="sans" font-size="11.5" fill="#a1a1aa">${esc(personalInfo.location)}</text>

    <!-- Email Pill -->
    <g transform="translate(154, 0)">
      <rect x="0" y="0" width="194" height="30" rx="8" fill="#121126" stroke="#1e1b4b" stroke-width="1" />
      <rect x="11" y="10" width="11" height="8" rx="1.5" fill="none" stroke="#818cf8" stroke-width="1.3" />
      <path d="M11 11l5.5 4 5.5-4" fill="none" stroke="#818cf8" stroke-width="1.3" />
      <text x="28" y="19" class="sans" font-size="11.5" fill="#d4d4d8">${esc(personalInfo.email)}</text>
    </g>

    <!-- Primary Portfolio CTA Pill -->
    <g transform="translate(732, 0)">
      <rect x="0" y="0" width="276" height="30" rx="9" fill="#818cf8" />
      <text x="138" y="19.5" text-anchor="middle" class="sans" font-size="11.5" font-weight="700" fill="#090814">Interactive Portfolio · hoangm960.github.io ↗</text>
    </g>
  </g>
</svg>
`;
}

function generateSkillsSvg(iconMap: Record<string, string>): string {
    const outerPad = 18;
    let currentY = outerPad;
    const categoryBlocks: string[] = [];

    const pillStartX = 228;
    const maxPillRightX = 1040;
    const pillHeight = 42;
    const iconSize = 20;
    const pillGapX = 10;
    const pillGapY = 10;

    let iconCounter = 0;

    for (const category of CURATED_STACK) {
        let rowX = pillStartX;
        let rowY = 16;
        const pillsSvg: string[] = [];

        for (const skill of category.skills) {
            const textW = estimateTextWidth(skill.name, 14, false);
            const pillW = 14 + iconSize + 10 + textW + 16;

            if (rowX + pillW > maxPillRightX) {
                rowX = pillStartX;
                rowY += pillHeight + pillGapY;
            }

            const key = skill.color ? `${skill.icon}?color=${skill.color}` : skill.icon;
            const rawIcon = iconMap[key];
            const uid = `ico${++iconCounter}`;
            const iconSvg = inlineSvgIcon(rawIcon, 14, (pillHeight - iconSize) / 2, iconSize, uid);

            pillsSvg.push(`<g transform="translate(${rowX}, ${rowY})">
        <rect x="0" y="0" width="${pillW}" height="${pillHeight}" rx="11" fill="#090814" stroke="#1e1b4b" stroke-width="1.3" />
        ${iconSvg}
        <text x="${14 + iconSize + 10}" y="26" class="sans" font-size="14" font-weight="600" fill="#f4f4f5">${esc(skill.name)}</text>
      </g>`);

            rowX += pillW + pillGapX;
        }

        const cardHeight = rowY + pillHeight + 16;

        categoryBlocks.push(`<g transform="translate(${outerPad}, ${currentY})">
    <rect x="0" y="0" width="${1080 - outerPad * 2}" height="${cardHeight}" rx="16" fill="#121126" fill-opacity="0.9" stroke="#1e1b4b" stroke-width="1.4" />
    <text x="24" y="${cardHeight / 2 + 4.5}" class="mono" font-size="13" font-weight="700" fill="#818cf8" letter-spacing="0.8">${esc(category.name.toUpperCase())}</text>
    <line x1="206" y1="14" x2="206" y2="${cardHeight - 14}" stroke="#1e1b4b" stroke-width="1.2" />
    ${pillsSvg.join("\n    ")}
  </g>`);

        currentY += cardHeight + 12;
    }

    const totalHeight = currentY - 12 + outerPad;

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 ${totalHeight}" width="100%" role="img" aria-label="Technical Stack">
  <defs>
    <style>
      .sans { font-family: ${FONT_SANS}; }
      .mono { font-family: ${FONT_MONO}; }
    </style>
  </defs>

  <rect x="1" y="1" width="1078" height="${totalHeight - 2}" rx="24" fill="#090814" stroke="#1e1b4b" stroke-width="1.8" />

  ${categoryBlocks.join("\n  ")}
</svg>
`;
}

function generateReadme(): string {
    return `<!-- AUTO-GENERATED FROM ../portfolio/src/lib/data.ts — Run \`bun run generate\` to sync -->

<div align="center">
  <a href="${PORTFOLIO_URL}">
    <img src="./assets/hero.svg" alt="${personalInfo.name} — ${personalInfo.role}" width="100%" />
  </a>
</div>

<br />

<div align="center">
  <img src="./assets/skills.svg" alt="Technical Stack" width="100%" />
</div>
`;
}

const iconMap = await loadIconMap();
writeFileSync(join(ASSETS_DIR, "hero.svg"), generateHeroSvg());
writeFileSync(join(ASSETS_DIR, "skills.svg"), generateSkillsSvg(iconMap));
writeFileSync(join(ROOT, "README.md"), generateReadme());

console.log(
    `Generated GitHub profile assets with real vector logos (${CURATED_STACK.reduce((s, c) => s + c.skills.length, 0)} core tools across ${CURATED_STACK.length} layers).`,
);
