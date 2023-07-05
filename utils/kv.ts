import type { AuthenticatorDevice } from "@simplewebauthn/typescript-types";
import { isoBase64URL } from "@simplewebauthn/server/helpers";
import {
	generateSlug,
	RandomWordOptions,
	totalUniqueSlugs as _totalUniqueSlugs,
} from "random-word-slugs";
import { isHandshake } from "./hip2.ts";
import { verifyMessage } from "./hsd.ts";
import { createZone, deleteZone } from "./pdns.ts";

export interface Subdomain {
	uuid: string;
	wallets: Wallet[];
}

export interface Wallet {
	symbol: string;
	address: string;
}

export interface NamedAuthenticatorDevice extends AuthenticatorDevice {
	name: string;
}

export interface Domain {
	type: "handshake" | "icann";
	signable: boolean;
	name: string;
	verified: boolean;
	setup: boolean;
	message: string;
	signature?: string;
	verificationRecord: DNSRecord;
	setupRecords?: DNSRecord[];
}

export interface DNSRecord {
	type: "NS" | "DS" | "TXT";
	data: string;
}

const kv = await Deno.openKv();

export const saveNewUserAuthenticator = async (
	uuid: string,
	authenticator: AuthenticatorDevice,
) => {
	await kv.set(
		["authenticators", uuid],
		[{ ...authenticator, name: generateAuthenticatorName() }],
	);
};

export const subdomainExists = async (subdomain: string): Promise<boolean> => {
	const res = await kv.get(["subdomains", subdomain]);
	if (res.value) {
		return true;
	}
	return false;
};

export const createSubdomain = async (
	subdomain: string,
	uuid: string,
): Promise<void> => {
	if (typeof subdomain !== "string") {
		throw new Error("your subdomain must be a string");
	}

	await checkSubdomain(subdomain);

	await kv.set(["subdomains", subdomain], { uuid, wallets: [] });
};

export const getAuthenticators = async (
	subdomain: string,
): Promise<AuthenticatorDevice[]> => {
	const res = await kv.get<Subdomain>(["subdomains", subdomain]);
	if (!res.value) {
		throw new Error("Subdomain does not exist.");
	}
	const uuid = res.value.uuid;
	const authenticators = await kv.get<NamedAuthenticatorDevice[]>([
		"authenticators",
		uuid,
	]);
	if (!authenticators.value) {
		throw new Error("No authenticators found.");
	}
	return authenticators.value;
};

export const setChallenge = async (
	uuid: string,
	challenge: string,
): Promise<void> => {
	await kv.set(["challenges", uuid], challenge);

	setTimeout(async () => {
		try {
			await kv.delete(["challenges", uuid]);
		} catch (error) {
			console.error("Failed to delete challenge:", error);
		}
	}, 5 * 60 * 1000);
};

export const getChallenge = async (uuid: string): Promise<string> => {
	const res = await kv.get<string>(["challenges", uuid]);
	if (!res.value) {
		throw new Error("Challenge does not exist.");
	}
	return res.value;
};

export const getUUID = async (subdomain: string): Promise<string> => {
	const res = await kv.get<Subdomain>(["subdomains", subdomain]);
	if (!res.value) {
		throw new Error("Subdomain does not exist.");
	}
	return res.value.uuid;
};

export const getAuthenticator = async (
	uuid: string,
	credentialID: string,
): Promise<NamedAuthenticatorDevice> => {
	const res = await kv.get<NamedAuthenticatorDevice[]>([
		"authenticators",
		uuid,
	]);
	if (!res.value) {
		throw new Error("No authenticators found.");
	}
	let authenticator;

	for (const _authenticator of res.value) {
		// this function's credentialID is a string, but the authenticator's credentialID is a Uint8Array
		// so we'll use the isoBase64URL function to convert the Uint8Array to a string

		const _credentialID = isoBase64URL.fromBuffer(_authenticator.credentialID);
		// console.log( { _credentialID, credentialID } );

		if (_credentialID === credentialID) {
			authenticator = _authenticator;
			break;
		}
	}
	if (!authenticator) {
		throw new Error("Authenticator does not exist.");
	}
	return authenticator;
};

