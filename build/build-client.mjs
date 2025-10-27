// blckops/build/build-client.mjs
import { build, context } from "esbuild";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const outdir = join(__dirname, "..", "public");

const css = `/* ==== BLCK OPS Design System ==== */
:root{--primary:#000;--accent:#FF3B3F;--accent-2:#ff6b6e;--text:#fff;--muted:#a0a0a0;--dark-bg:#0a0a0a;--border:rgba(255,59,63,.18)}
*{box-sizing:border-box}html,body{height:100%}body{margin:0;background:var(--primary);color:var(--text);font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Helvetica Neue,Arial;line-height:1.6}
.container{max-width:1400px;margin:0 auto;padding:0 40px;position:relative;z-index:1}
a{text-decoration:none}
.btn,.cta{background:var(--accent);color:var(--text);padding:12px 22px;border-radius:999px;border:2px solid var(--accent);font-weight:800;display:inline-block}
.btn:hover,.cta:hover{transform:translateY(-2px);box-shadow:0 10px 40px rgba(255,59,63,.5)}
.btn.alt{background:transparent;border-color:var(--text)}
.badge{display:inline-block;font-size:12px;padding:4px 10px;border:1px solid var(--border);border-radius:999px;color:var(--muted)}
nav{position:fixed;top:0;width:100%;z-index:100;background:rgba(0,0,0,.78);backdrop-filter:blur(18px);padding:14px 0;border-bottom:1px solid var(--border);transition:all .35s}
nav.scrolled{padding:10px 0;box-shadow:0 6px 40px rgba(255,59,63,.25)}
.nav-row{display:flex;align-items:center;justify-content:space-between;gap:16px}
.brand{display:flex;align-items:center;gap:10px;color:var(--text)}
.name{font-size:26px;font-weight:1000;letter-spacing:-1px;position:relative}
.accent{color:var(--accent)}
.nav-links{display:flex;gap:34px;list-style:none;margin:0;padding:0}
.nav-links a{color:var(--text);font-weight:650;position:relative;padding:4px 0}
.nav-links a::before{content:"";position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:0;height:2px;background:var(--accent);transition:width .25s}
.nav-links a:hover{color:var(--accent)}.nav-links a:hover::before{width:100%}
.hamburger{display:none;background:transparent;border:0;color:var(--text);font-size:26px;cursor:pointer}
.drawer{position:fixed;inset:0 0 0 auto;width:min(88vw,360px);background:#0b0b0b;border-left:1px solid var(--border);transform:translateX(100%);transition:transform .35s;z-index:110;padding:18px 20px}
.drawer.open{transform:none}
.drawer a{display:block;color:var(--text);padding:14px 4px;border-bottom:1px solid rgba(255,255,255,.06)}

.hero{min-height:100svh;display:grid;place-items:center;padding-top:88px;position:relative;overflow:hidden}
.hero-bg{position:absolute;inset:0;z-index:0}
.floating{position:absolute;border:2px solid var(--accent);opacity:.12;animation:float 20s ease-in-out infinite}
.f1{width:300px;height:300px;border-radius:50%;top:10%;left:10%}
.f2{width:220px;height:220px;top:60%;right:14%;transform:rotate(45deg)}
.f3{width:160px;height:160px;border-radius:50%;bottom:18%;left:22%}
@keyframes float{0%,100%{transform:translateY(0) rotate(0)}50%{transform:translateY(-46px) rotate(180deg)}}
.hero .eyebrow{font-size:12px;color:var(--muted);letter-spacing:3px;text-transform:uppercase;margin-bottom:12px}
.hero h1{font-size:clamp(44px,7.2vw,112px);font-weight:1000;letter-spacing:-4px;line-height:1.02;margin:0 0 12px;opacity:0;transform:translateY(24px);transition:.6s}
.hero p{font-size:20px;color:var(--muted);max-width:820px;margin:0 auto 26px;line-height:1.7;opacity:0;transform:translateY(24px);transition:.6s .06s}
.hero .actions{display:flex;gap:12px;flex-wrap:wrap;justify-content:center;opacity:0;transform:translateY(24px);transition:.6s .12s}
.hero.ready h1,.hero.ready p,.hero.ready .actions{opacity:1;transform:none}

section{padding:120px 0;position:relative;z-index:1}
.about,.portfolio,.proof,.collabs{background:var(--dark-bg)}
.services,.process,.pricing,.faqs,.cta-section{background:var(--primary)}
.title{font-size:clamp(36px,5.4vw,82px);font-weight:1000;letter-spacing:-3px;margin:0 0 10px}
.subtitle{font-size:18px;color:var(--muted);max-width:920px;margin:0 0 60px}

.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:24px;margin-top:50px}
.stat{text-align:center;padding:38px 26px;background:linear-gradient(135deg, rgba(255,59,63,.055) 0%, transparent 100%);border-radius:22px;border:2px solid rgba(255,59,63,.12);transition:.8s}
.stat:hover{transform:translateY(-8px);border-color:var(--accent);box-shadow:0 24px 80px rgba(255,59,63,.35)}
.stat .num{font-size:54px;font-weight:1000;color:var(--accent);margin-bottom:6px}

.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:22px}
.card{background:var(--dark-bg);padding:28px;border-radius:20px;border:2px solid rgba(255,59,63,.12);transition:.8s;min-height:160px}
.card:hover{transform:translateY(-6px);box-shadow:0 32px 100px rgba(255,59,63,.45);border-color:var(--accent)}
.card .icon{font-size:36px;margin-bottom:8px}
.card h3{margin:0 0 6px;font-size:20px;font-weight:900}
.card p{margin:0;color:var(--muted)}

/* Portfolio marquee (JS-driven, seamless) */
.portfolio .marquee{overflow:hidden}
.portfolio .track{display:flex;gap:22px;will-change:transform}
.portfolio .item{position:relative;flex:0 0 420px;height:280px;border-radius:20px;overflow:hidden;background:linear-gradient(135deg,var(--dark-bg) 0%,#1a0000 100%);border:2px solid rgba(255,59,63,.22)}
.portfolio .item img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:saturate(1.05) contrast(1.05);opacity:.9}
.portfolio .item .overlay{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:flex-end;padding:20px;background:linear-gradient(180deg,transparent 0%,rgba(0,0,0,.72) 60%,rgba(0,0,0,.92) 100%)}
.portfolio .item h3{margin:0;font-size:20px;font-weight:900}
.portfolio .item p{margin:4px 0 0;color:var(--accent);font-weight:800;font-size:11px;letter-spacing:2px;text-transform:uppercase}

/* Collabs masonry */
.collabs-grid{column-count:3; column-gap:18px}
@media (max-width:1100px){.collabs-grid{column-count:2}}
@media (max-width:700px){.collabs-grid{column-count:1}}
.collab-card{break-inside:avoid; margin:0 0 18px; background:var(--dark-bg); border:2px solid rgba(255,59,63,.12); border-radius:16px; overflow:hidden}
.collab-card img{display:block; width:100%; height:auto}
.collab-body{padding:12px}
.collab-caption{margin:6px 0 0; color:var(--muted); font-size:14px}

/* Process, Pricing, FAQ */
.process-steps{counter-reset:step;display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:18px}
.step{background:rgba(255,255,255,.02);border:1px solid rgba(255,59,63,.15);border-radius:16px;padding:18px}
.step h4{margin:0 0 6px;font-size:18px}
.step::before{counter-increment:step;content:counter(step);display:inline-grid;place-items:center;width:28px;height:28px;border-radius:50%;border:1px solid var(--border);margin-bottom:8px;color:var(--accent)}
.pricing-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:22px;align-items:stretch}
.tier{background:var(--dark-bg);border:2px solid rgba(255,59,63,.12);border-radius:20px;padding:22px;display:flex;flex-direction:column}
.tier .price{font-size:28px;font-weight:900;margin:8px 0}
.tier ul{margin:0;padding:0 0 0 18px;color:var(--muted);flex:1}
.tier .cta{width:100%;text-align:center;margin-top:14px}
.faq{border-bottom:1px solid rgba(255,255,255,.08);padding:14px 0}
.faq summary{cursor:pointer;font-weight:700}
.faq p{color:var(--muted)}

footer{background:var(--dark-bg);padding:70px 0 34px;border-top:2px solid rgba(255,59,63,.22)}
.foot{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:34px;margin-bottom:34px}
.foot h3{margin:0 0 10px;font-size:20px;font-weight:900}
.social{display:flex;gap:12px;margin-top:8px}
.social a{width:40px;height:40px;border-radius:50%;display:grid;place-items:center;background:rgba(255,59,63,.1);border:2px solid rgba(255,59,63,.22)}
.bottom{text-align:center;padding-top:24px;color:var(--muted);border-top:1px solid rgba(255,59,63,.12);font-size:13px}

/* Reactive spotlight FIX (overlay clone preserves <br/>) */
.reactive{position:relative}
.reactive-overlay{position:absolute;inset:0;pointer-events:none;color:transparent;background:radial-gradient(140px at var(--rx,-999px) var(--ry,-999px), var(--accent) 0%, transparent 60%);-webkit-background-clip:text;background-clip:text;opacity:0;transition:opacity .15s}
.reactive:hover .reactive-overlay{opacity:1}

#bg-canvas{position:fixed;inset:0;z-index:0;opacity:.32;pointer-events:none}
@media (max-width:920px){.nav-links{display:none}.hamburger{display:inline-block}.container{padding:0 20px}.btn,.cta{padding:12px 18px}}
.visually-hidden{position:absolute!important;height:1px;width:1px;overflow:hidden;clip:rect(1px,1px,1px,1px);white-space:nowrap}
`;

async function writeCss(){ await mkdir(outdir,{recursive:true}); await writeFile(join(outdir,"styles.css"),css,"utf8"); }

async function run({watch,prod}) {
  await writeCss();
  const options = {
    entryPoints:["client/app.js"],
    bundle:true,
    minify:prod,
    sourcemap:!prod,
    outfile:join(outdir,"app.js"),
    target:"es2022",
    format:"esm",
  };
  if (watch){ const ctx = await context(options); await ctx.watch(); console.log("[esbuild] watching client..."); }
  else { await build(options); console.log("[esbuild] built client"); }
}
const watch = process.argv.includes("--watch");
const prod = process.argv.includes("--prod");
await run({watch,prod});
