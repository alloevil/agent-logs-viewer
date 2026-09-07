// Cross-site request forgery guard for the state-changing API.
//
// AgentXRay has no cookies and no auth, so a CSRF *token* would prove nothing —
// the actual attack is a page on another origin driving the visitor's browser
// to POST at http://127.0.0.1:3800 (rewrite prompts, install library items,
// trigger a backup). Browsers always attach `Origin` (and `Sec-Fetch-Site`) to
// such requests, so the boundary is: unsafe methods are accepted only when the
// request is same-origin or comes from a non-browser client (no Origin header).
//
// Same-origin is decided against the Host the request arrived on, not a fixed
// allow-list, so `HOST=0.0.0.0` LAN deployments keep working from any hostname
// the operator actually serves.

const SAFE = new Set(['GET', 'HEAD', 'OPTIONS']);

function originHost(value) {
  try {
    return new URL(value).host.toLowerCase();
  } catch {
    return null;
  }
}

// Exported for unit tests: returns null when allowed, else a short reason.
function crossSiteReason(req) {
  if (SAFE.has(req.method)) return null;
  const fetchSite = req.get('sec-fetch-site');
  if (fetchSite && fetchSite !== 'same-origin' && fetchSite !== 'none') return `sec-fetch-site=${fetchSite}`;
  const origin = req.get('origin');
  if (origin) {
    const host = originHost(origin);
    if (host !== (req.get('host') || '').toLowerCase()) return `origin ${origin} != host ${req.get('host')}`;
    return null;
  }
  const referer = req.get('referer');
  if (referer) {
    const host = originHost(referer);
    if (host && host !== (req.get('host') || '').toLowerCase()) return `referer ${referer} != host ${req.get('host')}`;
  }
  return null;
}

function csrfGuard(req, res, next) {
  const reason = crossSiteReason(req);
  if (reason) return res.status(403).json({ error: 'cross-site request rejected', reason });
  next();
}

module.exports = { csrfGuard, crossSiteReason };