export const updateAuthenticatorCounter = async (
	uuid: string,
	_authenticator: AuthenticatorDevice,
	newCounter: number,
): Promise<void> => {
	const res = await kv.get<AuthenticatorDevice[]>(["authenticators", uuid]);
	if (!res.value) {
		throw new Error("No authenticators found.");
	}
	const authenticators = res.value;
	const index = authenticators.findIndex(
		(authenticator) =>
			new TextDecoder().decode(authenticator.credentialID) ===
			new TextDecoder().decode(_authenticator.credentialID),
	);
	if (index === -1) {
		throw new Error("Authenticator does not exist.");
	}
	authenticators[index].counter = newCounter;
	await kv.set(["authenticators", uuid], authenticators);
};

export const getSubdomain = async (uuid: string): Promise<string> => {
	const iter = await kv.list<Subdomain>({ prefix: ["subdomains"] });
	for await (const { key, value } of iter) {
		if (value.uuid === uuid) {
			return key[1] as string;
		}
	}
	throw new Error("Subdomain does not exist.");
};

export const deleteSubdomain = async (subdomain: string): Promise<void> => {
	const res = await kv.get<Subdomain>(["subdomains", subdomain]);
	if (!res.value) {
		throw new Error("Subdomain does not exist.");
	}
	await kv.delete(["subdomains", subdomain]);
};

export const addSubdomainWallet = async (
	subdomain: string,
	wallet: Wallet,
): Promise<void> => {
	const res = await kv.get<Subdomain>(["subdomains", subdomain]);
	if (!res.value) {
		throw new Error("Subdomain does not exist.");
	}
	const _subdomain = res.value;
	_subdomain.wallets.push(wallet);
	await kv.set(["subdomains", subdomain], _subdomain);
};

export const deleteSubdomainWallet = async (
	subdomain: string,
	symbol: string,
): Promise<void> => {
	const res = await kv.get<Subdomain>(["subdomains", subdomain]);
	if (!res.value) {
		throw new Error("Subdomain does not exist.");
	}
	const _subdomain = res.value;
	const index = _subdomain.wallets.findIndex(
		(wallet) => wallet.symbol === symbol,
	);
	if (index === -1) {
		throw new Error("Wallet does not exist.");
	}
	_subdomain.wallets.splice(index, 1);
	await kv.set(["subdomains", subdomain], _subdomain);
};

export const getSubdomainWallets = async (
	subdomain: string,
): Promise<Wallet[]> => {
	const res = await kv.get<Subdomain>(["subdomains", subdomain]);
	if (!res.value) {
		throw new Error("Subdomain does not exist.");
	}
	return res.value.wallets;
};

export const changeSubdomain = async (
	subdomain: string,
	newSubdomain: string,
): Promise<void> => {
	const res = await kv.get<Subdomain>(["subdomains", subdomain]);
	if (!res.value) {
		throw new Error("Subdomain does not exist.");
	}

	await checkSubdomain(newSubdomain);

	const _subdomain = res.value;
	await kv
		.atomic()
		.delete(["subdomains", subdomain])
		.set(["subdomains", newSubdomain], _subdomain)
		.commit();
};

export const checkSubdomain = async (subdomain: string): Promise<boolean> => {
	// check if subdomain is valid and not taken
	const res = await kv.get<Subdomain>(["subdomains", subdomain]);
	if (res.value) {
		throw new Error("that subdomain is taken");
	}

	// if subdomain has characters except a-Z, 0-9, and - throw error
	if (!subdomain.match(/^[a-z0-9-]+$/)) {
		throw new Error(
			"your subdomain must only contain lowercase letters, numbers, and hyphens",
		);
	}

	// if subdomain is longer than 63 characters throw error
	if (subdomain.length > 63) {
		throw new Error("your subdomain must be less than 63 characters");
	}

	return true;
};

const generateAuthenticatorName = (): string => {
	const options: RandomWordOptions<3> = {
		format: "title",
		partsOfSpeech: ["adjective", "adjective", "noun"],
		categories: {
			adjective: [
				"appearance",
				"color",
				"condition",
				"personality",
				"taste",
				"touch",
				"quantity",
			],
			noun: ["animals"],
		},
	};
	return generateSlug(3, options);
};

