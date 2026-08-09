-- NicheMaster 2026 - Purchase tracking
CREATE TABLE IF NOT EXISTS purchases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  book_id INTEGER NOT NULL,
  user_email TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  payment_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'completed',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_purchases_book_id ON purchases(book_id);
CREATE INDEX IF NOT EXISTS idx_purchases_email ON purchases(user_email);
CREATE INDEX IF NOT EXISTS idx_purchases_created_at ON purchases(created_at);
