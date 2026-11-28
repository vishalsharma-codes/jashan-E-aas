import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter, Routes } from "react-router-dom";
import { createServer } from "vite";

const vite = await createServer({ configFile: "vite.config.ts", server: { middlewareMode: true }, appType: "custom" });
try {
  const { weddingRoutes } = await vite.ssrLoadModule("/src/routes/weddingRoutes.tsx");
  const routes = [
    ["/weddings", "Choose Your Wedding Format"],
    ["/weddings/theme", "Select Your Variant"],
    ["/weddings/luxury/all/functions", "Select Wedding Functions"],
  ];
  for (const [path, expected] of routes) {
    const markup = renderToString(createElement(MemoryRouter, { initialEntries: [path] }, createElement(Routes, null, weddingRoutes)));
    assert.ok(markup.includes(expected), `${path} should render ${expected}`);
    console.log(`Rendered ${path}`);
  }
} finally {
  await vite.close();
}
