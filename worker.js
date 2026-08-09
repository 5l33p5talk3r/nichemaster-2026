/** NicheMaster 2026 - Cloudflare Worker API */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });

    try {
      if (path === '/api/health') {
        const catalog = await catalogCount(env);
        return json({
          status: 'ok',
          service: 'nichemaster-2026',
          ebooks: catalog.total,
          catalogSource: catalog.source,
          timestamp: new Date().toISOString()
        });
      }

      if (path === '/api/books') return listBooks(url, env);
      if (path === '/api/search') return searchBooks(url, env);

      if (path.startsWith('/api/book/')) {
        const id = decodeURIComponent(path.slice('/api/book/'.length));
        if (!id) return json({ error: 'Invalid book ID' }, CORS, 400);
        return getBook(id, env);
      }

      if (path === '/api/wishlist' && request.method === 'POST') {
        const body = await request.json().catch(() => ({}));
        const userId = body.userId || 'anonymous';
        const bookIds = Array.isArray(body.bookIds) ? body.bookIds : [];
        const persisted = Boolean(env.NICHEMASTER_KV && userId !== 'anonymous');
        if (persisted) await env.NICHEMASTER_KV.put(`wishlist:${userId}`, JSON.stringify(bookIds));
        return json({ success: true, userId, bookIds, persisted });
      }

      if ((path === '/api/purchase' || path === '/api/purchases') && request.method === 'POST') {
        return recordPurchase(request, env);
      }

      if (path === '/api/stats') {
        const catalog = await catalogCount(env);
        return json({
          totalEbooks: catalog.total,
          niches: catalog.niches,
          formats: 3,
          lastUpdated: '2026-08-09',
          catalogSource: catalog.source,
          features: ['product-pages', 'covers', 'paypal', 'wishlist', 'new-arrivals']
        });
      }

      return json({
        name: 'NicheMaster 2026 API',
        version: '1.2.0',
        endpoints: ['/api/health', '/api/books', '/api/search', '/api/book/:id', '/api/wishlist', '/api/purchase', '/api/stats']
      }, CORS, 404);
    } catch (error) {
      console.error(error);
      return json({ error: 'Internal server error' }, CORS, 500);
    }
  }
};

async function listBooks(url, env) {
  const page = Math.max(parseInt(url.searchParams.get('page') || '1', 10), 1);
  const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') || '24', 10), 1), 100);
  const offset = (page - 1) * limit;
  const q = (url.searchParams.get('q') || '').trim().toLowerCase();
  const niche = (url.searchParams.get('niche') || '').trim();

  if (!env.NICHEMASTER_DB) {
    return json({ error: 'Catalog database is not configured', page, limit }, CORS, 503);
  }

  const filters = ['status = ?'];
  const params = ['published'];
  if (niche) { filters.push('niche = ?'); params.push(niche); }
  if (q) {
    filters.push('(lower(title) LIKE ? OR lower(description) LIKE ? OR lower(niche) LIKE ? OR lower(category) LIKE ?)');
    const like = `%${q}%`;
    params.push(like, like, like, like);
  }
  const where = filters.join(' AND ');

  const count = await env.NICHEMASTER_DB.prepare(`SELECT COUNT(*) AS total FROM books WHERE ${where}`).bind(...params).first();
  const rows = await env.NICHEMASTER_DB.prepare(`
    SELECT id,title,slug,description,niche,category,price_cents,currency,cover,download,status,tags_json
    FROM books WHERE ${where} ORDER BY title COLLATE NOCASE LIMIT ? OFFSET ?
  `).bind(...params, limit, offset).all();

  return json({
    page,
    limit,
    total: Number(count?.total || 0),
    filters: { niche: niche || null, query: q || null },
    results: (rows.results || []).map(normalizeBook)
  });
}

