import { HandlerContext } from "$fresh/server.ts";
import type { Security } from "../../../../../utils/hip2.ts";
import { getSymbols } from "../../../../../utils/hip2.ts";

export const handler = async (
	req: Request,
	ctx: HandlerContext,
): Promise<Response> => {
	const url = new URL(req.url);
	const security: Security =
		(url.searchParams.get("security") as Security) ?? "handshake";

	const { domain } = ctx.params;
	let symbols;
	try {
		symbols = await getSymbols(domain, security);
	} catch (error) {
		return Response.json({ error: error.message }, { status: 404 });
	}

	return Response.json({ symbols });
};
