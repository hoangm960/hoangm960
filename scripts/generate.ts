import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import {
    personalInfo,
    projects,
    skillCategories,
    socialLinks,
    type Project,
    type Skill,
} from "../../portfolio/src/lib/data";

const ROOT = resolve(import.meta.dir, "..");
const ASSETS_DIR = join(ROOT, "assets");
const DISPATCH_DIR = join(ASSETS_DIR, "dispatch");

// Clean up any legacy project card assets
rmSync(join(ASSETS_DIR, "projects"), { recursive: true, force: true });
rmSync(join(ASSETS_DIR, "section-projects.svg"), { force: true });
mkdirSync(DISPATCH_DIR, { recursive: true });

const PORTFOLIO_URL = "https://hoangm960.github.io/";
const CURRENT_YEAR = new Date().getFullYear();

export type DomainFilter = "web" | "ai" | "systems";

function getProjectDomain(project: Project): DomainFilter {
    const stack = project.techStack.join(" ").toLowerCase();
    const desc = project.description.toLowerCase();
    if (
        stack.includes("esp32") ||
        stack.includes("freertos") ||
        stack.includes("c++") ||
        stack.includes("posix") ||
        stack.includes("antlr4") ||
        stack.includes("arduino")
    ) {
        return "systems";
    }
    if (
        stack.includes("langgraph") ||
        stack.includes("gemini") ||
        stack.includes("mediapipe") ||
        stack.includes("scipy") ||
        desc.includes("agent")
    ) {
        return "ai";
    }
    return "web";
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
        if ("ilI1|.,:;'!/ ".includes(ch)) width += fontSize * 0.27;
        else if ("fjt()[]-".includes(ch)) width += fontSize * 0.35;
        else if ("mwMW@#%&QGO0".includes(ch)) width += fontSize * 0.74;
        else if (ch === ch.toUpperCase() && ch !== ch.toLowerCase()) width += fontSize * 0.62;
        else width += fontSize * 0.51;
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

const webProjects = projects.filter((p) => getProjectDomain(p) === "web");
const aiProjects = projects.filter((p) => getProjectDomain(p) === "ai");
const systemsProjects = projects.filter((p) => getProjectDomain(p) === "systems");

const FONT_SANS = `'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`;
const FONT_MONO = `'Geist Mono', 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`;

const SKILL_BRAND_COLORS: Record<string, string> = {
    Python: "#38bdf8",
    TypeScript: "#3b82f6",
    JavaScript: "#facc15",
    "C++": "#60a5fa",
    C: "#93c5fd",
    Java: "#fb923c",
    SQL: "#38bdf8",
    Dart: "#2dd4bf",
    React: "#61dafb",
    "Next.js": "#ffffff",
    Zustand: "#f59e0b",
    "TanStack Query": "#ef4444",
    "Tailwind CSS": "#38bdf8",
    "Three.js": "#e4e4e7",
    "HTML5 Canvas": "#fb923c",
    "Framer Motion": "#c084fc",
    Recharts: "#38bdf8",
    SolidJS: "#60a5fa",
    Flutter: "#38bdf8",
    HTML: "#f97316",
    CSS: "#3b82f6",
    Zod: "#60a5fa",
    "Node.js": "#4ade80",
    "Express.js": "#e4e4e7",
    FastAPI: "#14b8a6",
    Flask: "#e4e4e7",
    LangGraph: "#5eead4",
    "Socket.io": "#ffffff",
    WebSockets: "#818cf8",
    "REST APIs": "#38bdf8",
    PDFKit: "#f87171",
    MySQL: "#38bdf8",
    MongoDB: "#4ade80",
    SQLite: "#60a5fa",
    "Firebase / Firestore": "#fbbf24",
    SQLAlchemy: "#f87171",
    FAISS: "#60a5fa",
    Linux: "#facc15",
    FreeRTOS: "#f87171",
    ESP32: "#34d399",
    "Raspberry Pi": "#f43f5e",
    Arduino: "#2dd4bf",
    MQTT: "#c084fc",
    OpenCV: "#4ade80",
    MediaPipe: "#2dd4bf",
    "TensorFlow Lite Micro": "#fb923c",
    "SciPy / NumPy": "#60a5fa",
    Git: "#f97316",
    "GitHub Actions": "#60a5fa",
    Vite: "#a855f7",
    Jest: "#f43f5e",
    Playwright: "#4ade80",
    Vitest: "#a3e635",
    Pytest: "#38bdf8",
    Supertest: "#818cf8",
    ANTLR4: "#f87171",
    PlatformIO: "#fb923c",
    Vercel: "#ffffff",
    npm: "#ef4444",
    Yarn: "#38bdf8",
    Bun: "#f472b6",
};

function shortProjectName(name: string): string {
    return name
        .replace("Fire Detection & Extinguishment System", "Fire RTOS")
        .replace("Smart Security System", "Smart Security IoT");
}

function generateHeroSvg(): string {
    const taglineLines = wrapText(personalInfo.tagline, 62, 2);
    const bioLines = wrapText(personalInfo.bio, 73, 6);

    const domains = [
        {
            code: "01",
            label: "WEB & FULL-STACK",
            count: webProjects.length,
            ratio: Math.round((webProjects.length / totalProjects) * 100),
            barWidth: Math.round((webProjects.length / totalProjects) * 172),
            projectsLine: webProjects.map((p) => shortProjectName(p.name)).join(" · "),
            stackLine: "React 19 · Next.js 14 · HTML5 Canvas + R-tree · Express · Socket.io",
            accent: "#818cf8",
        },
        {
            code: "02",
            label: "AI & DSP",
            count: aiProjects.length,
            ratio: Math.round((aiProjects.length / totalProjects) * 100),
            barWidth: Math.round((aiProjects.length / totalProjects) * 172),
            projectsLine: aiProjects.map((p) => shortProjectName(p.name)).join(" · "),
            stackLine: "LangGraph · 18 Gemini ReAct Tools · FAISS RAG · MediaPipe · SciPy",
            accent: "#a5b4fc",
        },
        {
            code: "03",
            label: "EMBEDDED & SYSTEMS",
            count: systemsProjects.length,
            ratio: Math.round((systemsProjects.length / totalProjects) * 100),
            barWidth: Math.round((systemsProjects.length / totalProjects) * 172),
            projectsLine: systemsProjects.map((p) => shortProjectName(p.name)).join(" · "),
            stackLine: "ESP32 FreeRTOS · TFLite Micro · RPi MQTT · ANTLR4 · POSIX C",
            accent: "#c7d2fe",
        },
    ];

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 510" width="100%" role="img" aria-label="${esc(personalInfo.name)} — ${esc(personalInfo.role)}">
  <defs>
    <style>
      .sans { font-family: ${FONT_SANS}; }
      .mono { font-family: ${FONT_MONO}; }
    </style>

    <radialGradient id="bg-glow-left" cx="15%" cy="15%" r="55%">
      <stop offset="0%" stop-color="#6366f1" stop-opacity="0.12" />
      <stop offset="100%" stop-color="#090814" stop-opacity="0" />
    </radialGradient>

    <radialGradient id="bg-glow-right" cx="85%" cy="80%" r="55%">
      <stop offset="0%" stop-color="#818cf8" stop-opacity="0.10" />
      <stop offset="100%" stop-color="#090814" stop-opacity="0" />
    </radialGradient>

    <linearGradient id="inspector-border" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#818cf8" stop-opacity="0.65">
        <animate attributeName="stop-color" values="#818cf8;#4f46e5;#c7d2fe;#818cf8" dur="12s" repeatCount="indefinite" />
      </stop>
      <stop offset="50%" stop-color="#312e81" stop-opacity="0.45" />
      <stop offset="100%" stop-color="#6366f1" stop-opacity="0.7">
        <animate attributeName="stop-color" values="#6366f1;#c7d2fe;#4338ca;#6366f1" dur="12s" repeatCount="indefinite" />
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
  <rect x="1" y="1" width="1078" height="508" rx="24" fill="#090814" stroke="#1e1b4b" stroke-width="2" />
  <rect x="1" y="1" width="1078" height="508" rx="24" fill="url(#bg-glow-left)" />
  <rect x="1" y="1" width="1078" height="508" rx="24" fill="url(#bg-glow-right)" />
  <rect x="1" y="1" width="1078" height="508" rx="24" fill="url(#dot-grid)" />

  <!-- Top 1px Specular Highlight -->
  <line x1="40" y1="2" x2="1040" y2="2" stroke="#818cf8" stroke-opacity="0.22" stroke-width="1" />

  <!-- Split-Pane Divider (Matching SidebarPane border-indigo-950/80) -->
  <line x1="494" y1="28" x2="494" y2="482" stroke="#1e1b4b" stroke-width="1.5" />

  <!-- ================================================================= -->
  <!-- LEFT PANE: PROFILE & STATS (Translating SidebarPane.tsx)          -->
  <!-- ================================================================= -->

  <!-- 64x64 Rounded-2xl Vector Monogram Badge -->
  <g transform="translate(32, 34)">
    <rect x="0" y="0" width="64" height="64" rx="16" fill="url(#monogram-bg)" stroke="#818cf8" stroke-opacity="0.45" stroke-width="2" />
    <rect x="5" y="5" width="54" height="54" rx="12" fill="none" stroke="#1e1b4b" stroke-width="1" />
    <text x="32" y="36" text-anchor="middle" class="sans" font-size="21" font-weight="800" fill="#ffffff" letter-spacing="-0.5">HM</text>
    <text x="32" y="51" text-anchor="middle" class="mono" font-size="9.5" font-weight="600" fill="#818cf8">&lt;/&gt;</text>
  </g>

  <!-- Name, Role & Handle Pill -->
  <text x="112" y="62" class="sans" font-size="26" font-weight="700" fill="#ffffff" letter-spacing="-0.6">${esc(personalInfo.name)}</text>
  <text x="112" y="85" class="sans" font-size="14" font-weight="600" fill="#818cf8">${esc(personalInfo.role)}</text>

  <g transform="translate(362, 42)">
    <rect x="0" y="0" width="106" height="24" rx="8" fill="#121126" stroke="#1e1b4b" stroke-width="1" />
    <text x="53" y="16" text-anchor="middle" class="mono" font-size="11" fill="#a1a1aa">@hoangm960</text>
  </g>

  <!-- Tagline -->
  ${taglineLines
      .map(
          (line, idx) =>
              `<text x="32" y="${124 + idx * 19}" class="sans" font-size="13" fill="#d4d4d8">${esc(line)}</text>`,
      )
      .join("\n  ")}

  <!-- Bio with Indigo Left Border -->
  <rect x="32" y="158" width="2.5" height="${bioLines.length * 17.5 + 4}" rx="1.25" fill="#1e1b4b" />
  <rect x="32" y="158" width="2.5" height="36" rx="1.25" fill="#818cf8" />
  ${bioLines
      .map(
          (line, idx) =>
              `<text x="46" y="${171 + idx * 17.5}" class="sans" font-size="11.5" fill="#a1a1aa">${esc(line)}</text>`,
      )
      .join("\n  ")}

  <!-- Auto-Computed 3-Stat Strip -->
  <g transform="translate(32, 286)">
    <!-- Card 1: Years Coding -->
    <g transform="translate(0, 0)">
      <rect x="0" y="0" width="138" height="66" rx="12" fill="#121126" fill-opacity="0.85" stroke="#1e1b4b" stroke-width="1.2" />
      <text x="14" y="30" class="mono" font-size="20" font-weight="700" fill="#ffffff">${yearsCoding}+</text>
      <text x="14" y="49" class="sans" font-size="11" fill="#a1a1aa">Years Coding</text>
    </g>

    <!-- Card 2: Key Projects -->
    <g transform="translate(149, 0)">
      <rect x="0" y="0" width="138" height="66" rx="12" fill="#121126" fill-opacity="0.85" stroke="#1e1b4b" stroke-width="1.2" />
      <text x="14" y="30" class="mono" font-size="20" font-weight="700" fill="#818cf8">${totalProjects}</text>
      <text x="14" y="49" class="sans" font-size="11" fill="#a1a1aa">Key Projects</text>
    </g>

    <!-- Card 3: Technologies -->
    <g transform="translate(298, 0)">
      <rect x="0" y="0" width="138" height="66" rx="12" fill="#121126" fill-opacity="0.85" stroke="#1e1b4b" stroke-width="1.2" />
      <text x="14" y="30" class="mono" font-size="20" font-weight="700" fill="#ffffff">${totalTechnologies}</text>
      <text x="14" y="49" class="sans" font-size="11" fill="#a1a1aa">Technologies</text>
    </g>
  </g>

  <!-- Section Jump Nav Strip (Translating SidebarPane nav) -->
  <g transform="translate(32, 372)">
    <rect x="0" y="0" width="436" height="52" rx="12" fill="#121126" fill-opacity="0.55" stroke="#1e1b4b" stroke-width="1" />
    <text x="14" y="21" class="mono" font-size="10" font-weight="600" fill="#818cf8" letter-spacing="0.8">PROFILE // NAVIGATION</text>
    <text x="14" y="39" class="mono" font-size="10.5" fill="#a1a1aa">01 · STACK (${skillCategories.length} LAYERS)</text>
    <text x="176" y="39" class="mono" font-size="10.5" fill="#a1a1aa">02 · DISPATCH</text>
    <text x="292" y="39" class="mono" font-size="10.5" fill="#a1a1aa">03 · PINNED REPOS ↓</text>
  </g>

  <!-- Bottom Location & Contact Pills -->
  <g transform="translate(32, 442)">
    <!-- Location Pill -->
    <rect x="0" y="0" width="144" height="32" rx="8" fill="#121126" stroke="#1e1b4b" stroke-width="1" />
    <path d="M16 10.5c-2.2 0-4 1.8-4 4 0 3 4 7 4 7s4-4 4-7c0-2.2-1.8-4-4-4zm0 5.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" fill="#818cf8" />
    <text x="28" y="20" class="sans" font-size="11.5" fill="#a1a1aa">${esc(personalInfo.location)}</text>

    <!-- Email Pill -->
    <g transform="translate(154, 0)">
      <rect x="0" y="0" width="194" height="32" rx="8" fill="#121126" stroke="#1e1b4b" stroke-width="1" />
      <rect x="11" y="11" width="11" height="8" rx="1.5" fill="none" stroke="#818cf8" stroke-width="1.3" />
      <path d="M11 12l5.5 4 5.5-4" fill="none" stroke="#818cf8" stroke-width="1.3" />
      <text x="28" y="20" class="sans" font-size="11.5" fill="#d4d4d8">${esc(personalInfo.email)}</text>
    </g>

    <!-- University Pill -->
    <g transform="translate(358, 0)">
      <rect x="0" y="0" width="78" height="32" rx="8" fill="#121126" stroke="#1e1b4b" stroke-width="1" />
      <text x="39" y="20" text-anchor="middle" class="mono" font-size="11" font-weight="600" fill="#818cf8">FUV CS</text>
    </g>
  </g>

  <!-- ================================================================= -->
  <!-- RIGHT PANE: SYSTEM ARCHITECTURE · 03 DOMAINS OVERVIEW CARD        -->
  <!-- ================================================================= -->
  <g transform="translate(520, 26)">
    <!-- Outer Inspector Card -->
    <rect x="0" y="0" width="528" height="458" rx="22" fill="#121126" fill-opacity="0.95" stroke="url(#inspector-border)" stroke-width="1.5" />

    <!-- Top Inspector Control Bar -->
    <g transform="translate(22, 18)">
      <rect x="0" y="0" width="192" height="28" rx="9" fill="#1b1936" />
      <!-- Pulsing Radar Dot -->
      <circle cx="16" cy="14" r="3.5" fill="#818cf8">
        <animate attributeName="r" values="3.5;5;3.5" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="16" cy="14" r="7" fill="none" stroke="#818cf8" stroke-width="1">
        <animate attributeName="r" values="4;10;4" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.7;0;0.7" dur="2s" repeatCount="indefinite" />
      </circle>
      <text x="29" y="18" class="mono" font-size="10.5" font-weight="600" fill="#818cf8">ONLINE · HCMC UTC+7</text>

      <!-- Right Counter + Live Badge -->
      <text x="434" y="18" text-anchor="end" class="mono" font-size="11" fill="#a1a1aa">#01–#${String(totalProjects).padStart(2, "0")} / 03 DOMAINS</text>
      <rect x="444" y="3" width="40" height="22" rx="6" fill="#090814" stroke="#1e1b4b" stroke-width="1" />
      <text x="464" y="17.5" text-anchor="middle" class="mono" font-size="10" fill="#a1a1aa">LIVE</text>
    </g>

    <line x1="22" y1="58" x2="506" y2="58" stroke="#1e1b4b" stroke-width="1" />

    <!-- Overview Title & Badge -->
    <g transform="translate(22, 72)">
      <rect x="0" y="0" width="212" height="22" rx="11" fill="#818cf8" fill-opacity="0.12" stroke="#818cf8" stroke-opacity="0.3" stroke-width="1" />
      <text x="106" y="14.5" text-anchor="middle" class="mono" font-size="10" font-weight="600" fill="#818cf8">ARCHITECTURE OVERVIEW</text>
      <text x="222" y="15" class="mono" font-size="11" fill="#a1a1aa">2020 — Present</text>

      <text x="0" y="45" class="sans" font-size="20" font-weight="700" fill="#ffffff" letter-spacing="-0.4">Engineering Across 3 Core Domains</text>
    </g>

    <!-- 3 Domain Telemetry Cards -->
    ${domains
        .map((d, idx) => {
            const yOffset = 132 + idx * 88;
            return `<g transform="translate(22, ${yOffset})">
      <rect x="0" y="0" width="484" height="78" rx="14" fill="#090814" stroke="#1e1b4b" stroke-width="1.2" />
      <text x="16" y="23" class="mono" font-size="11" font-weight="700" fill="${d.accent}">${d.code} · ${esc(d.label)}</text>
      <text x="284" y="23" text-anchor="end" class="mono" font-size="10.5" fill="#a1a1aa">${d.count} systems (${d.ratio}%)</text>

      <!-- Telemetry Progress Bar Track + Animated Fill -->
      <rect x="296" y="14" width="172" height="7" rx="3.5" fill="#121126" stroke="#1e1b4b" stroke-width="0.8" />
      <rect x="296" y="14" width="${d.barWidth}" height="7" rx="3.5" fill="${d.accent}">
        <animate attributeName="width" from="0" to="${d.barWidth}" dur="1s" fill="freeze" />
      </rect>

      <text x="16" y="45" class="sans" font-size="12" font-weight="600" fill="#e4e4e7">${esc(d.projectsLine)}</text>
      <text x="16" y="64" class="mono" font-size="10.5" fill="#a1a1aa">${esc(d.stackLine)}</text>
    </g>`;
        })
        .join("\n    ")}

    <!-- Bottom CTA Bar -->
    <line x1="22" y1="404" x2="506" y2="404" stroke="#1e1b4b" stroke-width="1" />
    <g transform="translate(22, 415)">
      <rect x="0" y="0" width="276" height="30" rx="9" fill="#818cf8" />
      <text x="138" y="19.5" text-anchor="middle" class="sans" font-size="11.5" font-weight="700" fill="#090814">Interactive Portfolio · hoangm960.github.io ↗</text>

      <text x="484" y="19.5" text-anchor="end" class="mono" font-size="10.5" fill="#a1a1aa">↓ See Pinned Repos below</text>
    </g>
  </g>
</svg>
`;
}

function renderSkillGlyph(skill: Skill, cx: number, cy: number): string {
    const color = SKILL_BRAND_COLORS[skill.name] || skill.bgColor || "#818cf8";
    if (skill.icon === null) {
        return `<path d="M${cx} ${cy - 5} L${cx + 1.4} ${cy - 1.4} L${cx + 5} ${cy} L${cx + 1.4} ${cy + 1.4} L${cx} ${cy + 5} L${cx - 1.4} ${cy + 1.4} L${cx - 5} ${cy} L${cx - 1.4} ${cy - 1.4} Z" fill="#818cf8" />`;
    }
    return `<circle cx="${cx}" cy="${cy}" r="3.8" fill="${color}" />`;
}

function generateSkillsSvg(): string {
    const sortedCategories = [...skillCategories].sort((a, b) => a.order - b.order);

    let currentY = 86;
    const categoryBlocks: string[] = [];

    const pillStartX = 224;
    const maxPillRightX = 1054;
    const pillHeight = 28;
    const pillGapX = 8;
    const pillGapY = 8;

    for (const category of sortedCategories) {
        let rowX = pillStartX;
        let rowY = 16;
        const pillsSvg: string[] = [];

        for (const skill of category.skills) {
            const textW = estimateTextWidth(skill.name, 12, false);
            const pillW = 24 + textW + 12;

            if (rowX + pillW > maxPillRightX) {
                rowX = pillStartX;
                rowY += pillHeight + pillGapY;
            }

            pillsSvg.push(`<g transform="translate(${rowX}, ${rowY})">
        <rect x="0" y="0" width="${pillW}" height="${pillHeight}" rx="8" fill="#090814" stroke="#1e1b4b" stroke-width="1" />
        ${renderSkillGlyph(skill, 13, pillHeight / 2)}
        <text x="23" y="18.5" class="sans" font-size="12" fill="#d4d4d8">${esc(skill.name)}</text>
      </g>`);

            rowX += pillW + pillGapX;
        }

        const cardHeight = rowY + pillHeight + 16;

        categoryBlocks.push(`<g transform="translate(0, ${currentY})">
    <rect x="1" y="0" width="1078" height="${cardHeight}" rx="18" fill="#121126" fill-opacity="0.85" stroke="#1e1b4b" stroke-width="1.4" />
    <text x="24" y="27" class="mono" font-size="12" font-weight="700" fill="#818cf8" letter-spacing="0.8">${esc(category.name.toUpperCase())}</text>
    <text x="24" y="45" class="sans" font-size="11.5" fill="#71717a">${category.skills.length} tools</text>
    <line x1="204" y1="14" x2="204" y2="${cardHeight - 14}" stroke="#1e1b4b" stroke-width="1" />
    ${pillsSvg.join("\n    ")}
  </g>`);

        currentY += cardHeight + 14;
    }

    const totalHeight = currentY + 4;

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 ${totalHeight}" width="100%" role="img" aria-label="01 / Capabilities — Technical Stack by Layer">
  <defs>
    <style>
      .sans { font-family: ${FONT_SANS}; }
      .mono { font-family: ${FONT_MONO}; }
    </style>
  </defs>

  <rect x="0" y="0" width="1080" height="${totalHeight}" rx="18" fill="#090814" />

  <!-- Section Header -->
  <text x="4" y="22" class="mono" font-size="11" font-weight="600" fill="#818cf8" letter-spacing="1.6">01 / CAPABILITIES</text>
  <text x="4" y="48" class="sans" font-size="20" font-weight="700" fill="#ffffff" letter-spacing="-0.3">Technical Stack by Layer</text>

  <g transform="translate(888, 22)">
    <rect x="0" y="0" width="190" height="28" rx="8" fill="#121126" stroke="#1e1b4b" stroke-width="1" />
    <text x="95" y="18" text-anchor="middle" class="mono" font-size="11" fill="#a1a1aa">${skillCategories.length} DOMAINS · ${totalTechnologies} TOOLS</text>
  </g>

  <line x1="0" y1="68" x2="1080" y2="68" stroke="#1e1b4b" stroke-width="1.5" />

  <!-- 6 Layer Cards -->
  ${categoryBlocks.join("\n  ")}
</svg>
`;
}

function generateDispatchHeaderSvg(): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 128" width="100%" role="img" aria-label="02 / Dispatch — Start a Conversation">
  <defs>
    <style>
      .sans { font-family: ${FONT_SANS}; }
      .mono { font-family: ${FONT_MONO}; }
    </style>
  </defs>

  <rect x="0" y="0" width="1080" height="128" rx="16" fill="#090814" />
  <text x="4" y="22" class="mono" font-size="11" font-weight="600" fill="#818cf8" letter-spacing="1.6">02 / DISPATCH</text>
  <text x="4" y="48" class="sans" font-size="20" font-weight="700" fill="#ffffff" letter-spacing="-0.3">Start a Conversation</text>
  <line x1="0" y1="64" x2="1080" y2="64" stroke="#1e1b4b" stroke-width="1.5" />

  <rect x="1" y="76" width="1078" height="48" rx="14" fill="#121126" stroke="#1e1b4b" stroke-width="1.2" />
  <circle cx="24" cy="100" r="4" fill="#818cf8">
    <animate attributeName="opacity" values="1;0.35;1" dur="2.2s" repeatCount="indefinite" />
  </circle>
  <text x="38" y="104" class="sans" font-size="12.5" fill="#e4e4e7">Open to Full-Stack, AI Agent &amp; Embedded/Systems Engineering Opportunities</text>
  <text x="1056" y="104" text-anchor="end" class="mono" font-size="11.5" fill="#818cf8">Direct: ${esc(personalInfo.email)} · ${esc(personalInfo.location)}</text>
</svg>
`;
}

function generateDispatchButtonSvg(opts: {
    label: string;
    primary?: boolean;
    width: number;
}): string {
    const fill = opts.primary ? "#818cf8" : "#121126";
    const stroke = opts.primary ? "#818cf8" : "#1e1b4b";
    const textFill = opts.primary ? "#090814" : "#e4e4e7";
    const weight = opts.primary ? "700" : "600";

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${opts.width} 42" width="${opts.width}" height="42" role="img" aria-label="${esc(opts.label)}">
  <defs>
    <style>
      .sans { font-family: ${FONT_SANS}; }
    </style>
  </defs>
  <rect x="1" y="1" width="${opts.width - 2}" height="40" rx="11" fill="${fill}" stroke="${stroke}" stroke-width="1.4" />
  <text x="${opts.width / 2}" y="25.5" text-anchor="middle" class="sans" font-size="12.5" font-weight="${weight}" fill="${textFill}">${esc(opts.label)}</text>
</svg>
`;
}

