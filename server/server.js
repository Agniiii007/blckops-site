// server/server.js
// Node ESM server for BLCK OPS
// - Serves static client build
// - APIs: stats/services/process/portfolio/faqs
// - Collabs CRUD (create requires ADMIN_TOKEN)
// - Lead intake -> Google Sheets (fallback to local JSON)
// - Health + SPA fallback

import "dotenv/config";
import express from "express";
import compression from "compression";
import morgan from "morgan";
import path from "node:path";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { google } from "googleapis";

// Resolve __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

const PORT = Number(process.env.PORT || 3000);
const NODE_ENV = process.env.NODE_ENV || "development";
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "dev-admin-token";

// --- Express app ---
const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "1mb" }));
app.use(compression());
app.use(morgan(NODE_ENV === "production" ? "combined" : "dev"));

// --- Static files ---
// 1) Client build output (esbuild) -> /public
const PUBLIC_DIR = path.join(ROOT, "public");
app.use(express.static(PUBLIC_DIR, { extensions: ["html"] }));

// 2) Optional static assets in /client/static (if you keep any)
const CLIENT_STATIC = path.join(ROOT, "client", "static");
app.use(express.static(CLIENT_STATIC));

// --- Small helpers ---
const dataDir = path.join(ROOT, "server", "data");
async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true }).catch(() => {});
}
async function readJSON(file, fallback = []) {
  try {
    const txt = await fs.readFile(file, "utf8");
    return JSON.parse(txt || "null") ?? fallback;
  } catch {
    return fallback;
  }
}
async function writeJSON(file, data) {
  await ensureDir(path.dirname(file));
  await fs.writeFile(file, JSON.stringify(data, null, 2));
}

// --- Google Sheets client (lazy) ---
let sheetsClient = null;
async function getSheets() {
  if (sheetsClient) return sheetsClient;

  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;
  const sheetId = process.env.GOOGLE_SHEET_ID;

  if (!clientEmail || !privateKey || !sheetId) return null;

  // Handle escaped newlines if provided as single-line env
  privateKey = privateKey.replace(/\\n/g, "\n");

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });
  sheetsClient = { sheets, sheetId };
  return sheetsClient;
}

async function appendLeadToSheet(lead) {
  const client = await getSheets();
  if (!client) return false;

  const tab = process.env.GOOGLE_SHEET_TAB || "Leads";
  const values = [[
    lead.id,
    lead.name,
    lead.email,
    lead.phone || "",
    lead.budget || "",
    lead.message || "",
    lead.createdAt,
    lead.sourceIP || "",
    lead.userAgent || ""
  ]];

  await client.sheets.spreadsheets.values.append({
    spreadsheetId: client.sheetId,
    range: `${tab}!A:A`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values },
  });

  return true;
}

