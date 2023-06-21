import { assertEquals } from "$std/testing/asserts.ts";

import { getSymbols, getAddress } from "../utils/hip2.ts";

Deno.test("Get symbols", async () => {
  const name = "spencersolberg";
  const symbols = await getSymbols(name);

  assertEquals(symbols, ["HNS", "BTC"]);
});

Deno.test("Get address", async () => {
  const name = "spencersolberg";
  const symbol = "HNS";
  const address = await getAddress(name, symbol);

  assertEquals(address, "hs1qqsc065xcsh68nt25h4vsmgx7vcyrwtajlhlxlc");
})