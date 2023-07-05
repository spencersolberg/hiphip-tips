import type { DNSRecord } from "./kv.ts";

export const getRecords = async (domain: string): Promise<DNSRecord[]> => {
	const { HNSD_HOST, HNSD_PORT } = Deno.env.toObject();

	const args = [
		`@${HNSD_HOST}`,
		"-p",
		`${HNSD_PORT}`,
		"+dnssec",
		"+short",
		domain,
	];

	const nsCmd = new Deno.Command("dig", { args: [...args, "NS"] });
	const dsCmd = new Deno.Command("dig", { args: [...args, "DS"] });

	const outputs = await Promise.all([nsCmd.output(), dsCmd.output()]);

	const nsData = new TextDecoder()
		.decode(outputs[0].stdout)
		.trim()
		.split("\n")[0];
	const dsData = new TextDecoder()
		.decode(outputs[1].stdout)
		.trim()
		.split("\n")[0]
		.toLowerCase()
		.replace(/ (?!.* )/, "");

	const records: DNSRecord[] = [
		{
			type: "NS",
			data: nsData,
		},
		{
			type: "DS",
			data: dsData,
		},
	];

	return records;
};

export const compareRecords = (
	first: DNSRecord[],
	second: DNSRecord[],
): boolean => {
	if (first.length !== second.length) return false;

	for (let i = 0; i < first.length; i++) {
		if (first[i].type !== second[i].type) return false;
		if (first[i].data !== second[i].data) return false;
	}

	return true;
};

export const getTxtRecord = async (domain: string): Promise<DNSRecord> => {
	const { HNSD_HOST, HNSD_PORT, HANDSHAKE_DOMAIN } = Deno.env.toObject();

	const args = [
		`@${HNSD_HOST}`,
		"-p",
		`${HNSD_PORT}`,
		"+dnssec",
		"+short",
		domain,
		"TXT",
	];

	const cmd = new Deno.Command("dig", { args });

	const output = await cmd.output();

	const txtDatas = new TextDecoder()
		.decode(output.stdout)
		.trim()
		.split("\n")
		.map((txtData) => txtData.replace(/"/g, ""));

	// find the TXT record that starts with ${HANDSHAKE_DOMAIN}=
	const txtData = txtDatas.find((txtData) =>
		txtData.startsWith(`${HANDSHAKE_DOMAIN}=`),
	);

	if (!txtData) {
		throw new Error("TXT record not found");
	}

	const record: DNSRecord = {
		type: "TXT",
		data: txtData,
	};

	return record;
};
