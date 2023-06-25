import { assertEquals } from "$std/testing/asserts.ts";

import { getName, getColor, getInfo, validateAddress } from "../utils/coins.ts";

// Deno.test("Get symbols", async () => {
//   const name = "spencersolberg";
//   const symbols = await getSymbols(name);

//   assertEquals(symbols, ["HNS", "BTC"]);
// });

Deno.test("Get name", () => {
  const symbol = "HNS";
  const name = getName(symbol);

  assertEquals(name, "Handshake");
});

Deno.test("Get color", () => {
  const symbol = "HNS";
  const color = getColor(symbol);

  assertEquals(color, "#000000");
});

Deno.test("Get info", () => {
  const symbol = "HNS";
  const info = getInfo(symbol);

  assertEquals(info, {
    symbol: "HNS",
    color: "#000000",
    name: "Handshake",
    pattern: "hs1[a-z02-9]{39,87}"
  });
});

Deno.test("Validate address", () => {
  const symbol = "HNS";
  const goodAddress = "hs1qqsc065xcsh68nt25h4vsmgx7vcyrwtajlhlxlc";
  const badAddress = "Ahahaha111";

  const good = validateAddress(symbol, goodAddress);
  const bad = validateAddress(symbol, badAddress);

  assertEquals(good, true);
  assertEquals(bad, false);
})