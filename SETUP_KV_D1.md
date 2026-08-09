# Setup KV (Wishlist) + D1 (Purchases) for NicheMaster 2026

## 1. Create KV Namespace (Wishlist)

Create a Cloudflare KV namespace named `nichemaster-kv` and copy its production ID.

## 2. Create D1 Database (Purchases)

```bash
npx wrangler d1 create nichemaster-db
npx wrangler d1 execute nichemaster-db --file=migrations/0001_create_purchases.sql
```

## 3. Bind in wrangler.toml

After the resources exist, add the real IDs:

```toml
[[kv_namespaces]]
binding = "NICHEMASTER_KV"
id = "YOUR_KV_ID_HERE"

[[d1_databases]]
binding = "NICHEMASTER_DB"
database_name = "nichemaster-db"
database_id = "YOUR_D1_ID_HERE"
```

Do not commit API tokens or other secrets.

## 4. Bind in Cloudflare Pages

For the Pages project, add the KV namespace and D1 database bindings under Functions settings using the same binding names:

- `NICHEMASTER_KV`
- `NICHEMASTER_DB`

## 5. Redeploy

```bash
npm run deploy:all
```

The Worker uses KV for authenticated wishlist persistence and D1 for completed purchase records when the bindings are configured.
