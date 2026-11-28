import assert from "node:assert/strict";
import { createServer } from "vite";

const vite = await createServer({ configFile: "vite.config.ts", server: { middlewareMode: true }, appType: "custom" });
try {
  const taxonomy = await vite.ssrLoadModule("/src/lib/weddingTaxonomy.ts");
  assert.equal(taxonomy.FORMATS.length, 6, "expected six formats");
  assert.equal(taxonomy.FUNCTIONS.length, 14, "expected fourteen functions");
  assert.equal(taxonomy.SERVICES.length, 33, "expected thirty-three services");

  const expectedIds = Array.from({ length: 33 }, (_, i) => i + 1);
  assert.deepEqual([...taxonomy.SERVICES].map((service) => service.id).sort((a, b) => a - b), expectedIds, "service ids must be exactly 1..33");
  const groupIds = taxonomy.SERVICE_GROUPS.map((group) => group.id);
  assert.equal(new Set(groupIds).size, groupIds.length, "group ids must be unique");
  for (const service of taxonomy.SERVICES) {
    assert.equal(groupIds.filter((id) => id === service.group).length, 1, `service ${service.id} must belong to exactly one group`);
  }

  const noVariantIds = taxonomy.FORMATS.filter((format) => format.variants.length === 0).map((format) => format.id).sort();
  assert.deepEqual(noVariantIds, ["budget", "eco", "luxury"], "only luxury, budget, and eco should skip variants");
  console.log("Wedding taxonomy sanity checks passed: 6 formats, 14 functions, 33 services, unique ids/groups, and expected variant skips.");
} finally {
  await vite.close();
}
