import { generateRegistrationOptions } from "@simplewebauthn/server";
import { HandlerContext } from "$fresh/server.ts";

import {
	subdomainExists,
	setChallenge,
	checkSubdomain,
} from "../../utils/kv.ts";

// GET Request with subdomain query parameter
export const handler = async (
	req: Request,
	_ctx: HandlerContext,
): Promise<Response> => {
	const host = new URL(req.url).hostname;
	const rpName = "hiphiptips";
	// const rpID = "hiphiptips";
	const rpID = host;
	const origin = `https://${rpID}`;
	const url = new URL(req.url);
	const subdomain = url.searchParams.get("subdomain");
	if (!subdomain) {
		return new Response("missing subdomain", { status: 400 });
	}

	try {
		await checkSubdomain(subdomain);
	} catch (error) {
		return Response.json({ error: error.message }, { status: 400 });
	}

	// if (subdomain.length > 63) {
	//   return new Response("subdomain too long", { status: 400 });
	// }
	// if (!subdomain.match(/^[a-z0-9-]+$/)) {
	//   return new Response("subdomain contains invalid characters", { status: 400 });
	// }
	// if (await subdomainExists(subdomain)) {
	//   // console.log("subdomain already exists")
	//   return new Response("subdomain already exists", { status: 400 });
	// }

	// Generate random UUID
	const uuid = crypto.randomUUID();

	// Generate registration options
	const options = generateRegistrationOptions({
		rpName,
		rpID,
		attestationType: "none",
		userName: subdomain,
		userID: uuid,
		userDisplayName: `${subdomain}.${Deno.env.get("HANDSHAKE_DOMAIN")}`,
	});

	// store challenge in KV
	await setChallenge(uuid, options.challenge);

	// return registration options
	return Response.json(options);
};
