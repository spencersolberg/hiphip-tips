/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />
/// <reference lib="deno.unstable" />

import "$std/dotenv/load.ts";

import { start } from "$fresh/server.ts";
import manifest from "./fresh.gen.ts";

import twindPlugin from "$fresh/plugins/twind.ts";
import twindConfig from "./twind.config.ts";

let port: number;
if (Deno.env.get("PORT")) {
  port = parseInt(Deno.env.get("PORT")!);
} else {
  port = 8001;
}

await start(manifest, { plugins: [twindPlugin(twindConfig)], port });