// --- In-memory defaults for simple endpoints ---
const DEFAULT_STATS = { clients: 92, projects: 265, supportHours: 24, satisfaction: 100 };
const DEFAULT_SERVICES = [
  { icon: "📱", title: "Social Media Management", desc: "Content, growth, community engineered for revenue." },
  { icon: "💻", title: "Website Development", desc: "SEO-ready, fast, conversion-optimized." },
  { icon: "🎨", title: "Branding & Design", desc: "Unforgettable identity & assets." },
  { icon: "📊", title: "Digital Marketing", desc: "ROI-obsessed SEO, PPC, email, automation." },
  { icon: "📸", title: "Content Creation", desc: "Shoot, edit, publish for reach & growth." },
  { icon: "🚀", title: "Growth Strategy", desc: "Roadmaps to scale what works." }
];
const DEFAULT_PROCESS = [
  { title: "Discover", desc: "Goals, audience, offer, constraints." },
  { title: "Plan",    desc: "Roadmap, metrics, timelines." },
  { title: "Build",   desc: "Content, site, automation." },
  { title: "Launch",  desc: "Go live, QA, analytics." },
  { title: "Scale",   desc: "Iterate, optimize, grow." }
];
const DEFAULT_FAQS = [
  { q: "How long does SEO take to show results?", a: "Expect traction in 8–12 weeks; strong compounding after 3–6 months. New domains/competitive niches can take longer." },
  { q: "Do you guarantee #1 rankings?", a: "No ethical team can. We guarantee best-practice execution, clear strategy, and measurable growth in traffic, leads and revenue." },
  { q: "What’s included in your SEO?", a: "Technical fixes (CWV, sitemaps, robots, schema), on-page (keywords, internal links, content), content planning, and monthly reporting." },
  { q: "Local SEO & Google Business Profile?", a: "Yes—profile setup/optimization, categories/services, posts, reviews strategy, and citation cleanup for NAP consistency." },
  { q: "Do you build backlinks?", a: "We focus on quality links via content assets, digital PR, partnerships and citations—never spam or paid link farms." },
  { q: "Paid ads vs SEO—what’s better?", a: "SEO compounds and lowers CAC long-term; paid ads are fast for testing and scale. Best results come from combining both." },
  { q: "Content cadence for growth?", a: "Typical: 2–6 SEO pages/mo + supporting posts. Social plans include 10–15 edited videos/mo + posts/stories per scope." },
  { q: "Will the website be SEO-ready and fast?", a: "Yes. Performance-first build, image optimization, caching, schema, clean IA, and Core Web Vitals targets." },
  { q: "Do you integrate analytics & tracking?", a: "GA4, Search Console, events/conversions. Optional: Hotjar/Clarity, Meta/Google/LinkedIn pixels." },
  { q: "Contracts & pricing?", a: "Social: 6–12 months. Websites: 1-year maintenance. Clear scope, timeline and fixed monthly/project fee." },
  { q: "Who owns the assets/code?", a: "You do. All creative, content and code produced for your project are yours upon payment per agreement." },
  { q: "How quickly can we start?", a: "Usually within 3–5 business days after kickoff and access handover." }
];

