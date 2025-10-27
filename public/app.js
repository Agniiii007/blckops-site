// client/app.js
function qs(sel, root = document) {
  return root.querySelector(sel);
}
function qsa(sel, root = document) {
  return Array.from(root.querySelectorAll(sel));
}
function el(tag, cls, txt) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (txt) e.textContent = txt;
  return e;
}
async function j(url, init) {
  const r = await fetch(url, init);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}
function mountCss() {
  const l = el("link");
  l.rel = "stylesheet";
  l.href = "/styles.css";
  document.head.appendChild(l);
}
function makeReactive(node) {
  node.classList.add("reactive");
  const overlay = document.createElement("span");
  overlay.className = "reactive-overlay";
  overlay.setAttribute("aria-hidden", "true");
  overlay.innerHTML = node.innerHTML;
  node.appendChild(overlay);
  const move = (e) => {
    const r = node.getBoundingClientRect();
    node.style.setProperty("--rx", e.clientX - r.left + "px");
    node.style.setProperty("--ry", e.clientY - r.top + "px");
  };
  node.addEventListener("mousemove", move);
  node.addEventListener("touchmove", (e) => {
    const t = e.touches[0];
    if (t) move(t);
  }, { passive: true });
}
var TOKEN_KEY = "blckops_admin_token";
var getToken = () => localStorage.getItem(TOKEN_KEY) || "";
var setToken = (t) => localStorage.setItem(TOKEN_KEY, t);
async function isAdmin() {
  const token = getToken();
  if (!token) return false;
  try {
    const r = await fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } });
    const jx = await r.json();
    return !!jx.ok;
  } catch {
    return false;
  }
}
async function loginAdmin() {
  const t = prompt("Enter admin token");
  if (!t) return false;
  setToken(t);
  return isAdmin();
}
function brandNav() {
  const nav = el("nav");
  const c = el("div", "container");
  const row = el("div", "nav-row");
  const brand = el("a", "brand");
  brand.href = "#";
  brand.setAttribute("aria-label", "BLCK OPS home");
  const name = el("span", "name");
  name.innerHTML = `BLCK<span class="accent"> OPS</span>`;
  brand.appendChild(name);
  const links = el("ul", "nav-links");
  const items = [
    ["proof", "Proof"],
    ["services", "Services"],
    ["process", "Process"],
    ["portfolio", "Work"],
    ["collabs", "Collabs"],
    ["pricing", "Pricing"],
    ["faqs", "FAQs"],
    ["contact", "Contact"]
  ];
  for (const [id, label] of items) {
    const li = el("li");
    const a = el("a");
    a.href = `#${id}`;
    a.textContent = label;
    a.addEventListener("click", (e) => {
      e.preventDefault();
      qs(`#${id}`)?.scrollIntoView({ behavior: "smooth" });
      setDrawer(false);
    });
    li.appendChild(a);
    links.appendChild(li);
  }
  const right = el("div");
  right.style = "display:flex;align-items:center;gap:10px";
  const cta = el("a", "cta", "Get a Proposal");
  cta.href = "#contact";
  cta.addEventListener("click", (e) => {
    e.preventDefault();
    qs("#contact")?.scrollIntoView({ behavior: "smooth" });
  });
  const burger = el("button", "hamburger", "\u2630");
  burger.setAttribute("aria-label", "Open menu");
  burger.setAttribute("aria-expanded", "false");
  burger.addEventListener("click", () => setDrawer());
  row.append(brand, links, right);
  right.append(cta, burger);
  c.appendChild(row);
  nav.appendChild(c);
  document.body.appendChild(nav);
  window.addEventListener("scroll", () => nav.classList.toggle("scrolled", window.scrollY > 100), { passive: true });
  const drawer = el("aside", "drawer");
  drawer.setAttribute("aria-label", "Mobile menu");
  drawer.setAttribute("aria-hidden", "true");
  const nav2 = el("nav");
  for (const [id, label] of items) {
    const a2 = el("a");
    a2.href = `#${id}`;
    a2.textContent = label;
    a2.addEventListener("click", (e) => {
      e.preventDefault();
      qs(`#${id}`)?.scrollIntoView({ behavior: "smooth" });
      setDrawer(false);
    });
    nav2.appendChild(a2);
  }
  drawer.appendChild(nav2);
  document.body.appendChild(drawer);
  function setDrawer(toggle) {
    const open = toggle ?? !drawer.classList.contains("open");
    drawer.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
    drawer.setAttribute("aria-hidden", String(!open));
  }
  makeReactive(name);
}
function hero() {
  const header = el("header", "hero");
  header.id = "top";
  const bg = el("div", "hero-bg");
  bg.setAttribute("aria-hidden", "true");
  bg.append(el("div", "floating f1"), el("div", "floating f2"), el("div", "floating f3"));
  const c = el("div", "container");
  const wrap = el("div");
  wrap.style = "text-align:center";
  const h = el("h1");
  h.innerHTML = `Your Digital Partner<br/>for Content, Websites & Automation`;
  makeReactive(h);
  wrap.append(
    (() => {
      const p = el("div", "eyebrow");
      p.innerHTML = `<span class="badge">End-to-End Growth Partner</span>`;
      return p;
    })(),
    h,
    el("p", "", "\u201CLights, camera, growth\u2014expert video creation, editing, SEO-ready websites, and digital marketing for brands that want results.\u201D"),
    (() => {
      const actions = el("div", "actions");
      const a = el("a", "btn", "Start Your Project");
      a.href = "#contact";
      a.addEventListener("click", (e) => {
        e.preventDefault();
        qs("#contact")?.scrollIntoView({ behavior: "smooth" });
      });
      const b = el("a", "btn alt", "See Services");
      b.href = "#services";
      b.addEventListener("click", (e) => {
        e.preventDefault();
        qs("#services")?.scrollIntoView({ behavior: "smooth" });
      });
      actions.append(a, b);
      return actions;
    })()
  );
  c.appendChild(wrap);
  header.append(bg, c);
  requestAnimationFrame(() => header.classList.add("ready"));
  return header;
}
function counter(node, target, ms = 1e3) {
  const start = 0, t0 = performance.now();
  const step = (t) => {
    const p = Math.min(1, (t - t0) / ms);
    const v = Math.floor(start + (target - start) * (1 - Math.pow(1 - p, 3)));
    node.textContent = String(v);
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
var PROOF_STATS_DEFAULT = { clients: 28, projects: 34, satisfaction: 100 };
function proofStatsFromQuery(base = PROOF_STATS_DEFAULT) {
  const u = new URL(location.href);
  const getN = (k) => u.searchParams.get(k) ? Number(u.searchParams.get(k)) : void 0;
  return {
    clients: getN("clients") ?? base.clients,
    projects: getN("projects") ?? base.projects,
    satisfaction: getN("sat") ?? base.satisfaction
  };
}
function sectionProof(stats) {
  const s = { ...PROOF_STATS_DEFAULT, ...stats || {} };
  const sec = el("section", "proof");
  sec.id = "proof";
  const c = el("div", "container");
  const h2 = el("h2", "title");
  h2.innerHTML = `Why <span class="accent">BLCK OPS</span>`;
  const sub = el("p", "subtitle", "Built for speed. Engineered for growth. Content + Web + Automation under one roof.");
  const statsGrid = el("div", "stats");
  (() => {
    const card = el("div", "stat");
    const num = el("div", "num", "0");
    card.append(num, el("div", "", "Active Clients"));
    statsGrid.appendChild(card);
    counter(num, Number(s.clients) || 0);
  })();
  (() => {
    const card = el("div", "stat");
    const num = el("div", "num", "0");
    card.append(num, el("div", "", "Web & Campaign Ships"));
    statsGrid.appendChild(card);
    counter(num, Number(s.projects) || 0);
  })();
  (() => {
    const card = el("div", "stat");
    const num = el("div", "num", "24/7");
    card.append(num, el("div", "", "Support"));
    statsGrid.appendChild(card);
  })();
  (() => {
    const card = el("div", "stat");
    const num = el("div", "num", "0");
    card.append(num, el("div", "", "% Satisfaction"));
    statsGrid.appendChild(card);
    counter(num, Number(s.satisfaction) || 0);
  })();
  const logos = el("div", "proof-logos");
  ["D2C", "SaaS", "Creator", "Local", "B2B", "Healthcare"].forEach((t) => logos.append(el("span", "badge", t)));
  c.append(h2, sub, statsGrid, logos);
  sec.appendChild(c);
  return sec;
}
function sectionServices(items) {
  const sec = el("section", "services");
  sec.id = "services";
  const c = el("div", "container");
  const h2 = el("h2", "title");
  h2.innerHTML = `<span class="accent">Services</span> A\u2013Z`;
  const sub = el("p", "subtitle", "Content, websites (SEO-ready or budget), automations (link-in-bio to CRM), design, and growth.");
  const grid = el("div", "grid");
  (items || []).forEach((s) => {
    const card = el("div", "card");
    card.append(el("div", "icon", s.icon), el("h3", "", s.title), el("p", "", s.desc));
    grid.appendChild(card);
  });
  c.append(h2, sub, grid);
  sec.appendChild(c);
  return sec;
}
function sectionProcess(steps) {
  const sec = el("section", "process");
  sec.id = "process";
  const c = el("div", "container");
  const h2 = el("h2", "title");
  h2.innerHTML = `Proven <span class="accent">Process</span>`;
  const sub = el("p", "subtitle", "Speed to value. Weekly momentum. Compounding growth.");
  const wrap = el("div", "process-steps");
  (steps || []).forEach((st) => {
    const s = el("div", "step");
    s.append(el("h4", "", st.title), el("p", "", st.desc));
    wrap.appendChild(s);
  });
  c.append(h2, sub, wrap);
  sec.appendChild(c);
  return sec;
}
function sectionPortfolio(items) {
  const sec = el("section", "portfolio");
  sec.id = "portfolio";
  const c = el("div", "container");
  const h2 = el("h2", "title");
  h2.innerHTML = `Recent <span class="accent">Wins</span>`;
  const sub = el("p", "subtitle", "Built for impact. Engineered for results.");
  const marquee = el("div", "marquee");
  const track = el("div", "track");
  const data = items || [];
  function buildRow(arr) {
    const frag = document.createDocumentFragment();
    arr.forEach((p) => {
      const card = el("a", "item");
      card.href = p.url;
      card.setAttribute("aria-label", p.title);
      const img = el("img");
      img.src = p.img;
      img.alt = "";
      img.loading = "lazy";
      const ov = el("div", "overlay");
      ov.append(el("h3", "", p.title), el("p", "", p.cat));
      card.append(img, ov);
      frag.appendChild(card);
    });
    return frag;
  }
  for (let i = 0; i < 3; i++) track.appendChild(buildRow(data));
  marquee.appendChild(track);
  c.append(h2, sub, marquee);
  sec.appendChild(c);
  let x = 0, last = performance.now(), cycleW = 0;
  const DURATION_S = 8;
  let pxPerSec = 50;
  function totalFirstCycleWidth() {
    const children = Array.from(track.children);
    const count = data.length;
    let w = 0;
    for (let i = 0; i < count; i++) {
      w += children[i].getBoundingClientRect().width;
    }
    if (count > 1) w += 22 * (count - 1);
    return w;
  }
  function measure() {
    const need = marquee.getBoundingClientRect().width * 2.2;
    while (track.scrollWidth < need) track.appendChild(buildRow(data));
    cycleW = totalFirstCycleWidth();
    if (cycleW > 0) pxPerSec = cycleW / DURATION_S;
  }
  const onResize = /* @__PURE__ */ (() => {
    let t;
    return () => {
      clearTimeout(t);
      t = setTimeout(measure, 120);
    };
  })();
  window.addEventListener("resize", onResize);
  measure();
  function loop(now) {
    const dt = (now - last) / 1e3;
    last = now;
    x -= pxPerSec * dt;
    if (cycleW > 0 && -x >= cycleW) x += cycleW;
    track.style.transform = `translateX(${x}px)`;
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
  marquee.addEventListener("mouseenter", () => {
    last = performance.now();
  });
  return sec;
}
function sectionCollabs() {
  const sec = el("section", "collabs");
  sec.id = "collabs";
  const c = el("div", "container");
  const h2 = el("h2", "title");
  h2.innerHTML = `Latest <span class="accent">Collabs</span>`;
  const sub = el("p", "subtitle", "Behind-the-scenes, launches, and highlights.");
  const grid = el("div", "collabs-grid");
  c.append(h2, sub, grid);
  sec.appendChild(c);
  let page = 1;
  const limit = 12;
  let loading = false;
  let done = false;
  async function load() {
    if (loading || done) return;
    loading = true;
    try {
      const res = await j(`/api/collabs?page=${page}&limit=${limit}`);
      (res.items || []).forEach(addCard);
      if (page * limit >= res.total) done = true;
      else page += 1;
    } finally {
      loading = false;
    }
  }
  function addCard(item) {
    const card = el("article", "collab-card");
    const img = el("img");
    img.src = item.image;
    img.alt = "";
    img.loading = "lazy";
    const body = el("div", "collab-body");
    const caption = el("div", "collab-caption");
    caption.textContent = item.caption;
    body.append(caption);
    card.append(img, body);
    grid.appendChild(card);
  }
  load();
  const io = new IntersectionObserver((entries) => entries.forEach((ent) => {
    if (ent.isIntersecting) load();
  }), { threshold: 0.1 });
  const sentinel = el("div");
  Object.assign(sentinel.style, { height: "1px", width: "100%" });
  c.appendChild(sentinel);
  io.observe(sentinel);
  return sec;
}
function sectionPricing() {
  const sec = el("section", "pricing");
  sec.id = "pricing";
  const c = el("div", "container");
  const h2 = el("h2", "title");
  h2.innerHTML = `Simple <span class="accent">Pricing</span>`;
  const sub = el("p", "subtitle", "Transparent plans + add-ons. Contracts: 6\u201312 months where noted.");
  const grid = el("div", "pricing-grid");
  const tiers = [
    {
      name: "Social Media Managing",
      price: "\u20B932k\u2013\u20B940k / mo",
      features: [
        "10\u201315 videos shot & edited / month",
        "Posts & stories as per needs",
        "Free menu redesign",
        "Reporting & growth ops",
        "6\u201312 month contract"
      ],
      note: "Logos/extra design billed separately",
      cta: "Start Social"
    },
    {
      name: "SEO-Ready Dynamic Site",
      price: "\u20B955k (yr)",
      features: [
        "Fully dynamic website",
        "Technical SEO essentials",
        "1-year maintenance included",
        "Speed, schema, sitemaps"
      ],
      cta: "Book SEO Site"
    },
    {
      name: "Plain Website",
      price: "\u20B935k (yr)",
      features: [
        "Clean static website",
        "Mobile-first, fast load",
        "1-year maintenance included"
      ],
      cta: "Book Plain Site"
    }
  ];
  const addons = [
    {
      name: "Links & Automations",
      price: "\u20B910k",
      features: ["Instagram + other apps", "Link-in-bio, routing, basic CRM"],
      cta: "Add Automations"
    },
    {
      name: "Registration + Payments",
      price: "\u20B910k\u2013\u20B920k",
      features: ["Form + payment gateway integration", "Confirmation emails, basic dashboard"],
      cta: "Add Registration"
    },
    {
      name: "Custom / User-Specific",
      price: "Custom",
      features: ["Scoped to client needs", "Flexible budget & timeline"],
      cta: "Discuss Scope"
    }
  ];
  function card({ name, price, features, cta, note }) {
    const card2 = el("div", "tier");
    card2.append(el("div", "badge", name), el("div", "price", price));
    const ul = el("ul");
    features.forEach((f) => ul.appendChild(el("li", "", f)));
    if (note) card2.append(el("p", "", note));
    const btn = el("a", "cta", cta);
    btn.href = "#contact";
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      qs("#contact")?.scrollIntoView({ behavior: "smooth" });
    });
    card2.append(ul, btn);
    return card2;
  }
  tiers.forEach((t) => grid.appendChild(card(t)));
  addons.forEach((t) => grid.appendChild(card(t)));
  c.append(h2, sub, grid);
  sec.appendChild(c);
  return sec;
}
function sectionFaq(faqs) {
  const sec = el("section", "faqs");
  sec.id = "faqs";
  const c = el("div", "container");
  const h2 = el("h2", "title");
  h2.innerHTML = `Common <span class="accent">Questions</span>`;
  const wrap = el("div");
  (faqs || []).forEach((f) => {
    const d = el("details", "faq");
    d.append(el("summary", "", f.q), el("p", "", f.a));
    wrap.appendChild(d);
  });
  c.append(h2, wrap);
  sec.appendChild(c);
  return sec;
}
function leadForm() {
  const form = el("form");
  form.noValidate = true;
  form.innerHTML = `
    <div class="grid" style="gap:12px">
      <div class="card" style="min-height:auto"><label>Name<br/><input required name="name" placeholder="Your name" style="width:100%;padding:12px;border-radius:12px;border:1px solid rgba(255,255,255,.12);background:#111;color:#fff"/></label></div>
      <div class="card" style="min-height:auto"><label>Email<br/><input required type="email" name="email" placeholder="you@company.com" style="width:100%;padding:12px;border-radius:12px;border:1px solid rgba(255,255,255,.12);background:#111;color:#fff"/></label></div>
      <div class="card" style="min-height:auto"><label>Phone<br/><input name="phone" placeholder="+91 ..." style="width:100%;padding:12px;border-radius:12px;border:1px solid rgba(255,255,255,.12);background:#111;color:#fff"/></label></div>
      <div class="card" style="min-height:auto"><label>Budget<br/>
        <select name="budget" style="width:100%;padding:12px;border-radius:12px;border:1px solid rgba(255,255,255,.12);background:#111;color:#fff">
          <option value="">Select budget</option>
          <option>Under \u20B950k</option><option>\u20B950k\u2013\u20B91L</option><option>\u20B91L\u2013\u20B93L</option><option>\u20B93L+</option>
        </select>
      </label></div>
      <div class="card" style="grid-column:1/-1;min-height:auto"><label>Goals<br/><textarea name="message" rows="4" placeholder="Tell us what success looks like\u2026" style="width:100%;padding:12px;border-radius:12px;border:1px solid rgba(255,255,255,.12);background:#111;color:#fff"></textarea></label></div>
    </div>
    <div style="margin-top:14px;display:flex;gap:10px;align-items:center">
      <button class="btn" type="submit">Get My Proposal</button>
      <span class="badge">Response in 24h</span>
      <span class="badge">No spam</span>
    </div>
    <p class="visually-hidden" id="formStatus" aria-live="polite"></p>
  `;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const name = String(fd.get("name") || "").trim();
    const email = String(fd.get("email") || "").trim();
    const phone = String(fd.get("phone") || "").trim();
    const budget = String(fd.get("budget") || "").trim();
    const message = String(fd.get("message") || "").trim();
    const status = qs("#formStatus", form);
    if (!name || !email) {
      status.textContent = "Name and email are required.";
      return;
    }
    try {
      await j("/api/lead", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email, phone, budget, message }) });
      status.textContent = "Thanks! We\u2019ll email you a tailored plan shortly.";
      form.reset();
    } catch {
      status.textContent = "Failed to send. Try again.";
    }
  });
  return form;
}
function sectionCTA() {
  const sec = el("section", "cta-section");
  sec.id = "contact";
  const c = el("div", "container");
  const h2 = el("h2", "title");
  h2.innerHTML = `Ready to <span class="accent">Dominate</span> Digital?`;
  const sub = el("p", "subtitle", "Tell us your goals. We\u2019ll reply with a tailored plan, budget ranges, and a timeline.");
  const form = leadForm();
  c.append(h2, sub, form);
  sec.appendChild(c);
  return sec;
}
function footer() {
  const f = el("footer");
  const c = el("div", "container");
  const foot = el("div", "foot");
  const col1 = el("div");
  col1.innerHTML = `<h3>BLCK<span class="accent"> OPS</span></h3><p>Content. Websites. Automation. Growth.</p>
  <div class="social"><a aria-label="Instagram" href="#">\u{1F4F7}</a><a aria-label="Portfolio" href="#">\u{1F4BC}</a><a aria-label="X" href="#">\u{1F426}</a><a aria-label="Facebook" href="#">\u{1F4D8}</a></div>`;
  const col2 = el("div");
  col2.innerHTML = `<h3>Services</h3><a href="#services">Content</a><a href="#services">Websites</a><a href="#services">Automation</a><a href="#services">Growth</a>`;
  const col3 = el("div");
  col3.innerHTML = `<h3>Company</h3><a href="#proof">Why Us</a><a href="#portfolio">Work</a><a href="#pricing">Pricing</a>`;
  const col4 = el("div");
  col4.innerHTML = `<h3>Contact</h3><p>\u{1F4E7} <a href="mailto:blckopssystems@gmail.com">blckopssystems@gmail.com</a></p><p>\u{1F4F1} <a href="tel:+91 85903 86926">+91 85903 86926</a></p>`;
  foot.append(col1, col2, col3, col4);
  const bottom = el("div", "bottom", `\xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} BLCK OPS. All rights reserved.`);
  c.append(foot, bottom);
  f.appendChild(c);
  return f;
}
function particles() {
  const canvas = qs("#bg-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  let w = 0, h = 0;
  const prefersReduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const count = prefersReduce ? 60 : innerWidth < 800 ? 120 : 180;
  const dots = Array.from({ length: count }, () => ({ x: Math.random(), y: Math.random(), vx: (Math.random() - 0.5) * 0.15, vy: (Math.random() - 0.5) * 0.15 }));
  const resize = () => {
    w = innerWidth;
    h = innerHeight;
    canvas.width = w * DPR;
    canvas.height = h * DPR;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  };
  const debounce = (fn, ms) => {
    let t;
    return () => {
      clearTimeout(t);
      t = setTimeout(fn, ms);
    };
  };
  resize();
  window.addEventListener("resize", debounce(resize, 120));
  let raf = 0;
  const loop = () => {
    raf = requestAnimationFrame(loop);
    ctx.clearRect(0, 0, w, h);
    dots.forEach((d) => {
      d.x += d.vx / 100;
      d.y += d.vy / 100;
      if (d.x <= 0 || d.x >= 1) d.vx *= -1;
      if (d.y <= 0 || d.y >= 1) d.vy *= -1;
      const x = d.x * w, y = d.y * h;
      ctx.fillStyle = "#FF3B3F";
      ctx.globalAlpha = 0.9;
      ctx.beginPath();
      ctx.arc(x, y, 1.4, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 0.18;
    for (let i = 0; i < dots.length; i++) {
      for (let j2 = i + 1; j2 < dots.length; j2++) {
        const dx = (dots[i].x - dots[j2].x) * w, dy = (dots[i].y - dots[j2].y) * h;
        const dist = Math.hypot(dx, dy);
        if (dist < 140) {
          ctx.strokeStyle = "rgba(255,59,63,1)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(dots[i].x * w, dots[i].y * h);
          ctx.lineTo(dots[j2].x * w, dots[j2].y * h);
          ctx.stroke();
        }
      }
    }
  };
  if (!prefersReduce) {
    loop();
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else loop();
    });
  }
}
function setupAdminUIOnDemand() {
  let created = false, visible = false;
  let btn, modal, card;
  function ensure() {
    if (created) return;
    btn = el("button", "cta", "\uFF0B Add Collab");
    Object.assign(btn.style, { position: "fixed", right: "20px", bottom: "20px", zIndex: "200", display: "none" });
    modal = el("div");
    Object.assign(modal.style, { position: "fixed", inset: "0", display: "none", placeItems: "center", background: "rgba(0,0,0,.6)", zIndex: "210" });
    card = el("div", "card");
    Object.assign(card.style, { width: "min(560px, 92vw)" });
    card.innerHTML = `
      <h3 style="margin:0 0 10px">New Collab</h3>
      <div class="grid" style="gap:12px">
        <div class="card" style="min-height:auto"><label>Image URL<br/><input id="collab_img" placeholder="https://..." style="width:100%;padding:12px;border-radius:12px;border:1px solid rgba(255,255,255,.12);background:#111;color:#fff"/></label></div>
        <div class="card" style="min-height:auto"><label>Caption<br/><textarea id="collab_cap" rows="3" placeholder="Write a caption\u2026" style="width:100%;padding:12px;border-radius:12px;border:1px solid rgba(255,255,255,.12);background:#111;color:#fff"></textarea></label></div>
        <div class="card" style="min-height:auto"><label>Tags (comma)<br/><input id="collab_tags" placeholder="launch,video,ugc" style="width:100%;padding:12px;border-radius:12px;border:1px solid rgba(255,255,255,.12);background:#111;color:#fff"/></label></div>
      </div>
      <div style="margin-top:12px;display:flex;gap:8px;justify-content:flex-end">
        <button id="collab_cancel" class="btn alt">Cancel</button>
        <button id="collab_save" class="btn">Publish</button>
      </div>
      <p class="visually-hidden" id="collab_status" aria-live="polite"></p>
    `;
    modal.appendChild(card);
    document.body.append(btn, modal);
    const open = () => modal.style.display = "grid";
    const close = () => modal.style.display = "none";
    btn.addEventListener("click", async () => {
      if (!await isAdmin()) {
        const ok = await loginAdmin();
        if (!ok) {
          alert("Invalid token");
          return;
        }
      }
      open();
    });
    card.querySelector("#collab_cancel").addEventListener("click", close);
    card.querySelector("#collab_save").addEventListener("click", async () => {
      const image = (card.querySelector("#collab_img").value || "").trim();
      const caption = (card.querySelector("#collab_cap").value || "").trim();
      const rawTags = (card.querySelector("#collab_tags").value || "").trim();
      const tags = rawTags ? rawTags.split(",").map((s) => s.trim()).filter(Boolean) : void 0;
      const status = card.querySelector("#collab_status");
      if (!image || !caption) {
        status.textContent = "Image URL and caption are required.";
        return;
      }
      try {
        const token = getToken();
        await fetch("/api/collabs", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ image, caption, tags })
        }).then((r) => {
          if (!r.ok) throw new Error(String(r.status));
          return r.json();
        });
        status.textContent = "Published!";
        const grid = qs(".collabs-grid");
        const cardEl = document.createElement("article");
        cardEl.className = "collab-card";
        cardEl.innerHTML = `<img src="${image}" alt="" loading="lazy"/><div class="collab-body"><div class="collab-caption">${caption}</div></div>`;
        grid.insertBefore(cardEl, grid.firstChild);
        close();
      } catch {
        status.textContent = "Failed to publish.";
      }
    });
    created = true;
  }
  function toggle() {
    ensure();
    visible = !visible;
    btn.style.display = visible ? "inline-block" : "none";
    sessionStorage.setItem("adminBtnVisible", visible ? "1" : "0");
  }
  document.addEventListener("keydown", (e) => {
    if (e.shiftKey && (e.key === "L" || e.code === "KeyL")) {
      e.preventDefault();
      toggle();
    }
  });
  if (sessionStorage.getItem("adminBtnVisible") === "1") {
    ensure();
    visible = true;
    btn.style.display = "inline-block";
  }
}
async function main() {
  mountCss();
  brandNav();
  const app = qs("#app") ?? (() => {
    const d = el("div");
    d.id = "app";
    document.body.appendChild(d);
    return d;
  })();
  const proofStats = proofStatsFromQuery(PROOF_STATS_DEFAULT);
  app.append(
    hero(),
    sectionProof(proofStats),
    sectionServices(await j("/api/services").catch(() => [])),
    sectionProcess(await j("/api/process").catch(() => [])),
    sectionPortfolio(await j("/api/portfolio").catch(() => [])),
    sectionCollabs(),
    sectionPricing(),
    sectionFaq(await j("/api/faqs").catch(() => [])),
    sectionCTA(),
    footer()
  );
  particles();
  qsa('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      const t = qs(id);
      if (t) {
        e.preventDefault();
        t.scrollIntoView({ behavior: "smooth" });
      }
    });
  });
  const sr = el("div", "visually-hidden", "Interface ready");
  sr.id = "status";
  sr.setAttribute("aria-live", "polite");
  document.body.appendChild(sr);
  setupAdminUIOnDemand();
}
main().catch((err) => {
  console.error(err);
  alert("App failed to initialize.");
});
//# sourceMappingURL=app.js.map
