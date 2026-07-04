import express from 'express'

const app  = express()
const PORT = process.env.PORT || 3000

const RESELLER_ID = process.env.RESELLERCLUB_RESELLER_ID
const API_KEY     = process.env.RESELLERCLUB_API_KEY
const PROXY_SECRET = process.env.PROXY_SECRET

const RC_BASE = 'https://httpapi.com/api'

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Verify proxy secret so only our Vercel functions can use this proxy
app.use((req, res, next) => {
  if (req.headers['x-proxy-secret'] !== PROXY_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  next()
})

// Health check (no auth needed)
app.get('/health', (req, res) => res.json({ ok: true }))

// Forward any request to ResellerClub
// POST /proxy?path=/domains/available.json
// Body: { params: { ... } }  for GET requests
// Body: { params: { ... } }  for POST requests
app.all('/proxy', async (req, res) => {
  const path   = req.query.path
  const method = (req.query.method || 'GET').toUpperCase()

  if (!path) return res.status(400).json({ error: 'path query param required' })

  const auth = { 'auth-userid': RESELLER_ID, 'api-key': API_KEY }
  const params = { ...auth, ...(req.body?.params || {}) }

  try {
    let response

    if (method === 'GET') {
      const qs = new URLSearchParams()
      for (const [k, v] of Object.entries(params)) {
        if (Array.isArray(v)) v.forEach(i => qs.append(k, i))
        else qs.append(k, String(v))
      }
      response = await fetch(`${RC_BASE}${path}?${qs}`)
    } else {
      const body = new URLSearchParams()
      for (const [k, v] of Object.entries(params)) {
        if (Array.isArray(v)) v.forEach(i => body.append(k, i))
        else body.append(k, String(v))
      }
      response = await fetch(`${RC_BASE}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      })
    }

    const text = await response.text()
    try {
      const data = JSON.parse(text)
      return res.json(data)
    } catch {
      return res.status(502).json({ error: `ResellerClub returned non-JSON: ${text.slice(0, 300)}` })
    }
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`))