// A few sample portfolio cards
const DEFAULT_PORTFOLIO = [
  { title: "E-Commerce Revolution", cat: "Web + Marketing", url: "#", img: "https://images.unsplash.com/photo-1520975682031-126340c31f27?q=80&w=1400&auto=format&fit=crop" },
  { title: "Brand Transformation", cat: "Branding + Social", url: "#", img: "https://images.unsplash.com/photo-1545235617-9465d2a55698?q=80&w=1400&auto=format&fit=crop" },
  { title: "Digital Domination", cat: "A–Z Strategy", url: "#", img: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1400&auto=format&fit=crop" },
  { title: "Social Takeover", cat: "Content + Community", url: "#", img: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?q=80&w=1400&auto=format&fit=crop" }
];

// --- Auth middleware ---
function requireAuth(req, res, next) {
  const hdr = req.headers.authorization || "";
  const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : "";
  if (token && token === ADMIN_TOKEN) return next();
  return res.status(401).json({ ok: false, error: "Unauthorized" });
}

// --- Routes ---
// Health
app.get("/healthz", (req, res) => res.json({ ok: true, env: NODE_ENV }));

// Auth check (used by client Shift+L button)
app.get("/api/auth/me", (req, res) => {
  const hdr = req.headers.authorization || "";
  const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : "";
  return res.json({ ok: token && token === ADMIN_TOKEN });
});

// Basic content endpoints
app.get("/api/stats", (req, res) => res.json(DEFAULT_STATS));
app.get("/api/services", (req, res) => res.json(DEFAULT_SERVICES));
app.get("/api/process", (req, res) => res.json(DEFAULT_PROCESS));
app.get("/api/portfolio", (req, res) => res.json(DEFAULT_PORTFOLIO));
app.get("/api/faqs", (req, res) => res.json(DEFAULT_FAQS));

// Collabs storage (file-backed)
const COLLABS_FILE = path.join(dataDir, "collabs.json");

// GET /api/collabs?page=&limit=
app.get("/api/collabs", async (req, res) => {
  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.max(1, Math.min(100, Number(req.query.limit || 12)));
  const all = await readJSON(COLLABS_FILE, []);
  const total = all.length;
  const start = (page - 1) * limit;
  const items = all.slice(start, start + limit);
  res.json({ page, limit, total, items });
});

// POST /api/collabs (admin)
app.post("/api/collabs", requireAuth, async (req, res) => {
  try {
    const { image, caption, tags } = req.body || {};
    if (!image || !caption) return res.status(400).json({ ok: false, error: "Missing image/caption" });
    const all = await readJSON(COLLABS_FILE, []);
    const item = {
      id: `cb_${Date.now()}`,
      image: String(image),
      caption: String(caption),
      tags: Array.isArray(tags) ? tags.slice(0, 12) : [],
      createdAt: new Date().toISOString()
    };
    all.unshift(item);
    await writeJSON(COLLABS_FILE, all);
    res.json({ ok: true, item });
  } catch (e) {
    console.error("[collabs:create]", e);
    res.status(500).json({ ok: false });
  }
});

// Leads -> Google Sheets (fallback to JSON)
const LEADS_FILE = path.join(dataDir, "leads.json");
app.post("/api/lead", async (req, res) => {
  try {
    const { name, email, phone, budget, message } = req.body || {};
    if (!name || !email) return res.status(400).json({ ok: false, error: "Missing name/email" });

    const lead = {
      id: `ld_${Date.now()}`,
      name: String(name).trim(),
      email: String(email).trim(),
      phone: String(phone || "").trim(),
      budget: String(budget || "").trim(),
      message: String(message || "").trim(),
      createdAt: new Date().toISOString(),
      sourceIP: req.headers["x-forwarded-for"] || req.socket.remoteAddress || "",
      userAgent: req.headers["user-agent"] || "",
    };

    let storedToSheets = false;
    try {
      storedToSheets = await appendLeadToSheet(lead);
    } catch (err) {
      console.error("[Sheets] append failed:", err?.message || err);
    }

    if (!storedToSheets) {
      const arr = await readJSON(LEADS_FILE, []);
      arr.push(lead);
      await writeJSON(LEADS_FILE, arr);
    }

    console.log(`[Lead] ${lead.email} ${storedToSheets ? "(sheets)" : "(local)"}`);
    return res.json({ ok: true });
  } catch (e) {
    console.error("[lead]", e);
    return res.status(500).json({ ok: false });
  }
});

// Optional: admin-only read-back of leads (paginate)
app.get("/api/leads", requireAuth, async (req, res) => {
  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.max(1, Math.min(100, Number(req.query.limit || 20)));
  const arr = await readJSON(LEADS_FILE, []);
  const total = arr.length;
  const start = (page - 1) * limit;
  const items = arr.slice(start, start + limit);
  res.json({ page, limit, total, items });
});

// --- SPA fallback (send index.html for non-API routes) ---
app.use((req, res, next) => {
  if (req.method !== "GET") return next();
  if (req.path.startsWith("/api/")) return next();
  // If there's an index.html in /public, serve it
  const indexHtml = path.join(PUBLIC_DIR, "index.html");
  fs.readFile(indexHtml, "utf8")
    .then(html => res.type("html").send(html))
    .catch(() => res.status(404).send("Not Found"));
});

// --- Start server ---
app.listen(PORT, () => {
  console.log(`BLCK OPS running on http://localhost:${PORT}`);
  if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY || !process.env.GOOGLE_SHEET_ID) {
    console.log("[Sheets] Not configured — leads will be saved to server/data/leads.json");
  } else {
    console.log("[Sheets] Configured — leads will append to Google Sheets");
  }
});
