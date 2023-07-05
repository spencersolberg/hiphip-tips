import { HandlerContext } from "$fresh/server.ts";
import { RouteConfig } from "$fresh/server.ts";
import { isHandshake } from "../../../utils/hip2.ts";
// @ts-ignore: Strange error with the import
import { getSubdomainWallets, getOwnerOfDomain } from "../../../utils/kv.ts";

export const config: RouteConfig = {
	routeOverride: "/.well-known/wallets/:symbol",
};

const returnSubdomainAddress = async (
	domain: string,
	symbol: string,
): Promise<Response> => {
	const subdomain = domain.split(".")[0];
	try {
		const wallets = await getSubdomainWallets(subdomain);

		const wallet = wallets.find((wallet) => wallet.symbol === symbol);
		if (!wallet) {
			return new Response(null, { status: 404 });
		}
		return new Response(wallet.address);
	} catch (_err) {
		return new Response(null, { status: 404 });
	}
};

const returnDomainAddress = async (
	domain: string,
	symbol: string,
): Promise<Response> => {
	try {
		const subdomain = await getOwnerOfDomain(domain, "subdomain");
		const wallets = await getSubdomainWallets(subdomain);

		const wallet = wallets.find((wallet) => wallet.symbol === symbol);
		if (!wallet) {
			return new Response(null, { status: 404 });
		}
		return new Response(wallet.address);
	} catch (_err) {
		// console.error(_err);
		return new Response(null, { status: 404 });
	}
};

export const handler = async (
	req: Request,
	ctx: HandlerContext,
): Promise<Response> => {
	const { ICANN_DOMAIN, HANDSHAKE_DOMAIN } = Deno.env.toObject();
	const domain = new URL(req.url).hostname;
	const levels = domain.split(".").reverse();
	const { symbol } = ctx.params;
	// console.log({ domain, levels });

	switch (true) {
		case isHandshake(domain) && levels[0] === HANDSHAKE_DOMAIN: {
			// console.log(`${domain} is a handshake subdomain`);
			return await returnSubdomainAddress(domain, symbol);
		}
		case isHandshake(domain): {
			// console.log(`${domain} is a handshake domain`);
			return await returnDomainAddress(domain, symbol);
		}
		case !isHandshake(domain) &&
			levels.slice(0, 2).reverse().join(".") === ICANN_DOMAIN: {
			// console.log(`${domain} is an icann subdomain`);
			return await returnSubdomainAddress(domain, symbol);
		}
		case !isHandshake(domain): {
			// console.log(`${domain} is an icann domain`);
			return await returnDomainAddress(domain, symbol);
		}
		default: {
			return new Response(null, { status: 404 });
		}
	}
};
