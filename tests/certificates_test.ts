import {
	generateCertificate,
	deleteCertificate,
	generateTlsaRecord,
} from "../utils/certificates.ts";
import { exists } from "$std/fs/mod.ts";
import { assert } from "$std/testing/asserts.ts";

Deno.test("Generate certificate", async () => {
	const domain = "example";
	await generateCertificate(domain);

	assert(await exists(`certificates/${domain}.key`));
	assert(await exists(`certificates/${domain}.crt`));
	assert(!(await exists(`certificates/${domain}.cnf`)));
});

Deno.test("Generate TLSA record", async () => {
	const domain = "example";
	const tlsaRecord = await generateTlsaRecord(domain);

	assert(tlsaRecord.startsWith("3 1 1"));
});

Deno.test("Delete certificate", async () => {
	const domain = "example";
	await deleteCertificate(domain);

	assert(!(await exists(`certificates/${domain}.key`)));
	assert(!(await exists(`certificates/${domain}.crt`)));
});
