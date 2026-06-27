import type { SwiggyAdapter } from "./adapter";
import { mockAdapter } from "./mock-adapter";

/**
 * Selects the Swiggy data source.
 *
 * - "mock" (default): seeded local data, no Swiggy account needed.
 * - "mcp" (later): real Swiggy MCP servers over OAuth 2.1. Not wired yet; the
 *   adapter interface is identical so only this file changes when access lands.
 */
function selectAdapter(): SwiggyAdapter {
  const source = process.env.SWIGGY_DATA_SOURCE ?? "mock";
  if (source === "mcp") {
    throw new Error(
      "SWIGGY_DATA_SOURCE=mcp is not implemented yet. Apply for Swiggy MCP access, then wire a real MCP client here."
    );
  }
  return mockAdapter;
}

export const swiggy: SwiggyAdapter = selectAdapter();

export type { SwiggyAdapter } from "./adapter";
export * from "./types";
