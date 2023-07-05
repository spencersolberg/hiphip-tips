import "$std/dotenv/load.ts";

import { assertEquals } from "$std/testing/asserts.ts";
import { createZone, deleteZone } from "../utils/pdns.ts";

const { PDNS_URL, PDNS_API_KEY } = Deno.env.toObject();

const cleanup = () => {
	const resources = Deno.resources();
	for (const [rid, name] of Object.entries(resources)) {
		if (name === "fetchResponse") {
			Deno.close(Number(rid));
		}
	}
};

Deno.test("Successful PDNS query", async () => {
	const endpoint = `http://${PDNS_URL}/api/v1/servers`;
	const headers = {
		"X-API-Key": PDNS_API_KEY,
	};
	const response = await fetch(endpoint, { headers });

	assertEquals(response.ok, true);

	cleanup();
});

Deno.test("Create zone", async () => {
	const domain = "example";
	const records = await createZone(domain);
	cleanup();
});

Deno.test("Delete zone", async () => {
	const domain = "example";
	await deleteZone(domain);
	cleanup();
});
