import { HandlerContext } from "$fresh/server.ts";
import type { Security } from "../../../../../../utils/hip2.ts";
import { getAddress } from "../../../../../../utils/hip2.ts";

export const handler = async (
	req: Request,
	ctx: HandlerContext,
): Promise<Response> => {
	const url = new URL(req.url);
	const security: Security =
		(url.searchParams.get("security") as Security) ?? "handshake";

	const { domain, symbol } = ctx.params;
	let address;
	try {
		address = await getAddress(domain, symbol, security);
	} catch (error) {
		return Response.json({ error: error.message }, { status: 404 });
	}

	if (!address) {
		return Response.json(
			{ error: `No ${symbol} address found for ${domain}` },
			{ status: 404 },
		);
	}

	return Response.json({ address });
};
