import { generateCaddyfile, deleteCaddyfile } from "../utils/caddyfiles.ts";
import { exists } from "$std/fs/mod.ts";
import { assert } from "$std/testing/asserts.ts";

Deno.test("Generate Caddyfile", async () => {
  const domain = "example";
  await generateCaddyfile(domain);

  assert(await exists(`caddyfiles/${domain}.caddyfile`));
});

Deno.test("Delete Caddyfile", async () => {
  const domain = "example";
  await deleteCaddyfile(domain);

  assert(!(await exists(`caddyfiles/${domain}.caddyfile`)));
});