function generateReadme(): string {
    const linkedinUrl =
        socialLinks.find((s) => s.platform === "linkedin")?.url ||
        "https://www.linkedin.com/in/minh-hoang-tech/";
    const facebookUrl =
        socialLinks.find((s) => s.platform === "facebook")?.url ||
        "https://www.facebook.com/daylaminhne2901/";

    return `<!-- AUTO-GENERATED FROM ../portfolio/src/lib/data.ts — Run \`bun run generate\` to sync -->

<div align="center">
  <a href="${PORTFOLIO_URL}">
    <img src="./assets/hero.svg" alt="${personalInfo.name} — ${personalInfo.role}" width="100%" />
  </a>
</div>

<br />

<!-- ===================================================================== -->
<!-- 01 / CAPABILITIES — TECHNICAL STACK BY LAYER                          -->
<!-- ===================================================================== -->

<div align="center">
  <img src="./assets/skills.svg" alt="01 / Capabilities — Technical Stack by Layer" width="100%" />
</div>

<br />

<!-- ===================================================================== -->
<!-- 02 / DISPATCH — CONTACT & LINKS                                       -->
<!-- ===================================================================== -->

<div align="center">
  <img src="./assets/dispatch/header.svg" alt="02 / Dispatch — Start a Conversation" width="100%" />
</div>

<p align="center">
  <a href="${PORTFOLIO_URL}">
    <img src="./assets/dispatch/btn-portfolio.svg" alt="Interactive Portfolio — hoangm960.github.io" height="42" />
  </a>
  &nbsp;
  <a href="mailto:${personalInfo.email}">
    <img src="./assets/dispatch/btn-email.svg" alt="Email ${personalInfo.email}" height="42" />
  </a>
  &nbsp;
  <a href="${linkedinUrl}">
    <img src="./assets/dispatch/btn-linkedin.svg" alt="LinkedIn" height="42" />
  </a>
  &nbsp;
  <a href="${facebookUrl}">
    <img src="./assets/dispatch/btn-facebook.svg" alt="Facebook" height="42" />
  </a>
</p>

<hr />

<p align="center">
  <sub>Designed &amp; Built by <strong><a href="${PORTFOLIO_URL}">${personalInfo.name}</a></strong> · ${CURRENT_YEAR}</sub>
</p>
`;
}

