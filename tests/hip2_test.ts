import { assertEquals } from "$std/testing/asserts.ts";

import { getSymbols, getAddress, isHandshake } from "../utils/hip2.ts";

// Deno.test("Get symbols", async () => {
//   const name = "spencersolberg";
//   const symbols = await getSymbols(name, "handshake");

//   assertEquals(symbols, ["HNS", "BTC"]);

//   const name2 = "spencersolberg.com";
//   const symbols2 = await getSymbols(name2, "handshake");

//   assertEquals(symbols2, []);

//   const daneSymbols2 = await getSymbols(name2, "dane");

//   console.log({daneSymbols2});

//   assertEquals(daneSymbols2, []);

//   const caSymbols2 = await getSymbols(name2, "ca");

//   assertEquals(caSymbols2, ["HNS", "BTC"]);
// });

Deno.test("Successful handshake symbols", async () => {
  const name = "spencersolberg";
  const symbols = await getSymbols(name, "handshake");

  assertEquals(symbols, ["HNS", "BTC"]);
});

Deno.test("Successful handshake address", async () => {
  const name = "spencersolberg";
  const symbol = "HNS";
  const address = await getAddress(name, symbol, "handshake");

  assertEquals(address, "hs1qqsc065xcsh68nt25h4vsmgx7vcyrwtajlhlxlc");
});

Deno.test("Unsuccessful handshake symbols", async () => {
  const name = "spencersolberg.com";
  const symbols = await getSymbols(name, "handshake");

  assertEquals(symbols, []);
});

Deno.test("Unsuccessful handshake address", async () => {
  const name = "spencersolberg.com";
  const symbol = "HNS";
  const address = await getAddress(name, symbol, "handshake");

  assertEquals(address, undefined);
});

// Deno.test("Successful DANE symbols", async () => {
//   const name = "spencer.hip2.org";
//   const symbols = await getSymbols(name, "dane");

//   assertEquals(symbols, ["HNS"]);
// })

// Deno.test("Successful DANE address", async () => {
//   const name = "spencer.hip2.org";
//   const symbol = "HNS";
//   const address = await getAddress(name, symbol, "dane");

//   assertEquals(address, "hs1qqsc065xcsh68nt25h4vsmgx7vcyrwtajlhlxlc");
// })

// Deno.test("Unsuccessful DANE symbols", async () => {
//   const name = "spencersolberg.com";
//   const symbols = await getSymbols(name, "dane");

//   assertEquals(symbols, []);
// })

// Deno.test("Unsuccessful DANE address", async () => {
//   const name = "spencersolberg.com";
//   const symbol = "HNS";
//   const address = await getAddress(name, symbol, "dane");

//   assertEquals(address, undefined);
// })

Deno.test("Successful CA symbols", async () => {
  const name = "spencersolberg.com";
  const symbols = await getSymbols(name, "ca");

  assertEquals(symbols, ["HNS", "BTC"]);
});

Deno.test("Successful CA address", async () => {
  const name = "spencersolberg.com";
  const symbol = "HNS";
  const address = await getAddress(name, symbol, "ca");

  assertEquals(address, "hs1qqsc065xcsh68nt25h4vsmgx7vcyrwtajlhlxlc");
});

Deno.test("Unsuccessful CA symbols", async () => {
  const name = "solberg.freeshell.org";
  const symbols = await getSymbols(name, "ca");

  assertEquals(symbols, []);
});

Deno.test("Unsuccessful CA address", async () => {
  const name = "solberg.freeshell.org";
  const symbol = "HNS";
  const address = await getAddress(name, symbol, "ca");

  assertEquals(address, undefined);
});

// Deno.test("Get address", async () => {
//   const name = "spencersolberg";
//   const symbol = "HNS";
//   const address = await getAddress(name, symbol, "handshake");

//   assertEquals(address, "hs1qqsc065xcsh68nt25h4vsmgx7vcyrwtajlhlxlc");
// })

Deno.test("Is Handshake", () => {
  const name = "spencersolberg";
  const isHandshakeName = isHandshake(name);

  assertEquals(isHandshakeName, true);

  const name2 = "spencersolberg.com";
  const isHandshakeName2 = isHandshake(name2);

  assertEquals(isHandshakeName2, false);
})