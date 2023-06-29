/// <reference lib="deno.unstable" />

import { assertEquals } from "$std/testing/asserts.ts";

import { createSubdomain, deleteSubdomain } from "../utils/subdomains.ts";
import type { Subdomain } from "../utils/subdomains.ts";

// Deno.test("Create and delete subdomain", async () => {
//   const subdomain = "foobar";
//   const key = await createSubdomain(subdomain);
//   assertEquals(typeof key, "string");

//   // check if subdomain exists
//   let kv = await Deno.openKv();
//   const res = await kv.get<Subdomain>(["subdomains", subdomain]);
//   assertEquals(res.value?.key, key);

//   kv.close();
  
//   // delete subdomain with incorrect key
//   const incorrectKey = "1234567890123456";
//   await deleteSubdomain(subdomain, incorrectKey).catch((err) => {
//     assertEquals(err.message, "Key is incorrect.");
//   });

//   // check if subdomain still exists
//   kv = await Deno.openKv();
//   const res2 = await kv.get<Subdomain>(["subdomains", subdomain]);
//   assertEquals(res2.value?.key, key);

//   kv.close();

//   // delete subdomain with correct key
//   await deleteSubdomain(subdomain, key);

//   // check if subdomain was deleted

//   kv = await Deno.openKv();
//   const res3 = await kv.get<Subdomain>(["subdomains", subdomain]);
//   assertEquals(res3.value, null);

//   kv.close();
  
//   const resources = Deno.resources();
//   // { 0: "stdin", 1: "stdout", 2: "stderr", 3: "fsFile" } etc.

//   // close resources named "database"

//   for (const [rid, name] of Object.entries(resources)) {
//     if (name === "database") {
//       Deno.close(Number(rid));
//     }
//   }

// });