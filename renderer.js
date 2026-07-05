// Renders a published site from its config_json into a complete HTML page.
// Kept dependency-free so it can run anywhere.

const THEMES = {
  'portfolio-dark':  { bg: '#0a0a0f', card: '#16161f', text: '#e5e7eb', muted: '#9ca3af', accentFallback: '#8b5cf6', dark: true },
  'business-clean':  { bg: '#ffffff', card: '#f8fafc', text: '#0f172a', muted: '#475569', accentFallback: '#2563eb', dark: false },
  'saas-launch':     { bg: '#0f1023', card: '#1a1b36', text: '#e5e7eb', muted: '#94a3b8', accentFallback: '#6366f1', dark: true },
  'blog-minimal':    { bg: '#fafaf9', card: '#ffffff', text: '#1c1917', muted: '#57534e', accentFallback: '#292524', dark: false },
  'ecommerce-store': { bg: '#ffffff', card: '#f0fdf4', text: '#14532d', muted: '#4d7c0f', accentFallback: '#059669', dark: false },
  'restaurant-menu': { bg: '#1c1410', card: '#2a1f18', text: '#fef3c7', muted: '#d6bfa3', accentFallback: '#f59e0b', dark: true },
}

function esc(s = '') {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export function renderSite({ config = {}, templateSlug = 'business-clean', siteName = 'My Website' }) {
  const t       = THEMES[templateSlug] ?? THEMES['business-clean']
  const accent  = config.theme?.primary || t.accentFallback
  const biz     = config.business ?? {}
  const hero    = config.hero ?? {}
  const about   = config.about ?? {}
  const contact = config.contact ?? {}
  const services = Array.isArray(config.services) ? config.services.filter(s => s?.title) : []

  const name    = esc(biz.name || siteName)
  const tagline = esc(biz.tagline || '')

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${name}${tagline ? ' — ' + tagline : ''}</title>
<meta name="description" content="${esc(hero.subheading || tagline || name)}">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: ${t.bg}; color: ${t.text}; line-height: 1.6; }
  .wrap { max-width: 1000px; margin: 0 auto; padding: 0 24px; }
  header { padding: 20px 0; border-bottom: 1px solid ${t.dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}; }
  header .wrap { display: flex; align-items: center; justify-content: space-between; }
  .logo { font-weight: 800; font-size: 20px; color: ${t.text}; text-decoration: none; }
  .logo span { color: ${accent}; }
  nav a { color: ${t.muted}; text-decoration: none; margin-left: 24px; font-size: 15px; }
  nav a:hover { color: ${accent}; }
  .hero { padding: 96px 0; text-align: center; }
  .hero h1 { font-size: clamp(32px, 6vw, 56px); font-weight: 800; line-height: 1.15; margin-bottom: 16px; }
  .hero h1 em { color: ${accent}; font-style: normal; }
  .hero p { font-size: 19px; color: ${t.muted}; max-width: 620px; margin: 0 auto 32px; }
  .btn { display: inline-block; background: ${accent}; color: #fff; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 16px; }
  .btn:hover { opacity: 0.9; }
  section { padding: 72px 0; }
  section h2 { font-size: 32px; font-weight: 800; margin-bottom: 20px; text-align: center; }
  .about p { font-size: 17px; color: ${t.muted}; max-width: 700px; margin: 0 auto; text-align: center; }
  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; margin-top: 40px; }
  .card { background: ${t.card}; border-radius: 14px; padding: 28px; border: 1px solid ${t.dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}; }
  .card h3 { font-size: 18px; margin-bottom: 8px; color: ${accent}; }
  .card p { color: ${t.muted}; font-size: 15px; }
  .contact { text-align: center; background: ${t.card}; }
  .contact a { color: ${accent}; text-decoration: none; font-size: 17px; }
  .contact p { color: ${t.muted}; margin-top: 8px; }
  footer { padding: 32px 0; text-align: center; color: ${t.muted}; font-size: 14px; border-top: 1px solid ${t.dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}; }
</style>
</head>
<body>
<header>
  <div class="wrap">
    <a class="logo" href="#">${name}<span>.</span></a>
    <nav>
      ${about.text ? '<a href="#about">About</a>' : ''}
      ${services.length ? '<a href="#services">Services</a>' : ''}
      ${contact.email || contact.phone ? '<a href="#contact">Contact</a>' : ''}
    </nav>
  </div>
</header>

<div class="hero">
  <div class="wrap">
    <h1>${hero.heading ? esc(hero.heading) : `Welcome to <em>${name}</em>`}</h1>
    ${hero.subheading ? `<p>${esc(hero.subheading)}</p>` : tagline ? `<p>${tagline}</p>` : ''}
    ${contact.email ? `<a class="btn" href="mailto:${esc(contact.email)}">${esc(hero.cta_text || 'Get in Touch')}</a>` : ''}
  </div>
</div>

${about.text ? `
<section class="about" id="about">
  <div class="wrap">
    <h2>About</h2>
    <p>${esc(about.text)}</p>
  </div>
</section>` : ''}

${services.length ? `
<section id="services">
  <div class="wrap">
    <h2>What We Offer</h2>
    <div class="grid">
      ${services.map(s => `
      <div class="card">
        <h3>${esc(s.title)}</h3>
        <p>${esc(s.desc || '')}</p>
      </div>`).join('')}
    </div>
  </div>
</section>` : ''}

${contact.email || contact.phone || contact.address ? `
<section class="contact" id="contact">
  <div class="wrap">
    <h2>Contact</h2>
    ${contact.email ? `<a href="mailto:${esc(contact.email)}">${esc(contact.email)}</a>` : ''}
    ${contact.phone ? `<p>${esc(contact.phone)}</p>` : ''}
    ${contact.address ? `<p>${esc(contact.address)}</p>` : ''}
  </div>
</section>` : ''}

<footer>
  <div class="wrap">© ${new Date().getFullYear()} ${name}. All rights reserved.</div>
</footer>
</body>
</html>`
}

export function renderComingSoon(siteName = 'This site') {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Coming Soon</title>
<style>body{font-family:-apple-system,sans-serif;background:#0f172a;color:#e2e8f0;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;text-align:center}h1{font-size:32px;margin-bottom:8px}p{color:#64748b}</style>
</head><body><div><h1>🚧 Coming Soon</h1><p>${siteName} is under construction.</p></div></body></html>`
}