async function searchBooks(url, env) {
  const q = (url.searchParams.get('q') || '').trim().toLowerCase();
  const niche = (url.searchParams.get('niche') || '').trim();
  const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') || '24', 10), 1), 100);

  if (!q && !niche) return json({ query: '', niche: null, total: 0, results: [] });
  if (!env.NICHEMASTER_DB) return json({ error: 'Catalog database is not configured' }, CORS, 503);

  const filters = ['status = ?'];
  const params = ['published'];
  if (niche) { filters.push('niche = ?'); params.push(niche); }
  if (q) {
    filters.push('(lower(title) LIKE ? OR lower(description) LIKE ? OR lower(niche) LIKE ? OR lower(category) LIKE ?)');
    const like = `%${q}%`;
    params.push(like, like, like, like);
  }
  const where = filters.join(' AND ');
  const rows = await env.NICHEMASTER_DB.prepare(`
    SELECT id,title,slug,description,niche,category,price_cents,currency,cover,download,status,tags_json
    FROM books WHERE ${where} ORDER BY title COLLATE NOCASE LIMIT ?
  `).bind(...params, limit).all();

  return json({ query: q, niche: niche || null, total: rows.results?.length || 0, results: (rows.results || []).map(normalizeBook) });
}

async function getBook(id, env) {
  if (!env.NICHEMASTER_DB) return json({ error: 'Catalog database is not configured' }, CORS, 503);
  const row = await env.NICHEMASTER_DB.prepare(`
    SELECT id,title,slug,description,niche,category,price_cents,currency,cover,download,status,tags_json
    FROM books WHERE id = ? AND status = 'published'
  `).bind(id).first();
  if (!row) return json({ error: 'Book not found' }, CORS, 404);
  return json(normalizeBook(row));
}

async function recordPurchase(request, env) {
  if (!env.NICHEMASTER_DB) return json({ error: 'D1 is not configured' }, CORS, 503);
  const purchase = await request.json().catch(() => null);
  if (!purchase || !purchase.book_id || !purchase.user_email || !Number.isInteger(purchase.amount_cents) || !purchase.payment_id) {
    return json({ error: 'book_id, user_email, amount_cents, and payment_id are required' }, CORS, 400);
  }

  const book = await env.NICHEMASTER_DB.prepare("SELECT id FROM books WHERE id = ? AND status = 'published'").bind(String(purchase.book_id)).first();
  if (!book) return json({ error: 'Book not found' }, CORS, 404);

  try {
    await env.NICHEMASTER_DB.prepare(`
      INSERT INTO purchases (book_id,user_email,amount_cents,currency,payment_id,status)
      VALUES (?,?,?,?,?,?)
    `).bind(
      String(purchase.book_id),
      String(purchase.user_email).trim().toLowerCase(),
      purchase.amount_cents,
      purchase.currency || 'USD',
      String(purchase.payment_id),
      purchase.status || 'completed'
    ).run();
  } catch {
    return json({ error: 'Purchase could not be recorded' }, CORS, 409);
  }

  return json({ success: true, orderId: `NM-${purchase.payment_id}`, redirect: '/thank-you.html' }, CORS, 201);
}

async function catalogCount(env) {
  if (!env.NICHEMASTER_DB) return { total: 0, niches: 0, source: 'unconfigured' };
  try {
    const row = await env.NICHEMASTER_DB.prepare("SELECT COUNT(*) AS total, COUNT(DISTINCT niche) AS niches FROM books WHERE status = 'published'").first();
    return { total: Number(row?.total || 0), niches: Number(row?.niches || 0), source: 'd1' };
  } catch {
    return { total: 0, niches: 0, source: 'd1-error' };
  }
}

function normalizeBook(row) {
  let tags = [];
  try { tags = JSON.parse(row.tags_json || '[]'); } catch { tags = []; }
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description || '',
    niche: row.niche || '',
    category: row.category || '',
    price: Number(row.price_cents || 0) / 100,
    currency: row.currency || 'USD',
    cover: row.cover || null,
    download: row.download || null,
    status: row.status,
    tags
  };
}

function json(data, headers = {}, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...CORS, ...headers }
  });
}
