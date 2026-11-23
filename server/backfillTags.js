// =====================================================================
// server/backfillTags.js
// One-off script: tags existing portfolio photos that have not been tagged.
// Run from the project root: node server/backfillTags.js
// =====================================================================
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getSupabase, tagPortfolioRow } from './aiTools.js';

// aiTools reads these keys lazily, so load server/.env before first use.
dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '.env') });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const { data: rows, error } = await getSupabase()
  .from('vendor_portfolio')
  .select('id, title')
  .is('ai_tagged_at', null)
  .not('image_url', 'is', null)
  .limit(500);

if (error) {
  console.error('Could not read vendor_portfolio:', error.message);
  process.exit(1);
}

console.log(`Tagging ${rows.length} photo(s)...`);
let ok = 0;
let failed = 0;

for (const row of rows) {
  try {
    const out = await tagPortfolioRow(row.id);
    ok += 1;
    console.log(`OK   ${row.id}  ${row.title ?? ''}  ->  ${(out.ai_tags || []).slice(0, 5).join(', ')}`);
  } catch (e) {
    failed += 1;
    console.log(`FAIL ${row.id}  ${e.message}`);
  }
  await sleep(700); // stay under Gemini rate limits
}

console.log(`Done. Tagged: ${ok}, failed: ${failed}`);
