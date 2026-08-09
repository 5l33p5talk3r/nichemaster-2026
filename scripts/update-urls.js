#!/usr/bin/env node
// Update storefront API/domain references before deployment.
// Usage: LIVE_DOMAIN=nichemaster.pages.dev node scripts/update-urls.js

import fs from 'fs';

const domain = (process.env.LIVE_DOMAIN || process.argv[2] || '').replace(/^https?:\/\//, '').replace(/\/$/, '');
if (!domain) {
  console.error('Please provide LIVE_DOMAIN env var or as an argument');
  process.exit(1);
}

const files = ['config.js', 'index.html', 'product.html', 'thank-you.html'];
const old = /https:\/\/nichemaster-store\.slottzn45\.workers\.dev/g;
let updated = 0;

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  const content = fs.readFileSync(file, 'utf8');
  const next = content.replace(old, `https://${domain}`);
  if (next !== content) {
    fs.writeFileSync(file, next);
    console.log(`✓ Updated ${file}`);
    updated++;
  }
}

console.log(`\nDone. Updated ${updated} files to use https://${domain}`);