export const renameAuthenticator = async (
	uuid: string,
	oldName: string,
	newName: string,
): Promise<void> => {
	await checkAuthenticatorName(uuid, newName);

	const res = await kv.get<NamedAuthenticatorDevice[]>([
		"authenticators",
		uuid,
	]);
	if (!res.value) {
		throw new Error("No authenticators found.");
	}
	const authenticators = res.value;
	const index = authenticators.findIndex(
		(authenticator) => authenticator.name === oldName,
	);
	if (index === -1) {
		throw new Error("Authenticator does not exist.");
	}
	authenticators[index].name = newName;
	await kv.set(["authenticators", uuid], authenticators);
};

export const deleteAuthenticator = async (
	uuid: string,
	name: string,
): Promise<void> => {
	const res = await kv.get<NamedAuthenticatorDevice[]>([
		"authenticators",
		uuid,
	]);
	if (!res.value) {
		throw new Error("No authenticators found.");
	}
	const authenticators = res.value;

	if (authenticators.length < 2) {
		throw new Error(
			"You must have at least one authenticator. You can delete your account instead.",
		);
	}
	const index = authenticators.findIndex(
		(authenticator) => authenticator.name === name,
	);
	if (index === -1) {
		throw new Error("Authenticator does not exist.");
	}
	authenticators.splice(index, 1);
	await kv.set(["authenticators", uuid], authenticators);
};

const checkAuthenticatorName = async (
	uuid: string,
	name: string,
): Promise<boolean> => {
	// check if name is valid and not taken
	const res = await kv.get<NamedAuthenticatorDevice[]>([
		"authenticators",
		uuid,
	]);
	if (!res.value) {
		throw new Error("No authenticators found.");
	}
	const authenticators = res.value;
	const index = authenticators.findIndex(
		(authenticator) => authenticator.name === name,
	);
	if (index !== -1) {
		throw new Error("that authenticator name is taken");
	}

	// if name has characters except a-Z (upper or lowercase), 0-9, -, spaces, and parantheses, throw error
	if (!name.match(/^[a-zA-Z0-9-() ]+$/)) {
		throw new Error(
			"your authenticator name must only contain letters, numbers, hyphens, spaces, and parantheses",
		);
	}

	// if name is longer than 20 characters throw error
	if (name.length > 20) {
		throw new Error("your authenticator name must be 20 characters or less");
	}

	return true;
};

export const addAuthenticator = async (
	uuid: string,
	authenticator: AuthenticatorDevice,
): Promise<void> => {
	const res = await kv.get<NamedAuthenticatorDevice[]>([
		"authenticators",
		uuid,
	]);
	if (!res.value) {
		throw new Error("No authenticators found.");
	}
	const authenticators = res.value;
	const name = generateAuthenticatorName();
	authenticators.push({ ...authenticator, name });
	await kv.set(["authenticators", uuid], authenticators);
};

export const validateDomain = async (
	domain: string,
	uuid: string,
): Promise<Domain> => {
	if (!isHandshake(domain)) {
		throw new Error("only Handshake domains are supported right now");
	}
	// if domain is not TLD, throw error
	if (domain.split(".").length > 1) {
		throw new Error("only TLDs are supported right now");
	}

	// if domain longer than 63 characters, throw error
	if (domain.length > 63) {
		throw new Error("domain too long");
	}

	// if domain has characters other than a-z, -, or 0-9, throw error
	if (!/^[a-z0-9-]+$/.test(domain)) {
		throw new Error("domain contains invalid characters");
	}

	// if domain already exists in ["domains", uuid], throw error
	const res = await kv.get<Domain[]>(["domains", uuid]);
	// loop through domains and check if domain exists
	if (res.value) {
		const domains = res.value;
		const index = domains.findIndex((domainObj) => domainObj.name === domain);
		if (index !== -1) {
			throw new Error("domain already exists");
		}
	}

	// if domain is verified from another account, throw error
	const iter = await kv.list<Domain[]>({ prefix: ["domains"] });
	for await (const { key, value } of iter) {
		// loop through value (domains) and check if domain matches AND is verified
		if (value) {
			const index = value.findIndex(
				(domainObj) => domainObj.name === domain && domainObj.verified,
			);
			if (index !== -1 && key[1] !== uuid) {
				throw new Error("domain already verified from another account");
			}
		}
	}

	const newDomain: Domain = {
		name: domain,
		verified: false,
		setup: false,
		type: "handshake",
		signable: true,
		message: `${Deno.env.get("HANDSHAKE_DOMAIN")}/ ${uuid}`,
		verificationRecord: {
			type: "TXT",
			data: `${Deno.env.get("HANDSHAKE_DOMAIN")}/ ${uuid}`,
		},
	};

	return newDomain;
};