// Write all SVG assets
writeFileSync(join(ASSETS_DIR, "hero.svg"), generateHeroSvg());
writeFileSync(join(ASSETS_DIR, "skills.svg"), generateSkillsSvg());
writeFileSync(join(DISPATCH_DIR, "header.svg"), generateDispatchHeaderSvg());
writeFileSync(
    join(DISPATCH_DIR, "btn-portfolio.svg"),
    generateDispatchButtonSvg({
        label: "Interactive Portfolio · hoangm960.github.io ↗",
        primary: true,
        width: 318,
    }),
);
writeFileSync(
    join(DISPATCH_DIR, "btn-email.svg"),
    generateDispatchButtonSvg({
        label: `✉ ${personalInfo.email}`,
        width: 224,
    }),
);
writeFileSync(
    join(DISPATCH_DIR, "btn-linkedin.svg"),
    generateDispatchButtonSvg({
        label: "in · minh-hoang-tech ↗",
        width: 196,
    }),
);
writeFileSync(
    join(DISPATCH_DIR, "btn-facebook.svg"),
    generateDispatchButtonSvg({
        label: "Facebook ↗",
        width: 132,
    }),
);

writeFileSync(join(ROOT, "README.md"), generateReadme());

console.log(
    `Generated GitHub profile assets from ../portfolio/src/lib/data.ts (${totalProjects} projects, ${totalTechnologies} skills across ${skillCategories.length} layers).`,
);
