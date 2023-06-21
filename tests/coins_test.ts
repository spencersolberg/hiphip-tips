import { assertEquals } from "$std/testing/asserts.ts";

import { getName, getColor, getInfo } from "../utils/coins.ts";

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
  });
});