export const createDomain = async (
	domain: Domain,
	uuid: string,
): Promise<void> => {
	const res = await kv.get<Domain[]>(["domains", uuid]);
	const domains = res.value ?? [];
	domains.push(domain);
	await kv.set(["domains", uuid], domains);
};

export const getDomains = async (uuid: string): Promise<Domain[]> => {
	const res = await kv.get<Domain[]>(["domains", uuid]);

	return res.value || [];
};

export const getDomain = async (
	uuid: string,
	domainName: string,
): Promise<Domain> => {
	const res = await kv.get<Domain[]>(["domains", uuid]);
	const domains = res.value ?? [];
	const domain = domains.find((d) => d.name === domainName);

	if (!domain) {
		throw new Error(`no domain ${domainName} for uuid ${uuid}`);
	}

	return domain;
};

export const verifyDomainWithSignature = async (
	uuid: string,
	domainName: string,
	signature: string,
): Promise<Domain> => {
	const res = await kv.get<Domain[]>(["domains", uuid]);
	const domains = res.value;
	if (!domains) {
		throw new Error(`no domains found for uuid ${uuid}`);
	}

	const domain = domains.find((d) => d.name === domainName && !d.verified);

	if (!domain) {
		throw new Error(
			`domain ${domainName} is already verified or does not exist`,
		);
	}

	const verified = await verifyMessage(domainName, domain.message, signature);

	if (!verified) {
		throw new Error("invalid signature");
	}

	const filteredDomains = domains.filter((d) => d.name !== domainName);

	const setupRecords = await createZone(domainName);

	const newDomain: Domain = {
		...domain,
		verified,
		signature,
		setupRecords,
	};

	await kv.set(["domains", uuid], [...filteredDomains, newDomain]);

	return newDomain;
};

export const confirmDomainSetup = async (
	uuid: string,
	domainName: string,
): Promise<Domain> => {
	const res = await kv.get<Domain[]>(["domains", uuid]);
	const domains = res.value;
	if (!domains) {
		throw new Error(`no domains found for uuid ${uuid}`);
	}
	const domain = domains.find((d) => d.name === domainName && d.verified);

	if (!domain) {
		throw new Error(`domain ${domainName} is not verified or does not exist`);
	}

	const filteredDomains = domains.filter((d) => d.name !== domainName);

	const newDomain: Domain = {
		...domain,
		setup: true,
	};

	await kv.set(["domains", uuid], [...filteredDomains, newDomain]);

	return newDomain;
};

export const removeDomain = async (
	uuid: string,
	domainName: string,
): Promise<void> => {
	const res = await kv.get<Domain[]>(["domains", uuid]);
	const domains = res.value ?? [];
	const filteredDomains = domains.filter((d) => d.name !== domainName);

	const deletedDomain = domains.find((d) => d.name === domainName);

	if (deletedDomain?.verified) {
		await deleteZone(domainName);
	}

	await kv.set(["domains", uuid], filteredDomains);
};

type OwnerFormat = "uuid" | "subdomain";

export const getOwnerOfDomain = async (
	domainName: string,
	format: OwnerFormat = "uuid",
): Promise<string> => {
	const iter = await kv.list<Domain[]>({ prefix: ["domains"] });
	let uuid: string | undefined = undefined;
	for await (const {
		key: [_, _uuid],
		value,
	} of iter) {
		const domain = value.find((d) => d.name === domainName && d.verified);
		if (domain) {
			uuid = _uuid as string;
		}
	}

	if (!uuid) {
		throw new Error(`no owner found for domain ${domainName}`);
	}

	if (format === "uuid") {
		return uuid;
	} else {
		const subdomain = await getSubdomain(uuid);
		return subdomain;
	}
};
