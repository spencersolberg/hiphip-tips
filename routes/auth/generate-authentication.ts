import { HandlerContext } from "$fresh/server.ts";
import { generateAuthenticationOptions } from "@simplewebauthn/server";

import { getAuthenticators, setChallenge, getUUID } from "../../utils/kv.ts";

export const handler = async (
	req: Request,
	_ctx: HandlerContext,
): Promise<Response> => {
	const host = new URL(req.url).hostname;
	const rpName = Deno.env.get("HANDSHAKE_DOMAIN");
	// const rpID = "hiphiptips";
	const rpID = host;
	const origin = `https://${rpID}`;
	const url = new URL(req.url);
	const subdomain = url.searchParams.get("subdomain");

	if (!subdomain) {
		return Response.json({ error: "missing subdomain" }, { status: 400 });
	}

	let uuid;
	try {
		uuid = await getUUID(subdomain);
	} catch (error) {
		return Response.json({ error: error.message }, { status: 400 });
	}

	const authenticators = await getAuthenticators(subdomain);

	const options = generateAuthenticationOptions({
		allowCredentials: authenticators.map((authenticator) => ({
			id: authenticator.credentialID,
			type: "public-key",
			transports: authenticator.transports,
		})),
		userVerification: "preferred",
	});

	await setChallenge(uuid, options.challenge);

	return Response.json({ ...options, user: { id: uuid } });
};
